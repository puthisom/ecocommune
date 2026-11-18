import { Brand, Product, Reward, RewardRedemption, DeliveryAddress, UserProfile, Order } from '../types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-1',
    name: 'Green Corner Refill Store',
    logo: '🌿',
    image: '/src/assets/images/shop_refill_corner_1794475239956.jpg',
    category: 'Refill Shops',
    shortDescription: 'Zero-waste bulk refill station for organic shampoos, liquid soaps, and kitchen detergents.',
    fullDescription: 'Green Corner is Phnom Penh’s pioneer bulk refill grocer. Bring your clean jars and bottles to refill everyday personal care and household cleaning liquids by weight without plastic packaging.',
    address: 'Street 302, Boeung Keng Kang 1 (BKK1)',
    district: 'Boeung Keng Kang',
    phone: '+855 23 881 201',
    openingHours: 'Mon - Sun: 08:30 AM - 07:00 PM',
    coordinates: {
      lat: 11.5518,
      lng: 104.9242,
      x: 48,
      y: 52
    },
    featured: true,
    status: 'active'
  },
  {
    id: 'brand-2',
    name: 'Eco Living Cambodia',
    logo: '🌱',
    image: '/src/assets/images/hero_sustainable_cambodia_1794475237727.jpg',
    category: 'Sustainable Lifestyle Stores',
    shortDescription: 'Locally handcrafted bamboo essentials, sisal bath wares, and mindful living goods.',
    fullDescription: 'Eco Living collaborates with rural craft cooperatives in Kampong Cham and Siem Reap to produce biodegradable bamboo household alternatives, eliminating single-use plastics from daily routines.',
    address: 'Street 240, Daun Penh (Near Royal Palace)',
    district: 'Daun Penh',
    phone: '+855 23 992 410',
    openingHours: 'Tue - Sun: 09:00 AM - 08:00 PM',
    coordinates: {
      lat: 11.5621,
      lng: 104.9315,
      x: 62,
      y: 35
    },
    featured: true,
    status: 'active'
  },
  {
    id: 'brand-3',
    name: 'Reuse Market Phnom Penh',
    logo: '♻️',
    image: '/src/assets/images/product_steel_bottle_1794475240391.jpg',
    category: 'Reusable Product Shops',
    shortDescription: 'High-grade insulated stainless steel bottles, thermal food flasks, and canvas totes.',
    fullDescription: 'Dedicated to reducing takeaway waste across Cambodian universities and offices. All thermal products are tested for food-grade safety, durability, and lifetime thermal retention.',
    address: 'Street 450, Tuol Tom Poung (Russian Market Area)',
    district: 'Tuol Tom Poung',
    phone: '+855 12 443 890',
    openingHours: 'Daily: 09:00 AM - 06:30 PM',
    coordinates: {
      lat: 11.5392,
      lng: 104.9150,
      x: 35,
      y: 72
    },
    featured: true,
    status: 'active'
  },
  {
    id: 'brand-4',
    name: 'Green Basket Shop',
    logo: '🧺',
    image: '/src/assets/images/product_bamboo_goods_1794475239108.jpg',
    category: 'Recycled Product Businesses',
    shortDescription: 'Upcycled fashion and stationary made from repurposed agricultural sacks and post-consumer plastics.',
    fullDescription: 'Transforming discarded rice bags and reclaimed textile waste into durable backpacks, stationery cases, and notebooks. Every purchase keeps flexible plastic waste out of Cambodian waterways.',
    address: 'Street 155, Tuol Tom Poung 1',
    district: 'Tuol Tom Poung',
    phone: '+855 17 552 119',
    openingHours: 'Mon - Sat: 10:00 AM - 07:00 PM',
    coordinates: {
      lat: 11.5410,
      lng: 104.9190,
      x: 42,
      y: 68
    },
    featured: true,
    status: 'active'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Insulated Stainless Steel Water Bottle',
    brandId: 'brand-3',
    brandName: 'Reuse Market Phnom Penh',
    price: 8.00,
    category: 'Reusable Products',
    image: '/src/assets/images/product_steel_bottle_1794475240391.jpg',
    description: 'Double-walled vacuum insulated 750ml water bottle crafted from 18/8 food-grade stainless steel with a natural bamboo cap seal. Keeps drinks cold for 24 hours in the Cambodian tropical heat.',
    sustainabilityNote: 'Verified 100% plastic-free body. Eliminates an estimated 160 single-use plastic bottles per user each month.',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: 'prod-2',
    name: 'Biodegradable Bamboo Toothbrush Trio',
    brandId: 'brand-2',
    brandName: 'Eco Living Cambodia',
    price: 2.00,
    category: 'Plastic-Free Alternatives',
    image: '/src/assets/images/product_bamboo_goods_1794475239108.jpg',
    description: 'Set of three ergonomically shaped toothbrushes made from sustainably harvested natural bamboo with charcoal-infused BPA-free soft bristles for gentle gum care.',
    sustainabilityNote: 'The bamboo handle is 100% compostable and home degradable within 6 months. Packaged in unbleached recycled kraft paper.',
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewsCount: 52
  },
  {
    id: 'prod-3',
    name: 'Refillable Herbal Hand & Body Soap (500ml)',
    brandId: 'brand-1',
    brandName: 'Green Corner Refill Store',
    price: 5.00,
    category: 'Refill Products',
    image: '/src/assets/images/shop_refill_corner_1794475239956.jpg',
    description: 'Botanical castile liquid soap infused with lemongrass, kaffir lime, and cold-pressed coconut oil. Gentle on skin and naturally biodegradable in greywater systems.',
    sustainabilityNote: 'Sold in deposit glass pump bottles or direct refill for customer jars. 0% synthetic sulfate, palm oil, or microplastics.',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 29
  },
  {
    id: 'prod-4',
    name: 'Upcycled Rice Sack Notebook & Journal',
    brandId: 'brand-4',
    brandName: 'Green Basket Shop',
    price: 4.50,
    category: 'Recycled Products',
    image: '/src/assets/images/product_bamboo_goods_1794475239108.jpg',
    description: 'A5 spiral journal featuring a waterproof cover upcycled from washed Cambodian rice bags with 120 pages of unbleached 100% post-consumer recycled paper.',
    sustainabilityNote: 'Saves 0.2kg of discarded polypropylene sack waste per journal and supports local fair-wage artisans in Phnom Penh.',
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewsCount: 24
  },
  {
    id: 'prod-5',
    name: 'Organic Cotton Canvas Shopping Tote',
    brandId: 'brand-3',
    brandName: 'Reuse Market Phnom Penh',
    price: 3.50,
    category: 'Reusable Products',
    image: '/src/assets/images/hero_sustainable_cambodia_1794475237727.jpg',
    description: 'Heavyweight 12oz unbleached organic cotton tote bag with reinforced cross-stitched handles. Spacious enough for weekly market produce and groceries.',
    sustainabilityNote: 'GOTS certified organic cotton. Machine washable and designed for over 500+ shopping trips.',
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 41
  },
  {
    id: 'prod-6',
    name: 'Stainless Steel Double-Deck Food Container',
    brandId: 'brand-3',
    brandName: 'Reuse Market Phnom Penh',
    price: 6.00,
    category: 'Reusable Products',
    image: '/src/assets/images/product_steel_bottle_1794475240391.jpg',
    description: 'Two-tier leak-resistant bento lunch box with locking clips. Ideal for bringing street food or office lunches without Styrofoam or single-use plastic boxes.',
    sustainabilityNote: '100% reusable stainless steel, zero PFAS, zero hormone-disrupting chemicals. Easy to clean.',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 19
  },
  {
    id: 'prod-7',
    name: 'Organic Solid Coconut Shampoo Bar',
    brandId: 'brand-2',
    brandName: 'Eco Living Cambodia',
    price: 6.50,
    category: 'Plastic-Free Alternatives',
    image: '/src/assets/images/product_bamboo_goods_1794475239108.jpg',
    description: 'Concentrated waterless shampoo bar equivalent to two bottles of conventional liquid shampoo. Made with virgin coconut oil and aloe vera.',
    sustainabilityNote: 'Zero plastic bottle waste, zero chemical preservatives, travel friendly, zero runoff toxicity.',
    inStock: true,
    featured: false,
    rating: 4.6,
    reviewsCount: 15
  },
  {
    id: 'prod-8',
    name: 'Bulk Castile Laundry Detergent (1000ml Refill)',
    brandId: 'brand-1',
    brandName: 'Green Corner Refill Store',
    price: 4.00,
    category: 'Refill Products',
    image: '/src/assets/images/shop_refill_corner_1794475239956.jpg',
    description: 'Plant-based laundry concentrate with natural eucalyptus oil. Effectively lifts stains while being safe for septic tanks and waterways.',
    sustainabilityNote: 'Sold by weight to eliminate plastic jug packaging. Refillable in your own jug or ecocommune returnable jug.',
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewsCount: 31
  }
];

