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
  updateUserProfile: (updates: Partial<UserProfile>) => void;
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
    try {
      const saved = localStorage.getItem('ecocommune_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<Order | null>(null);

  // Entities stored in localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_brands');
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_rewards');
      return saved ? JSON.parse(saved) : INITIAL_REWARDS;
    } catch {
      return INITIAL_REWARDS;
    }
  });

  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_redemptions');
      return saved ? JSON.parse(saved) : INITIAL_REDEMPTIONS;
    } catch {
      return INITIAL_REDEMPTIONS;
    }
  });

  const [user, setUser] = useState<UserProfile>(() => authSession.isAuthenticated
    ? loadAccountProfile(authSession.email, authSession.displayName)
    : INITIAL_USER);

  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() => {
    try {
      const saved = localStorage.getItem('ecocommune_addresses');
      return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ecocommune_cart', JSON.stringify(cart));
  }, [cart]);

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
    localStorage.setItem('ecocommune_redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

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
    localStorage.setItem('ecocommune_addresses', JSON.stringify(addresses));
  }, [addresses]);

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

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };

      if (isSupabaseConfigured && supabase && authSession.isAuthenticated) {
        const client = supabase;
        void client.auth.getUser().then(({ data }) => {
          const userId = data.user?.id;
          if (!userId) return;

          void client
            .from('profiles')
            .update({
              name: next.name,
              email: next.email,
              phone: next.phone,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        });

        void client.auth.updateUser({
          email: next.email,
          data: { name: next.name, phone: next.phone }
        });

        setAuthSession((current) => ({
          ...current,
          email: next.email,
          displayName: next.name
        }));
      }

      return next;
    });
    showToast('Profile updated', 'success');
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
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        let pointsAwarded = order.pointsAwarded;
        if (newStatus === 'Completed' && !pointsAwarded) {
          const pointsEarned = Math.floor(order.subtotal);
          setUser((u) => ({
            ...u,
            pointsBalance: u.pointsBalance + pointsEarned,
            totalPointsEarned: u.totalPointsEarned + pointsEarned
          }));
          pointsAwarded = true;
          showToast(`Order marked Completed! +${pointsEarned} eco-points awarded to ${order.customerName}`, 'success');
        } else {
          showToast(`Order ${order.id} status changed to ${newStatus}`, 'info');
        }

        return { ...order, status: newStatus, pointsAwarded };
      })
    );
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, phone, role, seller_brand_id')
        .eq('id', user.id)
        .maybeSingle();

      const profileRole = (profile?.role as ViewRole) || role;
      const displayName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Eco Member';
      const targetBrandId = profile?.seller_brand_id || sellerBrandId;

      setAuthSession({
        isAuthenticated: true,
        isGuest: false,
        role: profileRole,
        email: user.email || cleanEmail,
        displayName,
        sellerBrandId: targetBrandId || undefined
      });
      setViewRole(profileRole);
      setUser(loadAccountProfile(
        user.email || cleanEmail,
        profile?.name || user.user_metadata?.name,
        profile?.phone ?? user.user_metadata?.phone ?? '',
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

  const openLoginPage = () => {
    setAuthSession((prev) => ({
      ...prev,
      isAuthenticated: false,
      isGuest: false
    }));
  };

  const resetDemoData = () => {
    localStorage.removeItem('ecocommune_products');
    localStorage.removeItem('ecocommune_brands');
    localStorage.removeItem('ecocommune_orders');
    localStorage.removeItem('ecocommune_rewards');
    localStorage.removeItem('ecocommune_redemptions');
    localStorage.removeItem('ecocommune_user');
    localStorage.removeItem('ecocommune_addresses');
    localStorage.removeItem('ecocommune_cart');
    localStorage.removeItem('ecocommune_commission_rate');

    setProducts(INITIAL_PRODUCTS);
    setBrands(INITIAL_BRANDS);
    setOrders(INITIAL_ORDERS);
    setRewards(INITIAL_REWARDS);
    setRedemptions(INITIAL_REDEMPTIONS);
    setUser(INITIAL_USER);
    setAddresses(INITIAL_ADDRESSES);
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

      const { data: profile } = await client
        .from('profiles')
        .select('name, phone, role, seller_brand_id')
        .eq('id', user.id)
        .maybeSingle();

      const role = (profile?.role as ViewRole) || 'customer';
      setAuthSession({
        isAuthenticated: true,
        isGuest: false,
        role,
        email: user.email || '',
        displayName: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Eco Member',
        sellerBrandId: profile?.seller_brand_id || undefined
      });
      setViewRole(role);
      setUser(loadAccountProfile(
        user.email || '',
        profile?.name || user.user_metadata?.name,
        profile?.phone ?? user.user_metadata?.phone ?? '',
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
