export type ProductCategory = 
  | 'Reusable Products'
  | 'Refill Products'
  | 'Recycled Products'
  | 'Plastic-Free Alternatives';

export type ShopCategory =
  | 'Refill Shops'
  | 'Reusable Product Shops'
  | 'Recycled Product Businesses'
  | 'Sustainable Lifestyle Stores';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled';

export interface Product {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  price: number;
  category: ProductCategory;
  image: string;
  description: string;
  sustainabilityNote: string;
  inStock: boolean;
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  image: string;
  category: ShopCategory;
  shortDescription: string;
  fullDescription: string;
  address: string;
  district: string;
  phone: string;
  openingHours: string;
  coordinates: {
    lat: number;
    lng: number;
    // Normalized x, y for interactive SVG city map (0 to 100 percent)
    x: number;
    y: number;
  };
  featured?: boolean;
  status?: 'active' | 'pending_verification' | 'deactivated';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  brandName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerUserId?: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  date: string;
  status: OrderStatus;
  pointsAwarded: boolean;
  sellerId: string;
  sellerName: string;
}

export interface Reward {
  id: string;
  name: string;
  requiredPoints: number;
  description: string;
  image: string;
  partnerName: string;
  terms: string;
  available: boolean;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsDeducted: number;
  code: string;
  date: string;
  partnerName: string;
  status: 'Active' | 'Redeemed' | 'Expired';
}

export interface DeliveryAddress {
  id: string;
  label: string; // 'Home', 'Work', 'University'
  recipientName: string;
  phone: string;
  streetAddress: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  favoriteProductIds: string[];
  favoriteBrandIds: string[];
  notificationsEnabled?: boolean;
}

export type ViewRole = 'customer' | 'seller' | 'admin';

export type CustomerTab = 'marketplace' | 'map' | 'profile';

export type ProfileSubTab = 'rewards' | 'orders' | 'addresses' | 'favorites' | 'settings';

export interface AuthSession {
  isAuthenticated: boolean;
  isGuest: boolean;
  role: ViewRole;
  email: string;
  displayName: string;
  userId?: string;
  sellerBrandId?: string;
}