export const INITIAL_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    name: '$2 Partner Shop Voucher',
    requiredPoints: 200,
    description: 'Get $2.00 off your next in-store or online purchase at any participating ecocommune partner business in Phnom Penh.',
    image: '🎟️',
    partnerName: 'All Partner Stores',
    terms: 'Valid on orders of $10 or more. Valid for 60 days from redemption.',
    available: true
  },
  {
    id: 'reward-2',
    name: 'Reusable Organic Cotton Shopping Bag',
    requiredPoints: 300,
    description: 'Claim a complimentary ecocommune signature organic cotton market tote, ready for pickup or free inclusion with your next order.',
    image: '🛍️',
    partnerName: 'Reuse Market Phnom Penh',
    terms: 'One redemption per month. Subject to stock availability.',
    available: true
  },
  {
    id: 'reward-3',
    name: 'Bamboo Travel Cutlery Set & Pouch',
    requiredPoints: 400,
    description: 'Compact travel pouch featuring bamboo fork, spoon, knife, straw, and cleaning brush for plastic-free dining on the go.',
    image: '🥢',
    partnerName: 'Eco Living Cambodia',
    terms: 'Redeemable at Eco Living Cambodia store or added to your online order.',
    available: true
  },
  {
    id: 'reward-4',
    name: '$5 Partner Zero-Waste Discount',
    requiredPoints: 500,
    description: 'Generous $5.00 discount on your bulk refills or sustainable essentials purchase across our network.',
    image: '🏷️',
    partnerName: 'Green Corner Refill Store',
    terms: 'Applicable on refills over $15. Non-transferable.',
    available: true
  }
];

