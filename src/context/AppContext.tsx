import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { 
  Product, 
  Brand, 
  CartItem, 
  Order, 
  OrderStatus, 
  Reward, 
  RewardRedemption, 
  DeliveryAddress, 
  UserProfile, 
  ViewRole, 
  CustomerTab, 
  ProfileSubTab,
  ProductCategory,
  AuthSession
} from '../types';
import { 
  INITIAL_BRANDS, 
  INITIAL_PRODUCTS, 
  INITIAL_REWARDS, 
  INITIAL_USER, 
  INITIAL_ADDRESSES, 
  INITIAL_ORDERS, 
  INITIAL_REDEMPTIONS 
} from '../data/mockData';

export const MAX_PROFILE_IMAGE_SIZE_MB = 10;
const MAX_PROFILE_IMAGE_SIZE_BYTES = MAX_PROFILE_IMAGE_SIZE_MB * 1024 * 1024;

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface RegisteredAccount {
  role: ViewRole;
  email: string;
  password: string;
  name: string;
  phone?: string;
  sellerBrandId?: string;
}

interface SupabaseProfileRecord {
  name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  points_balance: number | null;
  total_points_earned: number | null;
  total_points_redeemed: number | null;
  favorite_product_ids: string[] | null;
  favorite_brand_ids: string[] | null;
  notifications_enabled: boolean | null;
}

interface SupabaseCustomerAccountData {
  addresses: unknown;
  orders: unknown;
  redemptions: unknown;
  cart: unknown;
}

interface SupabaseManagedOrderRecord {
  order_data: unknown;
}

const PRODUCT_IMAGE_VERSION_KEY = 'ecocommune_product_image_version';
const PRODUCT_IMAGE_VERSION = 'pexels-1';
const GUEST_ACCOUNT_ID = '__guest__';
const DEMO_ACCOUNT_ID = INITIAL_USER.email.toLowerCase();

const getActiveAccountId = (session: AuthSession): string | null => {
  if (session.isAuthenticated && session.email.trim()) {
    return session.email.trim().toLowerCase();
  }
  return session.isGuest ? GUEST_ACCOUNT_ID : null;
};

const getAccountCollectionStorageKey = (storageKey: string, accountId: string) =>
  `${storageKey}_account_${encodeURIComponent(accountId)}`;

const loadAccountCollection = <T,>(
  accountId: string | null,
  storageKey: string,
  legacyStorageKey: string,
  demoValues: T[]
): T[] => {
  if (!accountId || accountId === GUEST_ACCOUNT_ID) return [];

  const accountStorageKey = getAccountCollectionStorageKey(storageKey, accountId);
  try {
    const saved = localStorage.getItem(accountStorageKey);
    if (saved) return JSON.parse(saved) as T[];

    if (accountId !== DEMO_ACCOUNT_ID) return [];

    const legacy = localStorage.getItem(legacyStorageKey);
    if (!legacy) return demoValues;

    const migrated = JSON.parse(legacy) as T[];
    localStorage.setItem(accountStorageKey, JSON.stringify(migrated));
    return migrated;
  } catch {
    return accountId === DEMO_ACCOUNT_ID ? demoValues : [];
  }
};

const loadProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem('ecocommune_products');
    if (!saved) return INITIAL_PRODUCTS;

    const savedProducts = JSON.parse(saved) as Product[];
    if (localStorage.getItem(PRODUCT_IMAGE_VERSION_KEY) === PRODUCT_IMAGE_VERSION) {
      return savedProducts;
    }

    const initialProductsById = new Map(INITIAL_PRODUCTS.map((product) => [product.id, product]));
    const updatedProducts = savedProducts.map((product) => {
      const initialProduct = initialProductsById.get(product.id);
      return initialProduct ? { ...product, image: initialProduct.image } : product;
    });
    localStorage.setItem('ecocommune_products', JSON.stringify(updatedProducts));
    localStorage.setItem(PRODUCT_IMAGE_VERSION_KEY, PRODUCT_IMAGE_VERSION);
    return updatedProducts;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

const createAccountProfile = (email: string, name: string, phone = ''): UserProfile => ({
  ...INITIAL_USER,
  name,
  email,
  phone,
  pointsBalance: 0,
  totalPointsEarned: 0,
  totalPointsRedeemed: 0,
  favoriteProductIds: [],
  favoriteBrandIds: []
});

const parseAccountArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? value as T[] : [];

const mergeSupabaseProfile = (
  localProfile: UserProfile,
  remoteProfile: SupabaseProfileRecord | null,
  migrateLocalValues: boolean
): UserProfile => {
  if (!remoteProfile) return localProfile;

  const remoteFavoriteProducts = remoteProfile.favorite_product_ids || [];
  const remoteFavoriteBrands = remoteProfile.favorite_brand_ids || [];
  return {
    ...localProfile,
    name: remoteProfile.name || localProfile.name,
    email: localProfile.email,
    phone: migrateLocalValues && !remoteProfile.phone
      ? localProfile.phone
      : remoteProfile.phone ?? localProfile.phone,
    avatar: remoteProfile.avatar_url || localProfile.avatar,
    pointsBalance: migrateLocalValues && !remoteProfile.points_balance
      ? localProfile.pointsBalance
      : remoteProfile.points_balance ?? localProfile.pointsBalance,
    totalPointsEarned: migrateLocalValues && !remoteProfile.total_points_earned
      ? localProfile.totalPointsEarned
      : remoteProfile.total_points_earned ?? localProfile.totalPointsEarned,
    totalPointsRedeemed: migrateLocalValues && !remoteProfile.total_points_redeemed
      ? localProfile.totalPointsRedeemed
      : remoteProfile.total_points_redeemed ?? localProfile.totalPointsRedeemed,
    favoriteProductIds: migrateLocalValues && remoteFavoriteProducts.length === 0
      ? localProfile.favoriteProductIds
      : remoteFavoriteProducts,
    favoriteBrandIds: migrateLocalValues && remoteFavoriteBrands.length === 0
      ? localProfile.favoriteBrandIds
      : remoteFavoriteBrands,
    notificationsEnabled: migrateLocalValues
      ? localProfile.notificationsEnabled ?? remoteProfile.notifications_enabled ?? true
      : remoteProfile.notifications_enabled ?? localProfile.notificationsEnabled ?? true
  };
};

