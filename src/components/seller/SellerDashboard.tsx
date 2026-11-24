import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  X,
  Truck,
  TrendingUp,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { OrderStatus, Product, ProductCategory, ShopCategory } from '../../types';

export const SellerDashboard: React.FC = () => {
  const {
    brands,
    activeSellerBrandId,
    setActiveSellerBrandId,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    updateBrandProfile,
    setViewRole,
    setCustomerTab,
    logout
  } = useApp();

  const currentBrand = brands.find((b) => b.id === activeSellerBrandId) || brands[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'profile'>('overview');

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('5.00');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Reusable Products');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSustainabilityNote, setProdSustainabilityNote] = useState('');
  const [prodImage, setProdImage] = useState('/src/assets/images/product_bamboo_goods_1794475239108.jpg');
  const [prodInStock, setProdInStock] = useState(true);

  // Business profile edit state
  const [profileName, setProfileName] = useState(currentBrand?.name || '');
  const [profileCategory, setProfileCategory] = useState<ShopCategory>(currentBrand?.category || 'Refill Shops');
  const [profileAddress, setProfileAddress] = useState(currentBrand?.address || '');
  const [profilePhone, setProfilePhone] = useState(currentBrand?.phone || '');
  const [profileHours, setProfileHours] = useState(currentBrand?.openingHours || '');
  const [profileDescription, setProfileDescription] = useState(currentBrand?.fullDescription || '');

  // Synchronize profile state when switching store
  const handleStoreSwitch = (brandId: string) => {
    setActiveSellerBrandId(brandId);
    const b = brands.find((brand) => brand.id === brandId);
    if (b) {
      setProfileName(b.name);
      setProfileCategory(b.category);
      setProfileAddress(b.address);
      setProfilePhone(b.phone);
      setProfileHours(b.openingHours);
      setProfileDescription(b.fullDescription);
    }
  };

  // Filter products for this seller
  const sellerProducts = products.filter((p) => p.brandId === currentBrand?.id);

  // Orders for this seller
  const sellerOrders = orders.filter((o) => o.sellerId === currentBrand?.id);

  // Analytics Metrics
  const totalProducts = sellerProducts.length;
  const totalOrdersCount = sellerOrders.length;
  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Processing').length;
  const completedOrdersCount = sellerOrders.filter((o) => o.status === 'Completed').length;
  const totalGrossRevenue = sellerOrders
    .filter((o) => o.status === 'Completed')
    .reduce((sum, o) => sum + o.subtotal, 0);

  // Open Add Product
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice('5.00');
    setProdCategory('Reusable Products');
    setProdDescription('');
    setProdSustainabilityNote('');
    setProdImage('/src/assets/images/product_bamboo_goods_1794475239108.jpg');
    setProdInStock(true);
    setIsProductModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdPrice(prod.price.toString());
    setProdCategory(prod.category);
    setProdDescription(prod.description);
    setProdSustainabilityNote(prod.sustainabilityNote);
    setProdImage(prod.image);
    setProdInStock(prod.inStock);
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      updateProduct(editingProductId, {
        name: prodName,
        price: parseFloat(prodPrice) || 0,
        category: prodCategory,
        description: prodDescription,
        sustainabilityNote: prodSustainabilityNote,
        image: prodImage,
        inStock: prodInStock
      });
    } else {
      addProduct({
        name: prodName,
        brandId: currentBrand.id,
        brandName: currentBrand.name,
        price: parseFloat(prodPrice) || 0,
        category: prodCategory,
        description: prodDescription,
        sustainabilityNote: prodSustainabilityNote,
        image: prodImage,
        inStock: prodInStock,
        featured: false
      });
    }
    setIsProductModalOpen(false);
  };

  // Save Business Profile
  const handleSaveBusinessProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandProfile(currentBrand.id, {
      name: profileName,
      category: profileCategory,
      address: profileAddress,
      phone: profilePhone,
      openingHours: profileHours,
      fullDescription: profileDescription
    });
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Seller Header Bar with Store Switcher */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-4 sm:p-6 eco-shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EDF4EB] text-2xl sm:text-3xl flex items-center justify-center border border-[#DCE4DB] shrink-0">
            {currentBrand?.logo || '🏪'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase font-semibold text-[#286B4A] bg-[#EDF4EB] px-2 py-0.5 rounded whitespace-nowrap">
                Seller Operations
              </span>
              <span className="text-xs text-[#718078] truncate">{currentBrand?.district}, Phnom Penh</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#26332B] font-heading mt-1 leading-tight break-words">
              {currentBrand?.name}
            </h1>
          </div>
        </div>

        {/* Store Switcher for Demo Purposes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 w-full lg:w-auto">
          <div className="text-xs min-w-0 flex-1 sm:flex-initial">
            <label className="text-[#718078] block mb-1 font-medium">Switch Business (Demo):</label>
            <select
              value={activeSellerBrandId}
              onChange={(e) => handleStoreSwitch(e.target.value)}
              className="w-full sm:w-64 max-w-full bg-[#F7F8F2] border border-[#DCE4DB] text-[#26332B] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#286B4A]"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setViewRole('customer');
                setCustomerTab('marketplace');
              }}
              className="w-full sm:w-auto whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#F7F8F2] hover:bg-[#DCE4DB] text-[#26332B] border border-[#DCE4DB] transition-colors text-center shrink-0"
            >
              Switch to Customer View →
            </button>
            <button
              onClick={logout}
              className="w-full sm:w-auto whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-[#D9534F] border border-red-200 transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE4DB] overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products Catalog ({sellerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Management ({sellerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Business Profile</span>
        </button>
      </div>

      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCE4DB] eco-shadow-sm space-y-1">
              <span className="text-xs text-[#718078] font-medium">Listed Products</span>
              <p className="text-2xl sm:text-3xl font-bold text-[#26332B] font-heading tabular-nums">
                {totalProducts}
              </p>
              <span className="text-[11px] text-[#286B4A] font-medium">All verified green items</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCE4DB] eco-shadow-sm space-y-1">
              <span className="text-xs text-[#718078] font-medium">Incoming Orders</span>
              <p className="text-2xl sm:text-3xl font-bold text-[#26332B] font-heading tabular-nums">
                {totalOrdersCount}
              </p>
              <span className="text-[11px] text-[#718078]">Lifetime platform orders</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCE4DB] eco-shadow-sm space-y-1">
              <span className="text-xs text-[#718078] font-medium">Pending Delivery</span>
              <p className="text-2xl sm:text-3xl font-bold text-[#E6B84A] font-heading tabular-nums">
                {pendingOrdersCount}
              </p>
              <span className="text-[11px] text-[#718078]">Requires packaging/dispatch</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCE4DB] eco-shadow-sm space-y-1">
              <span className="text-xs text-[#718078] font-medium">Completed Sales</span>
              <p className="text-2xl sm:text-3xl font-bold text-[#286B4A] font-heading tabular-nums">
                ${totalGrossRevenue.toFixed(2)}
              </p>
              <span className="text-[11px] text-[#3D8B5A] font-medium">{completedOrdersCount} orders delivered</span>
            </div>
          </div>

          {/* Fulfillment Responsibilities Notice */}
          <div className="bg-[#EDF4EB] border border-[#A8C5A0] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#286B4A]">
            <Truck className="w-5 h-5 text-[#286B4A] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Merchant Delivery Responsibility Notice</p>
              <p className="text-[#26332B]/85 mt-0.5 leading-relaxed">
                As a participating sustainable local brand on ecocommune, your shop coordinates eco-friendly delivery directly to the customer's Phnom Penh address. When your courier delivers the parcel, update the order status to <strong>Completed</strong> to award the customer their eco-points.
              </p>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-5 eco-shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#26332B] font-heading">Recent Orders for {currentBrand?.name}</h3>
              <button onClick={() => setActiveTab('orders')} className="text-xs text-[#286B4A] font-semibold hover:underline">
                View all orders →
              </button>
            </div>

            {sellerOrders.length === 0 ? (
              <p className="text-xs text-[#718078] py-4 text-center">No orders received for this brand yet.</p>
            ) : (
              <div className="space-y-2">
                {sellerOrders.slice(0, 3).map((o) => (
                  <div key={o.id} className="p-3 bg-[#F7F8F2] rounded-xl border border-[#DCE4DB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-[#26332B] mr-2">{o.id}</span>
                      <span className="text-[#718078]">Customer: {o.customerName}</span>
                      <p className="text-[11px] text-[#718078] mt-0.5 truncate">{o.deliveryAddress}</p>
                    </div>
                    <div className="flex sm:block items-center justify-between sm:text-right shrink-0">
                      <span className="font-bold text-[#286B4A] tabular-nums">${o.total.toFixed(2)}</span>
                      <span className="block text-[10px] text-[#718078] font-semibold">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Products Catalog */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Products Listed by {currentBrand?.name}
              </h2>
              <p className="text-xs text-[#718078]">
                Manage sustainable items displayed in the ecocommune catalog
              </p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="bg-[#286B4A] hover:bg-[#1F543A] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellerProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-20 h-20 object-cover rounded-xl bg-[#F7F8F2] shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/product_bamboo_goods_1794475239108.jpg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-[#286B4A] bg-[#EDF4EB] px-2 py-0.5 rounded">
                      {prod.category}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-[#26332B] line-clamp-1 font-heading mt-1">
                      {prod.name}
                    </h3>
                    <span className="font-bold text-sm text-[#286B4A] tabular-nums block mt-0.5">
                      ${prod.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                      <span className={`w-2 h-2 rounded-full ${prod.inStock ? 'bg-[#3D8B5A]' : 'bg-[#D9534F]'}`} />
                      <span className="text-[#718078]">{prod.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#718078] line-clamp-2">
                  {prod.description}
                </p>

                <div className="pt-2 border-t border-[#DCE4DB] flex items-center justify-between text-xs">
                  <button
                    onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                    className={`text-xs font-semibold ${
                      prod.inStock ? 'text-[#718078] hover:text-[#D9534F]' : 'text-[#3D8B5A] hover:underline'
                    }`}
                  >
                    {prod.inStock ? 'Mark Unavailable' : 'Mark Available'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className="text-[#718078] hover:text-[#26332B] p-1"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${prod.name} from catalog?`)) {
                          deleteProduct(prod.id);
                        }
                      }}
                      className="text-[#718078] hover:text-[#D9534F] p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Incoming Orders ({sellerOrders.length})
              </h2>
              <p className="text-xs text-[#718078]">
                Update shipment statuses as orders are packaged and delivered
              </p>
            </div>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DCE4DB] text-center text-[#718078]">
              No orders received for this brand yet. Place a test order through the customer marketplace!
            </div>
          ) : (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden eco-shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F2] border-b border-[#DCE4DB] text-[#718078] uppercase text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Delivery Address</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Status Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F8F2]">
                    {sellerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F7F8F2]/60">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#286B4A]">
                          {order.id}
                        </td>
                        <td className="py-3.5 px-4 text-[#718078] whitespace-nowrap">
                          {order.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#26332B]">{order.customerName}</p>
                          <p className="text-[11px] text-[#718078]">{order.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-[#26332B] truncate">
                          {order.deliveryAddress}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="text-[11px] text-[#26332B]">
                                <span className="font-semibold">{i.quantity}x</span> {i.productName}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#286B4A] tabular-nums font-heading">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-[#FFFFFF] border border-[#DCE4DB] text-[#26332B] rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#286B4A]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed (Award Points)</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Business Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveBusinessProfile} className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-6 max-w-2xl space-y-4 eco-shadow-sm text-xs">
          <h2 className="text-base font-bold text-[#26332B] font-heading">
            Business Profile & Physical Shop Listing
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block font-medium text-[#718078] mb-1">Business Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#718078] mb-1">Category</label>
              <select
                value={profileCategory}
                onChange={(e) => setProfileCategory(e.target.value as ShopCategory)}
                className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs bg-white"
              >
                <option value="Refill Shops">Refill Shops</option>
                <option value="Reusable Product Shops">Reusable Product Shops</option>
                <option value="Recycled Product Businesses">Recycled Product Businesses</option>
                <option value="Sustainable Lifestyle Stores">Sustainable Lifestyle Stores</option>
                <option value="Zero Waste Centers">Zero Waste Centers</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#718078] mb-1">Street Address in Phnom Penh</label>
              <input
                type="text"
                required
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#718078] mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-[#718078] mb-1">Opening Hours</label>
                <input
                  type="text"
                  required
                  value={profileHours}
                  onChange={(e) => setProfileHours(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#718078] mb-1">Full Description & Sustainability Story</label>
              <textarea
                rows={3}
                required
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#DCE4DB] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#286B4A] hover:bg-[#1F543A] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs"
            onClick={() => setIsProductModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl eco-shadow-modal p-6 z-10 border border-[#DCE4DB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#DCE4DB]">
              <h3 className="font-bold text-base text-[#26332B] font-heading">
                {editingProductId ? 'Edit Product' : 'Add New Sustainable Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-[#718078]" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#718078] mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Bamboo Cutlery Set"
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#718078] mb-1">Price (USD $)</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#718078] mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs bg-white"
                  >
                    <option value="Reusable Products">Reusable Products</option>
                    <option value="Refill Products">Refill Products</option>
                    <option value="Recycled Products">Recycled Products</option>
                    <option value="Plastic-Free Alternatives">Plastic-Free Alternatives</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">Select Product Image Asset</label>
                <select
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs bg-white"
                >
                  <option value="/src/assets/images/product_bamboo_goods_1794475239108.jpg">Organic Bamboo & Sisal Goods</option>
                  <option value="/src/assets/images/product_steel_bottle_1794475240391.jpg">Insulated Stainless Steel Ware</option>
                  <option value="/src/assets/images/shop_refill_corner_1794475239956.jpg">Zero-Waste Liquid Refill Station</option>
                  <option value="/src/assets/images/hero_sustainable_cambodia_1794475237727.jpg">Eco Lifestyle Fabric Tote</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">Product Description</label>
                <textarea
                  rows={2}
                  required
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Describe material, usage, and size..."
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">
                  Sustainability Verification Justification ("Why on ecocommune")
                </label>
                <textarea
                  rows={2}
                  required
                  value={prodSustainabilityNote}
                  onChange={(e) => setProdSustainabilityNote(e.target.value)}
                  placeholder="e.g. 100% biodegradable handle, replaces 150 single-use items per year..."
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prodInStockCheck"
                  checked={prodInStock}
                  onChange={(e) => setProdInStock(e.target.checked)}
                  className="w-4 h-4 text-[#286B4A] rounded"
                />
                <label htmlFor="prodInStockCheck" className="text-xs text-[#26332B]">
                  Product is currently in stock & ready for courier pickup
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE4DB]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-3 py-2 text-[#718078] hover:bg-[#F7F8F2] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#286B4A] text-white rounded-lg font-semibold hover:bg-[#1F543A]"
                >
                  {editingProductId ? 'Update Product' : 'List Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