export const INITIAL_USER: UserProfile = {
  name: 'Sophea Chan',
  email: 'sophea.chan@ecocommune.kh',
  phone: '+855 12 789 456',
  avatar: '👩',
  pointsBalance: 250,
  totalPointsEarned: 290,
  totalPointsRedeemed: 40,
  favoriteProductIds: ['prod-1', 'prod-3'],
  favoriteBrandIds: ['brand-1']
};

export const INITIAL_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    recipientName: 'Sophea Chan',
    phone: '+855 12 789 456',
    streetAddress: 'Apartment 4B, Street 310',
    district: 'Boeung Keng Kang 1 (BKK1)',
    city: 'Phnom Penh',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'University Campus',
    recipientName: 'Sophea Chan (RUPP)',
    phone: '+855 12 789 456',
    streetAddress: 'Russian Federation Blvd, Building D',
    district: 'Tuol Kouk',
    city: 'Phnom Penh',
    isDefault: false
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-084',
    customerName: 'Sophea Chan',
    customerPhone: '+855 12 789 456',
    deliveryAddress: 'Apartment 4B, Street 310, BKK1, Phnom Penh',
    items: [
      {
        productId: 'prod-1',
        productName: 'Insulated Stainless Steel Water Bottle',
        brandName: 'Reuse Market Phnom Penh',
        price: 8.00,
        quantity: 1,
        image: '/src/assets/images/product_steel_bottle_1794475240391.jpg'
      },
      {
        productId: 'prod-2',
        productName: 'Biodegradable Bamboo Toothbrush Trio',
        brandName: 'Eco Living Cambodia',
        price: 2.00,
        quantity: 2,
        image: '/src/assets/images/product_bamboo_goods_1794475239108.jpg'
      }
    ],
    subtotal: 12.00,
    deliveryFee: 1.50,
    total: 13.50,
    date: '2026-11-08',
    status: 'Completed',
    pointsAwarded: true,
    sellerId: 'brand-3',
    sellerName: 'Reuse Market Phnom Penh'
  },
  {
    id: 'ORD-2026-092',
    customerName: 'Sophea Chan',
    customerPhone: '+855 12 789 456',
    deliveryAddress: 'Apartment 4B, Street 310, BKK1, Phnom Penh',
    items: [
      {
        productId: 'prod-3',
        productName: 'Refillable Herbal Hand & Body Soap (500ml)',
        brandName: 'Green Corner Refill Store',
        price: 5.00,
        quantity: 2,
        image: '/src/assets/images/shop_refill_corner_1794475239956.jpg'
      }
    ],
    subtotal: 10.00,
    deliveryFee: 1.50,
    total: 11.50,
    date: '2026-11-11',
    status: 'Processing',
    pointsAwarded: false,
    sellerId: 'brand-1',
    sellerName: 'Green Corner Refill Store'
  }
];

export const INITIAL_REDEMPTIONS: RewardRedemption[] = [
  {
    id: 'red-101',
    rewardId: 'reward-1',
    rewardName: '$2 Partner Shop Voucher',
    pointsDeducted: 40,
    code: 'ECO-2USD-BKK1',
    date: '2026-10-25',
    partnerName: 'Green Corner Refill Store',
    status: 'Redeemed'
  }
];