const loadAccountProfile = (email: string, name?: string, phone?: string, preferProvided = false): UserProfile => {
  const accountEmail = email.trim().toLowerCase();
  const fallbackName = name || (accountEmail === INITIAL_USER.email.toLowerCase()
    ? INITIAL_USER.name
    : accountEmail.split('@')[0] || 'Eco Member');
  const baseProfile = accountEmail === INITIAL_USER.email.toLowerCase()
    ? INITIAL_USER
    : createAccountProfile(accountEmail, fallbackName);

  try {
    const savedProfiles = localStorage.getItem('ecocommune_user_profiles');
    const profiles = savedProfiles
      ? JSON.parse(savedProfiles) as Record<string, Partial<UserProfile>>
      : {};
    let savedProfile: Partial<UserProfile> | undefined = profiles[accountEmail];

    // Migrate the original single-profile data for the built-in demo customer.
    if (!savedProfile && accountEmail === INITIAL_USER.email.toLowerCase()) {
      const legacyProfile = localStorage.getItem('ecocommune_user');
      const candidate = legacyProfile ? JSON.parse(legacyProfile) as Partial<UserProfile> : undefined;
      savedProfile = candidate?.email?.toLowerCase() === accountEmail ? candidate : undefined;
    }

    return {
      ...baseProfile,
      ...savedProfile,
      name: preferProvided ? name || savedProfile?.name || fallbackName : savedProfile?.name || name || fallbackName,
      email: accountEmail,
      phone: preferProvided
        ? phone ?? savedProfile?.phone ?? baseProfile.phone
        : savedProfile?.phone ?? phone ?? baseProfile.phone
    };
  } catch {
    return { ...baseProfile, name: fallbackName, email: accountEmail, phone: phone ?? baseProfile.phone };
  }
};

const loadOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem('ecocommune_orders');
    if (!saved) return INITIAL_ORDERS;

    const savedOrders = JSON.parse(saved) as Order[];
    const ordersWithOwner = savedOrders.map((order) => (
      order.customerEmail ? order : { ...order, customerEmail: DEMO_ACCOUNT_ID }
    ));
    if (ordersWithOwner.some((order, index) => order !== savedOrders[index])) {
      localStorage.setItem('ecocommune_orders', JSON.stringify(ordersWithOwner));
    }
    return ordersWithOwner;
  } catch {
    return INITIAL_ORDERS;
  }
};

interface AppContextType {
  // Navigation & Role
  viewRole: ViewRole;
  setViewRole: (role: ViewRole) => void;
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  profileSubTab: ProfileSubTab;
  setProfileSubTab: (tab: ProfileSubTab) => void;

  // Authentication
  authSession: AuthSession;
  login: (params: {
    role: ViewRole;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    sellerBrandId?: string;
    isSignUp?: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  continueAsGuest: () => void;
  logout: () => void;
  openLoginPage: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  
  // Browsing & Filters
  selectedCategory: ProductCategory | 'All';
  setSelectedCategory: (category: ProductCategory | 'All') => void;
  selectedBrandFilter: string | 'All';
  setSelectedBrandFilter: (brandId: string | 'All') => void;
  brandCollectionId: string | null;
  setBrandCollectionId: (brandId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'newest';
  setSortBy: (sort: 'recommended' | 'price-asc' | 'price-desc' | 'newest') => void;
  
  // Selection Modals
  activeProductModal: Product | null;
  setActiveProductModal: (prod: Product | null) => void;
  activeShopModal: Brand | null;
  setActiveShopModal: (brand: Brand | null) => void;
  selectedMapShopId: string | null;
  setSelectedMapShopId: (id: string | null) => void;

  // Shopping Cart & Checkout
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  orderConfirmation: Order | null;
  setOrderConfirmation: (order: Order | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;
  cartItemCount: number;
  placeOrder: (shippingInfo: { name: string; phone: string; address: string; notes?: string }) => Order;

  // Data Collections
  products: Product[];
  brands: Brand[];
  orders: Order[];
  myOrders: Order[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  user: UserProfile;
  addresses: DeliveryAddress[];
  commissionRate: number; // e.g. 0.10 for 10%
  setCommissionRate: (rate: number) => void;

  // Actions
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteBrand: (brandId: string) => void;
  redeemReward: (rewardId: string) => { success: boolean; message: string };
  updateUserProfile: (
    updates: Partial<UserProfile>,
    avatarFile?: File
  ) => Promise<{ success: boolean; message: string }>;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => void;
  updateAddress: (id: string, address: Partial<DeliveryAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  
  // Seller Actions
  activeSellerBrandId: string;
  setActiveSellerBrandId: (brandId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateBrandProfile: (id: string, updates: Partial<Brand>) => void;

  // Admin Actions
  toggleBrandStatus: (brandId: string, status: 'active' | 'pending_verification' | 'deactivated') => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  resetDemoData: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication & Navigation
  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_auth');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage errors
    }
    return {
      isAuthenticated: false,
      isGuest: false,
      role: 'customer',
      email: '',
      displayName: ''
    };
  });
  const activeAccountId = getActiveAccountId(authSession);
  const activeSupabaseAccountKey = authSession.userId
    ? `${authSession.userId}:${activeAccountId || ''}`
    : null;
  const [loadedAccountId, setLoadedAccountId] = useState(activeAccountId);
  const [loadedSupabaseAccountKey, setLoadedSupabaseAccountKey] = useState<string | null>(null);

  const [viewRole, setViewRole] = useState<ViewRole>(() => authSession.role || 'customer');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('marketplace');
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | 'All'>('All');
  const [brandCollectionId, setBrandCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'newest'>('recommended');

  // Active Modals
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [activeShopModal, setActiveShopModal] = useState<Brand | null>(null);
  const [selectedMapShopId, setSelectedMapShopId] = useState<string | null>(null);

  // Cart & Checkout
  const [cart, setCart] = useState<CartItem[]>(() => {
    return loadAccountCollection<CartItem>(
      activeAccountId,
      'ecocommune_cart',
      'ecocommune_cart',
      []
    );
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<Order | null>(null);

  // Entities stored in localStorage
  const [products, setProducts] = useState<Product[]>(loadProducts);

  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_brands');
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(loadOrders);

  const [rewards, setRewards] = useState<Reward[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_rewards');
      return saved ? JSON.parse(saved) : INITIAL_REWARDS;
    } catch {
      return INITIAL_REWARDS;
    }
  });

  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(() => {
    return loadAccountCollection<RewardRedemption>(
      activeAccountId,
      'ecocommune_redemptions',
      'ecocommune_redemptions',
      INITIAL_REDEMPTIONS
    );
  });

  const [user, setUser] = useState<UserProfile>(() => authSession.isAuthenticated
    ? loadAccountProfile(authSession.email, authSession.displayName)
    : authSession.isGuest
      ? createAccountProfile('', 'Guest')
      : INITIAL_USER);

  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() => {
    return loadAccountCollection<DeliveryAddress>(
      activeAccountId,
      'ecocommune_addresses',
      'ecocommune_addresses',
      INITIAL_ADDRESSES
    );
  });

  const [commissionRate, setCommissionRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_commission_rate');
      return saved ? JSON.parse(saved) : 0.10;
    } catch {
      return 0.10;
    }
  });

  const [activeSellerBrandId, setActiveSellerBrandId] = useState<string>('brand-1');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (loadedAccountId === activeAccountId) return;

    setCart(loadAccountCollection<CartItem>(
      activeAccountId,
      'ecocommune_cart',
      'ecocommune_cart',
      []
    ));
    setRedemptions(loadAccountCollection<RewardRedemption>(
      activeAccountId,
      'ecocommune_redemptions',
      'ecocommune_redemptions',
      INITIAL_REDEMPTIONS
    ));
    setAddresses(loadAccountCollection<DeliveryAddress>(
      activeAccountId,
      'ecocommune_addresses',
      'ecocommune_addresses',
      INITIAL_ADDRESSES
    ));
    setUser(
      authSession.isAuthenticated
        ? loadAccountProfile(authSession.email, authSession.displayName)
        : authSession.isGuest
          ? createAccountProfile('', 'Guest')
          : INITIAL_USER
    );
    setOrderConfirmation(null);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setLoadedAccountId(activeAccountId);
  }, [activeAccountId, authSession.displayName, authSession.email, authSession.isAuthenticated, authSession.isGuest, loadedAccountId]);

  // Sync to localStorage
  useEffect(() => {
    if (!activeAccountId || activeAccountId === GUEST_ACCOUNT_ID || loadedAccountId !== activeAccountId) return;
    localStorage.setItem(
      getAccountCollectionStorageKey('ecocommune_cart', activeAccountId),
      JSON.stringify(cart)
    );
  }, [activeAccountId, cart, loadedAccountId]);

  useEffect(() => {
    localStorage.setItem('ecocommune_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ecocommune_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('ecocommune_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ecocommune_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    if (!activeAccountId || activeAccountId === GUEST_ACCOUNT_ID || loadedAccountId !== activeAccountId) return;
    localStorage.setItem(
      getAccountCollectionStorageKey('ecocommune_redemptions', activeAccountId),
      JSON.stringify(redemptions)
    );
  }, [activeAccountId, loadedAccountId, redemptions]);

  useEffect(() => {
    if (!authSession.isAuthenticated || !authSession.email) return;
    try {
      const savedProfiles = localStorage.getItem('ecocommune_user_profiles');
      const profiles = savedProfiles
        ? JSON.parse(savedProfiles) as Record<string, UserProfile>
        : {};
      profiles[authSession.email.toLowerCase()] = user;
      localStorage.setItem('ecocommune_user_profiles', JSON.stringify(profiles));
    } catch {
      // Keep profile updates available for the current session if storage is unavailable.
    }
  }, [user, authSession.email, authSession.isAuthenticated]);

  useEffect(() => {
    if (!activeAccountId || activeAccountId === GUEST_ACCOUNT_ID || loadedAccountId !== activeAccountId) return;
    localStorage.setItem(
      getAccountCollectionStorageKey('ecocommune_addresses', activeAccountId),
      JSON.stringify(addresses)
    );
  }, [activeAccountId, addresses, loadedAccountId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !authSession.isAuthenticated || !authSession.userId) {
      setLoadedSupabaseAccountKey(null);
      return;
    }
    if (loadedSupabaseAccountKey === activeSupabaseAccountKey || loadedAccountId !== activeAccountId) return;

    const client = supabase;
    const userId = authSession.userId;
    const accountKey = activeSupabaseAccountKey;
    const accountEmail = authSession.email.trim().toLowerCase();
    let isCurrent = true;

    const loadSupabaseAccount = async () => {
      try {
        const [profileResult, accountDataResult] = await Promise.all([
          client
            .from('profiles')
            .select('name, email, phone, avatar_url, points_balance, total_points_earned, total_points_redeemed, favorite_product_ids, favorite_brand_ids, notifications_enabled')
            .eq('id', userId)
            .maybeSingle(),
          client
            .from('customer_account_data')
            .select('addresses, orders, redemptions, cart')
            .eq('user_id', userId)
            .maybeSingle()
        ]);
        if (!isCurrent) return;

        if (profileResult.error || accountDataResult.error) {
          const errorMessage = profileResult.error?.message || accountDataResult.error?.message;
          showToast(
            `Account data could not be loaded from Supabase: ${errorMessage}. Run the latest supabase/profiles.sql in your Supabase SQL Editor.`,
            'error'
          );
          return;
        }

        const savedProfile = profileResult.data as SupabaseProfileRecord | null;
        const savedAccountData = accountDataResult.data as SupabaseCustomerAccountData | null;
        const localProfile = loadAccountProfile(accountEmail, authSession.displayName);
        const migratedOrders = orders.filter(
          (order) => order.customerEmail?.trim().toLowerCase() === accountEmail
        );

        const migratedOrdersWithOwnerId = migratedOrders.map((order) => ({
          ...order,
          customerUserId: order.customerUserId || userId
        }));
        let accountOrders = migratedOrdersWithOwnerId;
        if (savedAccountData) {
          accountOrders = parseAccountArray<Order>(savedAccountData.orders).map((order) => (
            {
              ...order,
              customerEmail: order.customerEmail || accountEmail,
              customerUserId: order.customerUserId || userId
            }
          ));
          setAddresses(parseAccountArray<DeliveryAddress>(savedAccountData.addresses));
          setRedemptions(parseAccountArray<RewardRedemption>(savedAccountData.redemptions));
          setCart(parseAccountArray<CartItem>(savedAccountData.cart));
          setOrders((currentOrders) => [
            ...accountOrders,
            ...currentOrders.filter((order) =>
              order.customerUserId !== userId &&
              order.customerEmail?.trim().toLowerCase() !== accountEmail
            )
          ]);
        } else {
          const { error: migrationError } = await client
            .from('customer_account_data')
            .upsert({
              user_id: userId,
              addresses,
              orders: migratedOrdersWithOwnerId,
              redemptions,
              cart,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          if (!isCurrent) return;
          if (migrationError) {
            showToast(`Your existing account data could not be migrated to Supabase: ${migrationError.message}`, 'error');
            return;
          }
          setOrders((currentOrders) => currentOrders.map((order) =>
            order.customerEmail?.trim().toLowerCase() === accountEmail
              ? { ...order, customerUserId: order.customerUserId || userId }
              : order
          ));
        }

        if (authSession.role === 'seller' || authSession.role === 'admin') {
          const { data: managedOrderRows, error: managedOrdersError } = await client.rpc('get_manageable_orders');
          if (!isCurrent) return;
          if (managedOrdersError) {
            showToast(`Platform orders could not be loaded from Supabase: ${managedOrdersError.message}`, 'error');
          } else {
            const managedOrders = parseAccountArray<SupabaseManagedOrderRecord>(managedOrderRows)
              .map((row) => row.order_data as Order);
            setOrders((currentOrders) => [
              ...managedOrders,
              ...currentOrders.filter((order) =>
                !managedOrders.some((managedOrder) => managedOrder.id === order.id)
              )
            ]);
          }
        }

        let accountProfile = mergeSupabaseProfile(localProfile, savedProfile, !savedAccountData);
        if (!savedProfile?.avatar_url && accountProfile.avatar.startsWith('data:image/')) {
          try {
            const avatarResponse = await fetch(accountProfile.avatar);
            const avatarBlob = await avatarResponse.blob();
            const extensionByType: Record<string, string> = {
              'image/jpeg': 'jpg',
              'image/png': 'png',
              'image/webp': 'webp'
            };
            const extension = extensionByType[avatarBlob.type];
            if (!extension || avatarBlob.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
              throw new Error(`The saved profile photo must be JPEG, PNG, or WebP and no larger than ${MAX_PROFILE_IMAGE_SIZE_MB} MB.`);
            }

            const avatarPath = `${userId}/${crypto.randomUUID()}.${extension}`;
            const { error: avatarUploadError } = await client.storage
              .from('user-avatars')
              .upload(avatarPath, avatarBlob, {
                cacheControl: '3600',
                contentType: avatarBlob.type,
                upsert: false
              });
            if (avatarUploadError) throw avatarUploadError;

            accountProfile = {
              ...accountProfile,
              avatar: `${client.storage.from('user-avatars').getPublicUrl(avatarPath).data.publicUrl}?v=${Date.now()}`
            };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unexpected storage error.';
            showToast(`The saved profile photo could not be migrated to Supabase: ${message}`, 'error');
          }
        }
        if (!isCurrent) return;

        setUser(accountProfile);
        setLoadedSupabaseAccountKey(accountKey);
      } catch (error) {
        if (!isCurrent) return;
        const message = error instanceof Error ? error.message : 'Unexpected Supabase error.';
        showToast(`Account data could not be loaded from Supabase: ${message}`, 'error');
      }
    };

    void loadSupabaseAccount();
    return () => {
      isCurrent = false;
    };
  }, [
    activeAccountId,
    activeSupabaseAccountKey,
    addresses,
    authSession.displayName,
    authSession.email,
    authSession.isAuthenticated,
    authSession.userId,
    cart,
    loadedAccountId,
    loadedSupabaseAccountKey,
    orders,
    redemptions
  ]);

  useEffect(() => {
    if (
      !isSupabaseConfigured ||
      !supabase ||
      !authSession.isAuthenticated ||
      !authSession.userId ||
      loadedSupabaseAccountKey !== activeSupabaseAccountKey ||
      loadedAccountId !== activeAccountId
    ) return;

    const client = supabase;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const { error } = await client
            .from('customer_account_data')
            .upsert({
              user_id: authSession.userId,
              addresses,
              orders: orders.filter(
                (order) =>
                  order.customerUserId === authSession.userId ||
                  order.customerEmail?.trim().toLowerCase() === authSession.email.trim().toLowerCase()
              ),
              redemptions,
              cart,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          if (error) showToast(`Account data could not be saved to Supabase: ${error.message}`, 'error');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unexpected Supabase error.';
          showToast(`Account data could not be saved to Supabase: ${message}`, 'error');
        }
      })();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeAccountId,
    addresses,
    authSession.email,
    authSession.isAuthenticated,
    authSession.userId,
    activeSupabaseAccountKey,
    cart,
    loadedAccountId,
    loadedSupabaseAccountKey,
    orders,
    redemptions
  ]);

  useEffect(() => {
    if (
      !isSupabaseConfigured ||
      !supabase ||
      !authSession.isAuthenticated ||
      !authSession.userId ||
      loadedSupabaseAccountKey !== activeSupabaseAccountKey ||
      loadedAccountId !== activeAccountId
    ) return;

    const client = supabase;
    void (async () => {
      try {
        const { data, error } = await client
          .from('profiles')
          .update({
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar_url: user.avatar.startsWith('http') ? user.avatar : null,
            points_balance: user.pointsBalance,
            total_points_earned: user.totalPointsEarned,
            total_points_redeemed: user.totalPointsRedeemed,
            favorite_product_ids: user.favoriteProductIds,
            favorite_brand_ids: user.favoriteBrandIds,
            notifications_enabled: user.notificationsEnabled ?? true,
            updated_at: new Date().toISOString()
          })
          .eq('id', authSession.userId)
          .select('id')
          .maybeSingle();
        if (error || !data) {
          showToast(`Profile could not be saved to Supabase: ${error?.message || 'Profile row is missing. Run the latest Supabase SQL setup.'}`, 'error');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected Supabase error.';
        showToast(`Profile could not be saved to Supabase: ${message}`, 'error');
      }
    })();
  }, [
    activeAccountId,
    authSession.email,
    authSession.isAuthenticated,
    authSession.userId,
    activeSupabaseAccountKey,
    loadedAccountId,
    loadedSupabaseAccountKey,
    user
  ]);

  useEffect(() => {
    localStorage.setItem('ecocommune_commission_rate', JSON.stringify(commissionRate));
  }, [commissionRate]);

  useEffect(() => {
    localStorage.setItem('ecocommune_auth', JSON.stringify(authSession));
  }, [authSession]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = cart.length === 0 ? 0 : cartSubtotal >= 25 ? 0 : 1.50;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const myOrders = authSession.isAuthenticated
    ? orders.filter((order) =>
      (Boolean(authSession.userId) && order.customerUserId === authSession.userId) ||
      order.customerEmail?.trim().toLowerCase() === authSession.email.trim().toLowerCase()
    )
    : [];

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${quantity}x ${product.name} to bag`, 'success');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout & Order creation
  const placeOrder = (shippingInfo: { name: string; phone: string; address: string; notes?: string }): Order => {
    const primarySeller = cart[0]?.product ? {
      id: cart[0].product.brandId,
      name: cart[0].product.brandName
    } : {
      id: 'brand-1',
      name: 'Green Corner Refill Store'
    };

    const newOrder: Order = {
      id: `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: shippingInfo.name || user.name,
      customerEmail: authSession.isAuthenticated
        ? authSession.email.trim().toLowerCase()
        : authSession.isGuest
          ? GUEST_ACCOUNT_ID
          : undefined,
      customerUserId: authSession.userId,
      customerPhone: shippingInfo.phone || user.phone,
      deliveryAddress: shippingInfo.address,
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        brandName: c.product.brandName,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.image
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      pointsAwarded: false,
      sellerId: primarySeller.id,
      sellerName: primarySeller.name
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCheckoutOpen(false);
    setOrderConfirmation(newOrder);
    showToast('Your order has been placed successfully!', 'success');
    return newOrder;
  };

  // Favorites
  const toggleFavoriteProduct = (productId: string) => {
    setUser((prev) => {
      const exists = prev.favoriteProductIds.includes(productId);
      const updated = exists
        ? prev.favoriteProductIds.filter((id) => id !== productId)
        : [...prev.favoriteProductIds, productId];
      showToast(exists ? 'Removed from favorites' : 'Saved to favorites', 'info');
      return { ...prev, favoriteProductIds: updated };
    });
  };

  const toggleFavoriteBrand = (brandId: string) => {
    setUser((prev) => {
      const exists = prev.favoriteBrandIds.includes(brandId);
      const updated = exists
        ? prev.favoriteBrandIds.filter((id) => id !== brandId)
        : [...prev.favoriteBrandIds, brandId];
      showToast(exists ? 'Removed shop from favorites' : 'Saved shop to favorites', 'info');
      return { ...prev, favoriteBrandIds: updated };
    });
  };

  // Rewards redemption
  const redeemReward = (rewardId: string): { success: boolean; message: string } => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return { success: false, message: 'Reward not found' };

    if (user.pointsBalance < reward.requiredPoints) {
      showToast(`You need ${reward.requiredPoints} points, but have ${user.pointsBalance}`, 'error');
      return {
        success: false,
        message: `Insufficient points balance. You need ${reward.requiredPoints - user.pointsBalance} more points.`
      };
    }

    const code = `ECO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newRedemption: RewardRedemption = {
      id: `red-${Date.now()}`,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsDeducted: reward.requiredPoints,
      code,
      date: new Date().toISOString().split('T')[0],
      partnerName: reward.partnerName,
      status: 'Active'
    };

    setRedemptions((prev) => [newRedemption, ...prev]);
    setUser((prev) => ({
      ...prev,
      pointsBalance: prev.pointsBalance - reward.requiredPoints,
      totalPointsRedeemed: prev.totalPointsRedeemed + reward.requiredPoints
    }));

    showToast(`Redeemed ${reward.name}! Voucher code: ${code}`, 'success');
    return { success: true, message: `Successfully redeemed! Voucher code: ${code}` };
  };

  const updateUserProfile = async (
    updates: Partial<UserProfile>,
    avatarFile?: File
  ): Promise<{ success: boolean; message: string }> => {
    const next = { ...user, ...updates };
    const supportedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (avatarFile && !supportedAvatarTypes.includes(avatarFile.type)) {
      return { success: false, message: 'Choose a JPEG, PNG, or WebP image.' };
    }
    if (avatarFile && avatarFile.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      return { success: false, message: `Profile pictures must be ${MAX_PROFILE_IMAGE_SIZE_MB} MB or smaller.` };
    }

    if (isSupabaseConfigured && supabase && authSession.isAuthenticated) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        return { success: false, message: authError?.message || 'Your session has expired. Please sign in again.' };
      }

      let avatarUrl = next.avatar;
      let uploadedAvatarPath: string | undefined;
      if (avatarFile) {
        const extension = avatarFile.type === 'image/png' ? 'png' : avatarFile.type === 'image/webp' ? 'webp' : 'jpg';
        const avatarPath = `${authData.user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(avatarPath, avatarFile, {
            cacheControl: '3600',
            contentType: avatarFile.type,
            upsert: false
          });
        if (uploadError) {
            if (uploadError.message.toLowerCase().includes('bucket not found')) {
              return {
                success: false,
                message: 'Supabase storage bucket "user-avatars" is missing. Run supabase/profiles.sql in your project\'s SQL Editor, then try again.'
              };
            }
          return { success: false, message: `Profile picture upload failed: ${uploadError.message}` };
        }

        uploadedAvatarPath = avatarPath;
        avatarUrl = `${supabase.storage.from('user-avatars').getPublicUrl(avatarPath).data.publicUrl}?v=${Date.now()}`;
        next.avatar = avatarUrl;
      }

      const { data: savedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          name: next.name,
          email: next.email,
          phone: next.phone,
          avatar_url: avatarUrl.startsWith('http') ? avatarUrl : null,
          points_balance: next.pointsBalance,
          total_points_earned: next.totalPointsEarned,
          total_points_redeemed: next.totalPointsRedeemed,
          favorite_product_ids: next.favoriteProductIds,
          favorite_brand_ids: next.favoriteBrandIds,
          notifications_enabled: next.notificationsEnabled ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)
        .select('id')
        .maybeSingle();

      if (profileError || !savedProfile) {
        let cleanupMessage = '';
        if (uploadedAvatarPath) {
          const { error: cleanupError } = await supabase.storage
            .from('user-avatars')
            .remove([uploadedAvatarPath]);
          if (cleanupError) {
            cleanupMessage = ` The uploaded image could not be removed: ${cleanupError.message}`;
          }
        }
        return {
          success: false,
          message: `${profileError?.message || 'Your profile could not be saved. Please run the latest Supabase profile SQL and try again.'}${cleanupMessage}`
        };
      }

      setUser(next);
      setAuthSession((current) => ({
        ...current,
        email: next.email.trim().toLowerCase(),
        displayName: next.name
      }));

      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          email: next.email,
          data: { name: next.name, phone: next.phone }
        });
        if (metadataError) {
          showToast(`Profile saved, but account details could not be synced: ${metadataError.message}`, 'error');
        } else {
          showToast('Profile updated', 'success');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        showToast(`Profile saved, but account details could not be synced: ${message}`, 'error');
      }
      return { success: true, message: 'Profile updated.' };
    }

    if (avatarFile) {
      try {
        next.avatar = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('The selected image could not be read.'));
          };
          reader.onerror = () => reject(reader.error || new Error('The selected image could not be read.'));
          reader.readAsDataURL(avatarFile);
        });
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'The selected image could not be read.'
        };
      }
    }

    setUser(next);
    showToast('Profile updated', 'success');
    return { success: true, message: 'Profile updated.' };
  };

  // Delivery Address management
  const addAddress = (addrData: Omit<DeliveryAddress, 'id'>) => {
    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      ...addrData
    };
    setAddresses((prev) => {
      if (addrData.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), newAddr];
      }
      return [...prev, newAddr];
    });
    showToast('Delivery address added', 'success');
  };

  const updateAddress = (id: string, updates: Partial<DeliveryAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates };
        }
        if (updates.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
    showToast('Address updated', 'success');
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('Address removed', 'info');
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id
      }))
    );
    showToast('Default address set', 'success');
  };

  // Order status progression & Points award rule
  // Rule: "Earn 1 point for every $1 spent on eligible completed purchases. Points awarded after completed."
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    if (
      isSupabaseConfigured &&
      supabase &&
      authSession.isAuthenticated &&
      (authSession.role === 'seller' || authSession.role === 'admin')
    ) {
      if (!order.customerUserId) {
        showToast('This order is missing its Supabase customer link. Refresh the dashboard and try again.', 'error');
        return;
      }

      const client = supabase;
      void (async () => {
        try {
          const { data, error } = await client.rpc('update_manageable_order_status', {
            p_order_id: order.id,
            p_customer_user_id: order.customerUserId,
            p_status: newStatus
          });
          if (error || !data) {
            showToast(`Order status could not be saved to Supabase: ${error?.message || 'No updated order was returned.'}`, 'error');
            return;
          }

          const updatedOrder = data as Order;
          setOrders((currentOrders) => currentOrders.map((item) =>
            item.id === updatedOrder.id ? updatedOrder : item
          ));
          if (
            updatedOrder.pointsAwarded &&
            !order.pointsAwarded &&
            order.customerUserId === authSession.userId
          ) {
            const pointsEarned = Math.floor(order.subtotal);
            setUser((currentUser) => ({
              ...currentUser,
              pointsBalance: currentUser.pointsBalance + pointsEarned,
              totalPointsEarned: currentUser.totalPointsEarned + pointsEarned
            }));
          }
          showToast(`Order ${order.id} status changed to ${newStatus}`, 'success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unexpected Supabase error.';
          showToast(`Order status could not be saved to Supabase: ${message}`, 'error');
        }
      })();
      return;
    }

    const shouldAwardPoints = newStatus === 'Completed' && !order.pointsAwarded;
    setOrders((prev) =>
      prev.map((item) => item.id === orderId
        ? { ...item, status: newStatus, pointsAwarded: shouldAwardPoints || item.pointsAwarded }
        : item)
    );

    if (!shouldAwardPoints) {
      showToast(`Order ${order.id} status changed to ${newStatus}`, 'info');
      return;
    }

    const pointsEarned = Math.floor(order.subtotal);
    const customerEmail = order.customerEmail?.trim().toLowerCase();
    if (customerEmail && customerEmail === authSession.email.trim().toLowerCase()) {
      setUser((currentUser) => ({
        ...currentUser,
        pointsBalance: currentUser.pointsBalance + pointsEarned,
        totalPointsEarned: currentUser.totalPointsEarned + pointsEarned
      }));
    } else if (customerEmail && customerEmail !== GUEST_ACCOUNT_ID) {
      try {
        const savedProfiles = localStorage.getItem('ecocommune_user_profiles');
        const profiles = savedProfiles
          ? JSON.parse(savedProfiles) as Record<string, UserProfile>
          : {};
        const customerProfile = profiles[customerEmail] || loadAccountProfile(customerEmail);
        profiles[customerEmail] = {
          ...customerProfile,
          pointsBalance: customerProfile.pointsBalance + pointsEarned,
          totalPointsEarned: customerProfile.totalPointsEarned + pointsEarned
        };
        localStorage.setItem('ecocommune_user_profiles', JSON.stringify(profiles));
      } catch {
        showToast('Order status updated, but customer points could not be saved.', 'error');
      }
    }
    showToast(`Order marked Completed! +${pointsEarned} eco-points awarded to ${order.customerName}`, 'success');
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      ...prodData
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('New sustainable product listed!', 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Product updated successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog', 'info');
  };

  const updateBrandProfile = (id: string, updates: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    showToast('Business profile updated', 'success');
  };

  // Admin Actions
  const toggleBrandStatus = (brandId: string, status: 'active' | 'pending_verification' | 'deactivated') => {
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, status } : b))
    );
    showToast(`Shop listing status set to: ${status}`, 'info');
  };

  const addReward = (rewardData: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
      id: `reward-${Date.now()}`,
      ...rewardData
    };
    setRewards((prev) => [...prev, newReward]);
    showToast('Reward item created', 'success');
  };

  const updateReward = (id: string, updates: Partial<Reward>) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    showToast('Reward updated', 'success');
  };

  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    showToast('Reward deleted', 'info');
  };

  const login = async ({
    role,
    email,
    password,
    name,
    phone,
    sellerBrandId,
    isSignUp
  }: {
    role: ViewRole;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    sellerBrandId?: string;
    isSignUp?: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      return { success: false, message: 'Please enter both your email and password.' };
    }
    if (password.trim().length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (isSupabaseConfigured && supabase) {
      if (role === 'admin' && isSignUp) {
        return { success: false, message: 'Admin accounts cannot be self-registered.' };
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name?.trim() || cleanEmail.split('@')[0],
              phone: phone?.trim() || '',
              role,
              seller_brand_id: role === 'seller' ? (sellerBrandId || brands[0]?.id || 'brand-1') : undefined
            }
          }
        });

        if (error) {
          const message = error.message.toLowerCase();
          if (message.includes('rate limit') || message.includes('email rate')) {
            return { success: false, message: 'Too many registration emails were sent. Please wait a few minutes before trying again.' };
          }
          if (message.includes('email address') && message.includes('invalid')) {
            return { success: false, message: 'Enter a valid email address.' };
          }
          if (message.includes('already registered') || message.includes('already exists')) {
            return { success: false, message: 'An account already exists for this email. Please sign in instead.' };
          }
          return { success: false, message: error.message };
        }

        if (!data.user) {
          return { success: false, message: 'Registration could not be completed. Please try again.' };
        }

        const identities = data.user.identities;
        if (identities && identities.length === 0) {
          return { success: false, message: 'An account already exists for this email. Please sign in instead.' };
        }

        if (!data.session) {
          return { success: true, message: 'Account created. Check your email and confirm the account before signing in.' };
        }

        const displayName = name?.trim() || cleanEmail.split('@')[0];
        setAuthSession({
          isAuthenticated: true,
          isGuest: false,
          role,
          email: cleanEmail,
          displayName,
          userId: data.user.id,
          sellerBrandId: role === 'seller' ? (sellerBrandId || brands[0]?.id || 'brand-1') : undefined
        });
        setViewRole(role);
        showToast(`Welcome to ecocommune, ${displayName}!`, 'success');

        setUser(loadAccountProfile(cleanEmail, displayName, phone?.trim() || '', true));

        return { success: true, message: 'Account created and signed in.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes('email not confirmed')) {
          return { success: false, message: 'Please confirm your email address, then sign in again.' };
        }
        if (message.includes('invalid login credentials')) {
          return { success: false, message: 'Email or password is incorrect. Check your details and try again.' };
        }
        return { success: false, message: error.message };
      }

      const user = data.user;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, phone, role, seller_brand_id, avatar_url, points_balance, total_points_earned, total_points_redeemed, favorite_product_ids, favorite_brand_ids, notifications_enabled')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        showToast(`Profile could not be loaded from Supabase: ${profileError.message}`, 'error');
      }
      const profileRole = (profile?.role as ViewRole) || role;
      const displayName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Eco Member';
      const targetBrandId = profile?.seller_brand_id || sellerBrandId;

      setAuthSession({
        isAuthenticated: true,
        isGuest: false,
        role: profileRole,
        email: user.email || cleanEmail,
        displayName,
        userId: user.id,
        sellerBrandId: targetBrandId || undefined
      });
      setViewRole(profileRole);
      setUser(mergeSupabaseProfile(
        loadAccountProfile(
          user.email || cleanEmail,
          profile?.name || user.user_metadata?.name,
          profile?.phone ?? user.user_metadata?.phone ?? ''
        ),
        profile as SupabaseProfileRecord | null,
        true
      ));
      showToast(`Signed in as ${displayName}`, 'success');
      return { success: true, message: 'Signed in successfully.' };
    }

    let registeredAccounts: RegisteredAccount[] = [];
    try {
      const savedAccounts = localStorage.getItem('ecocommune_accounts');
      registeredAccounts = savedAccounts ? JSON.parse(savedAccounts) : [];
    } catch {
      registeredAccounts = [];
    }

    const demoAccounts: Record<ViewRole, { email: string; password: string; name: string }> = {
      customer: { email: INITIAL_USER.email.toLowerCase(), password: 'eco123', name: INITIAL_USER.name },
      seller: { email: 'seller@ecocommune.kh', password: 'seller123', name: 'Partner Merchant' },
      admin: { email: 'admin@ecocommune.kh', password: 'admin123', name: 'Platform Administrator' }
    };

    if (isSignUp) {
      if (role === 'admin') return { success: false, message: 'Admin accounts cannot be self-registered.' };
      const exists = registeredAccounts.some((acc) => acc.email === cleanEmail && acc.role === role) || demoAccounts[role].email === cleanEmail;
      if (exists) return { success: false, message: 'An account with this email already exists for this role.' };

      const displayName = name?.trim() || cleanEmail.split('@')[0];
      const targetBrandId = sellerBrandId || brands[0]?.id || 'brand-1';
      registeredAccounts.push({
        role,
        email: cleanEmail,
        password,
        name: displayName,
        phone: phone?.trim() || '',
        sellerBrandId: role === 'seller' ? targetBrandId : undefined
      });
      localStorage.setItem('ecocommune_accounts', JSON.stringify(registeredAccounts));

      if (role === 'customer') {
        setUser(loadAccountProfile(cleanEmail, displayName, phone?.trim() || ''));
        setCustomerTab('marketplace');
      } else if (role === 'seller') {
        setActiveSellerBrandId(targetBrandId);
      }
      setAuthSession({ isAuthenticated: true, isGuest: false, role, email: cleanEmail, displayName, sellerBrandId: role === 'seller' ? targetBrandId : undefined });
      setViewRole(role);
      showToast(`Welcome to ecocommune, ${displayName}!`, 'success');
      return { success: true, message: 'Account created and signed in.' };
    }

    const matchedRegistered = registeredAccounts.find((acc) => acc.email === cleanEmail && acc.role === role);
    if (matchedRegistered) {
      if (matchedRegistered.password !== password) return { success: false, message: 'Incorrect password for this account.' };
      const targetBrandId = sellerBrandId || matchedRegistered.sellerBrandId || brands[0]?.id || 'brand-1';
      setUser(loadAccountProfile(cleanEmail, matchedRegistered.name, matchedRegistered.phone));
      setAuthSession({ isAuthenticated: true, isGuest: false, role, email: matchedRegistered.email, displayName: matchedRegistered.name, sellerBrandId: role === 'seller' ? targetBrandId : undefined });
      setViewRole(role);
      showToast(`Signed in as ${matchedRegistered.name}`, 'success');
      return { success: true, message: 'Signed in successfully.' };
    }

    const demoAccount = demoAccounts[role];
    if (cleanEmail === demoAccount.email && password === demoAccount.password) {
      setUser(loadAccountProfile(cleanEmail, demoAccount.name, cleanEmail === INITIAL_USER.email.toLowerCase() ? INITIAL_USER.phone : ''));
      setAuthSession({ isAuthenticated: true, isGuest: false, role, email: demoAccount.email, displayName: demoAccount.name, sellerBrandId: role === 'seller' ? (brands[0]?.id || 'brand-1') : undefined });
      setViewRole(role);
      showToast(`Signed in to ${role} portal`, 'success');
      return { success: true, message: 'Signed in successfully.' };
    }

    return { success: false, message: `Invalid ${role} credentials. Use the demo credentials or create a new account.` };
  };

  const continueAsGuest = () => {
    setUser(createAccountProfile('', 'Guest'));
    setAuthSession({
      isAuthenticated: false,
      isGuest: true,
      role: 'customer',
      email: '',
      displayName: 'Guest'
    });
    setViewRole('customer');
    setCustomerTab('marketplace');
    showToast('Browsing ecocommune Marketplace as guest', 'info');
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(INITIAL_USER);
    setAuthSession({
      isAuthenticated: false,
      isGuest: false,
      role: 'customer',
      email: '',
      displayName: ''
    });
    setViewRole('customer');
    setCustomerTab('marketplace');
    showToast('Signed out successfully', 'info');
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentPassword || !newPassword) {
      return { success: false, message: 'Enter your current and new passwords.' };
    }
    if (newPassword.trim().length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }
    if (currentPassword === newPassword) {
      return { success: false, message: 'Choose a different password from your current one.' };
    }

    if (isSupabaseConfigured && supabase && authSession.isAuthenticated) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: authSession.email,
        password: currentPassword
      });
      if (reauthError) {
        return { success: false, message: 'Your current password is incorrect.' };
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, message: error.message };
      showToast('Password updated', 'success');
      return { success: true, message: 'Password updated.' };
    }

    try {
      const savedAccounts = localStorage.getItem('ecocommune_accounts');
      const accounts = savedAccounts ? JSON.parse(savedAccounts) as RegisteredAccount[] : [];
      const account = accounts.find((item) =>
        item.email.toLowerCase() === authSession.email.toLowerCase() &&
        item.role === authSession.role
      );
      if (!account) {
        return { success: false, message: 'Password changes require a registered account.' };
      }
      if (account.password !== currentPassword) {
        return { success: false, message: 'Your current password is incorrect.' };
      }

      account.password = newPassword;
      localStorage.setItem('ecocommune_accounts', JSON.stringify(accounts));
      showToast('Password updated', 'success');
      return { success: true, message: 'Password updated.' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password could not be saved.'
      };
    }
  };

  const openLoginPage = () => {
    setAuthSession((prev) => ({
      ...prev,
      isAuthenticated: false,
      isGuest: false
    }));
  };

  const resetDemoData = () => {
    const isDemoAccount = activeAccountId === DEMO_ACCOUNT_ID;
    localStorage.removeItem('ecocommune_products');
    localStorage.removeItem('ecocommune_brands');
    localStorage.removeItem('ecocommune_orders');
    localStorage.removeItem('ecocommune_rewards');
    localStorage.removeItem('ecocommune_redemptions');
    localStorage.removeItem('ecocommune_user');
    localStorage.removeItem('ecocommune_addresses');
    localStorage.removeItem('ecocommune_cart');
    localStorage.removeItem('ecocommune_commission_rate');
    if (activeAccountId && activeAccountId !== GUEST_ACCOUNT_ID) {
      localStorage.removeItem(getAccountCollectionStorageKey('ecocommune_redemptions', activeAccountId));
      localStorage.removeItem(getAccountCollectionStorageKey('ecocommune_addresses', activeAccountId));
      localStorage.removeItem(getAccountCollectionStorageKey('ecocommune_cart', activeAccountId));
    }

    setProducts(INITIAL_PRODUCTS);
    setBrands(INITIAL_BRANDS);
    setOrders(INITIAL_ORDERS);
    setRewards(INITIAL_REWARDS);
    setRedemptions(isDemoAccount ? INITIAL_REDEMPTIONS : []);
    setUser(authSession.isAuthenticated && !isDemoAccount
      ? createAccountProfile(authSession.email, user.name, user.phone)
      : authSession.isGuest
        ? createAccountProfile('', 'Guest')
        : INITIAL_USER);
    setAddresses(isDemoAccount ? INITIAL_ADDRESSES : []);
    setCart([]);
    setCommissionRate(0.10);
    showToast('Demonstration data reset to defaults', 'info');
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const syncSupabaseSession = async () => {
      const { data } = await client.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('name, email, phone, role, seller_brand_id, avatar_url, points_balance, total_points_earned, total_points_redeemed, favorite_product_ids, favorite_brand_ids, notifications_enabled')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        showToast(`Profile could not be loaded from Supabase: ${profileError.message}`, 'error');
      }
      const role = (profile?.role as ViewRole) || 'customer';
      setAuthSession({
        isAuthenticated: true,
        isGuest: false,
        role,
        email: user.email || '',
        displayName: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Eco Member',
        userId: user.id,
        sellerBrandId: profile?.seller_brand_id || undefined
      });
      setViewRole(role);
      setUser(mergeSupabaseProfile(
        loadAccountProfile(
          user.email || '',
          profile?.name || user.user_metadata?.name,
          profile?.phone ?? user.user_metadata?.phone ?? ''
        ),
        profile as SupabaseProfileRecord | null,
        true
      ));
    };

    syncSupabaseSession();

    const { data: authListener } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthSession({ isAuthenticated: false, isGuest: false, role: 'customer', email: '', displayName: '' });
        setViewRole('customer');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider
      value={{
        viewRole,
        setViewRole,
        customerTab,
        setCustomerTab,
        profileSubTab,
        setProfileSubTab,
        authSession,
        login,
        continueAsGuest,
        logout,
        openLoginPage,
        updatePassword,
        selectedCategory,
        setSelectedCategory,
        selectedBrandFilter,
        setSelectedBrandFilter,
        brandCollectionId,
        setBrandCollectionId,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        activeProductModal,
        setActiveProductModal,
        activeShopModal,
        setActiveShopModal,
        selectedMapShopId,
        setSelectedMapShopId,
        cart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orderConfirmation,
        setOrderConfirmation,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        cartItemCount,
        placeOrder,
        products,
        brands,
        orders,
        myOrders,
        rewards,
        redemptions,
        user,
        addresses,
        commissionRate,
        setCommissionRate,
        toggleFavoriteProduct,
        toggleFavoriteBrand,
        redeemReward,
        updateUserProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        activeSellerBrandId,
        setActiveSellerBrandId,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateBrandProfile,
        toggleBrandStatus,
        addReward,
        updateReward,
        deleteReward,
        resetDemoData,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
