import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  Store, 
  Package, 
  ShoppingBag, 
  Award, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Edit2, 
  Percent, 
  Sliders, 
  X,
  Users,
  Eye,
  Gift,
  LogOut
} from 'lucide-react';
import { Brand, OrderStatus, Product, Reward } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    brands,
    toggleBrandStatus,
    products,
    deleteProduct,
    orders,
    rewards,
    addReward,
    updateReward,
    deleteReward,
    redemptions,
    commissionRate,
    setCommissionRate,
    user,
    setViewRole,
    setCustomerTab,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'products' | 'orders' | 'rewards' | 'commission'>('overview');

  // Reward Add/Edit Modal
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardName, setRewardName] = useState('');
  const [rewardPoints, setRewardPoints] = useState('200');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardPartner, setRewardPartner] = useState('Green Corner Refill Store');
  const [rewardIcon, setRewardIcon] = useState('🎟️');
  const [rewardTerms, setRewardTerms] = useState('Valid for 60 days. Minimum order $10.');

  // Configurable Commission State
  const [commissionInput, setCommissionInput] = useState((commissionRate * 100).toString());

  // Metrics
  const totalCustomers = 42; // Sample registered customers
  const totalBusinesses = brands.length;
  const totalListedProducts = products.length;
  const totalPlatformOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const completedOrdersCount = completedOrders.length;
  
  // Total platform commission earned on completed orders
  const totalCommissionEarned = completedOrders.reduce((sum, o) => {
    return sum + (o.subtotal * commissionRate);
  }, 0);

  const totalGrossOrderVolume = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

  // Open Add Reward
  const handleOpenAddReward = () => {
    setEditingRewardId(null);
    setRewardName('');
    setRewardPoints('250');
    setRewardDesc('');
    setRewardPartner(brands[0]?.name || 'Eco Partner');
    setRewardIcon('🎟️');
    setRewardTerms('Valid on orders over $10. Valid for 60 days.');
    setIsRewardModalOpen(true);
  };

  // Open Edit Reward
  const handleOpenEditReward = (reward: Reward) => {
    setEditingRewardId(reward.id);
    setRewardName(reward.name);
    setRewardPoints(reward.requiredPoints.toString());
    setRewardDesc(reward.description);
    setRewardPartner(reward.partnerName);
    setRewardIcon(reward.image);
    setRewardTerms(reward.terms);
    setIsRewardModalOpen(true);
  };

  // Save Reward
  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    const pointsNum = parseInt(rewardPoints, 10) || 100;
    if (editingRewardId) {
      updateReward(editingRewardId, {
        name: rewardName,
        requiredPoints: pointsNum,
        description: rewardDesc,
        partnerName: rewardPartner,
        image: rewardIcon,
        terms: rewardTerms,
        available: true
      });
    } else {
      addReward({
        name: rewardName,
        requiredPoints: pointsNum,
        description: rewardDesc,
        partnerName: rewardPartner,
        image: rewardIcon,
        terms: rewardTerms,
        available: true
      });
    }
    setIsRewardModalOpen(false);
  };

  const handleApplyCommissionRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(commissionInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 50) {
      setCommissionRate(parsed / 100);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-4 sm:p-6 eco-shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#286B4A] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase font-semibold text-[#286B4A] bg-[#EDF4EB] px-2 py-0.5 rounded whitespace-nowrap">
                Master Administration
              </span>
              <span className="text-xs text-[#718078]">ecocommune Cambodia Platform</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#26332B] font-heading mt-1 leading-tight">
              Platform Governance & Revenue
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setViewRole('customer');
              setCustomerTab('marketplace');
            }}
            className="w-full sm:w-auto text-center whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#F7F8F2] hover:bg-[#DCE4DB] text-[#26332B] border border-[#DCE4DB] transition-colors shrink-0"
          >
            Return to Customer Storefront →
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE4DB] overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('businesses')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'businesses'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Businesses ({brands.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products Audit ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Platform Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'rewards'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rewards Program</span>
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'commission'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Commission Model ({Math.round(commissionRate * 100)}%)</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] eco-shadow-sm">
              <span className="text-[11px] text-[#718078] font-medium block">Registered Users</span>
              <p className="text-2xl font-bold text-[#26332B] font-heading tabular-nums mt-1">{totalCustomers}</p>
              <span className="text-[10px] text-[#286B4A]">Active Cambodian accounts</span>
            </div>

            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] eco-shadow-sm">
              <span className="text-[11px] text-[#718078] font-medium block">Local Businesses</span>
              <p className="text-2xl font-bold text-[#26332B] font-heading tabular-nums mt-1">{totalBusinesses}</p>
              <span className="text-[10px] text-[#286B4A]">Phnom Penh partners</span>
            </div>

            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] eco-shadow-sm">
              <span className="text-[11px] text-[#718078] font-medium block">Listed Products</span>
              <p className="text-2xl font-bold text-[#26332B] font-heading tabular-nums mt-1">{totalListedProducts}</p>
              <span className="text-[10px] text-[#286B4A]">Verified green items</span>
            </div>

            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] eco-shadow-sm">
              <span className="text-[11px] text-[#718078] font-medium block">Total Orders</span>
              <p className="text-2xl font-bold text-[#26332B] font-heading tabular-nums mt-1">{totalPlatformOrders}</p>
              <span className="text-[10px] text-[#718078]">All time transactions</span>
            </div>

            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] eco-shadow-sm">
              <span className="text-[11px] text-[#718078] font-medium block">Completed Orders</span>
              <p className="text-2xl font-bold text-[#3D8B5A] font-heading tabular-nums mt-1">{completedOrdersCount}</p>
              <span className="text-[10px] text-[#3D8B5A]">Eligible for commission</span>
            </div>

            <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] eco-shadow-sm">
              <span className="text-[11px] text-[#718078] font-medium block">Platform Commission</span>
              <p className="text-2xl font-bold text-[#286B4A] font-heading tabular-nums mt-1">
                ${totalCommissionEarned.toFixed(2)}
              </p>
              <span className="text-[10px] text-[#286B4A]">At {Math.round(commissionRate * 100)}% sample rate</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Verification Snapshot */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-5 eco-shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#26332B] font-heading">Partner Businesses Status</h3>
                <button onClick={() => setActiveTab('businesses')} className="text-xs text-[#286B4A] font-semibold hover:underline">
                  Manage listings →
                </button>
              </div>

              <div className="space-y-2">
                {brands.map((b) => (
                  <div key={b.id} className="p-3 bg-[#F7F8F2] rounded-xl border border-[#DCE4DB] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{b.logo}</span>
                      <div>
                        <span className="font-semibold text-[#26332B] block">{b.name}</span>
                        <span className="text-[11px] text-[#718078]">{b.category} · {b.district}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EDF4EB] text-[#286B4A]">
                      {b.status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Revenue & Commission Rules */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-5 eco-shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#26332B] font-heading">Commission Revenue Model</h3>
                <p className="text-xs text-[#718078] mt-1 leading-relaxed">
                  ecocommune sustains operations through an example 10% platform commission on completed, successful orders. Cancelled, pending, or refunded orders incur zero commission.
                </p>

                <div className="bg-[#EDF4EB] p-3.5 rounded-xl border border-[#A8C5A0] text-xs mt-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#286B4A]">Gross Completed Volume:</span>
                    <span className="font-bold text-[#26332B] tabular-nums">${totalGrossOrderVolume.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#286B4A]">Sample Commission Rate:</span>
                    <span className="font-bold text-[#26332B]">{(commissionRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#A8C5A0]/60 font-bold">
                    <span className="text-[#286B4A]">Total Platform Revenue:</span>
                    <span className="text-[#286B4A] font-heading tabular-nums">${totalCommissionEarned.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('commission')}
                className="w-full py-2 bg-[#286B4A] text-white rounded-xl text-xs font-semibold hover:bg-[#1F543A] transition-colors"
              >
                Configure Commission Rate & View Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Business Management */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Participating Local Businesses ({brands.length})
              </h2>
              <p className="text-xs text-[#718078]">
                Audit and regulate green merchant listings in Cambodia
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden eco-shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8F2] border-b border-[#DCE4DB] text-[#718078] uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Address / District</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Products Listed</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Listing Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F8F2]">
                  {brands.map((b) => {
                    const brandProds = products.filter((p) => p.brandId === b.id);
                    const status = b.status || 'active';
                    return (
                      <tr key={b.id} className="hover:bg-[#F7F8F2]/60">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{b.logo}</span>
                            <div>
                              <p className="font-bold text-[#26332B]">{b.name}</p>
                              <p className="text-[10px] text-[#718078] line-clamp-1">{b.shortDescription}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#286B4A] font-medium whitespace-nowrap">
                          {b.category}
                        </td>
                        <td className="py-3.5 px-4 text-[#26332B]">
                          <p>{b.address}</p>
                          <span className="text-[10px] text-[#718078]">{b.district}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#718078] whitespace-nowrap">
                          {b.phone}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#26332B] tabular-nums">
                          {brandProds.length} items
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            status === 'active'
                              ? 'bg-[#EDF4EB] text-[#286B4A]'
                              : status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <select
                            value={status}
                            onChange={(e) => toggleBrandStatus(b.id, e.target.value as any)}
                            className="bg-[#FFFFFF] border border-[#DCE4DB] rounded-lg px-2 py-1 text-xs text-[#26332B] font-medium"
                          >
                            <option value="active">Active (Approved)</option>
                            <option value="pending_verification">Pending Audit</option>
                            <option value="deactivated">Deactivated</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Product and Category Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Product Catalog Compliance ({products.length})
              </h2>
              <p className="text-xs text-[#718078]">
                Verify green standards and remove ineligible listings
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden eco-shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8F2] border-b border-[#DCE4DB] text-[#718078] uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4">Sustainability Verification Basis</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F8F2]">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#F7F8F2]/60">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-8 h-8 rounded-lg object-cover bg-[#F7F8F2] shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/src/assets/images/product_bamboo_goods_1794475239108.jpg';
                            }}
                          />
                          <span className="font-semibold text-[#26332B]">{prod.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#718078]">{prod.brandName}</td>
                      <td className="py-3.5 px-4 text-[#286B4A] font-medium whitespace-nowrap">{prod.category}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#26332B] tabular-nums font-heading">
                        ${prod.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-[#718078] max-w-xs text-[11px]">
                        {prod.sustainabilityNote}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          prod.inStock ? 'bg-[#EDF4EB] text-[#286B4A]' : 'bg-red-50 text-[#D9534F]'
                        }`}>
                          {prod.inStock ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Remove product "${prod.name}" from ecocommune?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 text-[#718078] hover:text-[#D9534F] rounded-lg transition-colors"
                          title="Remove Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Order Monitoring */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Platform Orders Monitor ({orders.length})
              </h2>
              <p className="text-xs text-[#718078]">
                Real-time transaction tracking across participating Cambodian sellers
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden eco-shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8F2] border-b border-[#DCE4DB] text-[#718078] uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Eco Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F8F2]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F7F8F2]/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#286B4A]">{o.id}</td>
                      <td className="py-3.5 px-4 text-[#718078] whitespace-nowrap">{o.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#26332B]">{o.sellerName}</td>
                      <td className="py-3.5 px-4 text-[#26332B]">{o.customerName}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#26332B] tabular-nums font-heading">
                        ${o.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          o.status === 'Completed' ? 'bg-[#EDF4EB] text-[#3D8B5A]' : 'bg-gray-100 text-[#718078]'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {o.pointsAwarded ? (
                          <span className="text-[#3D8B5A] font-semibold text-[11px]">+{Math.floor(o.subtotal)} pts</span>
                        ) : (
                          <span className="text-[#718078] text-[11px]">Pending delivery</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Rewards Management */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Rewards Catalog & Redemption Records
              </h2>
              <p className="text-xs text-[#718078]">
                Configure rewards catalog and inspect voucher redemptions
              </p>
            </div>
            <button
              onClick={handleOpenAddReward}
              className="bg-[#286B4A] hover:bg-[#1F543A] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Reward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((r) => (
              <div key={r.id} className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-2xl p-2 rounded-xl bg-[#F7F8F2] border border-[#DCE4DB] inline-block">{r.image}</span>
                    <span className="font-bold text-sm text-[#286B4A] font-heading">{r.requiredPoints} pts</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#26332B] mt-2 font-heading">{r.name}</h3>
                  <p className="text-[11px] text-[#718078] mt-1 line-clamp-2">{r.description}</p>
                  <p className="text-[10px] text-[#286B4A] font-semibold mt-1">Partner: {r.partnerName}</p>
                </div>

                <div className="pt-2 border-t border-[#DCE4DB] flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditReward(r)}
                    className="p-1 text-[#718078] hover:text-[#26332B]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteReward(r.id)}
                    className="p-1 text-[#718078] hover:text-[#D9534F]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Audit Log of Redemptions */}
          <div className="pt-4 space-y-2">
            <h3 className="font-bold text-xs text-[#718078] uppercase">Voucher Redemption Audit Log</h3>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F7F8F2] border-b border-[#DCE4DB] text-[#718078] text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Reward</th>
                    <th className="py-2.5 px-4">Partner Store</th>
                    <th className="py-2.5 px-4">Generated Code</th>
                    <th className="py-2.5 px-4 text-right">Points Deducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F8F2]">
                  {redemptions.map((red) => (
                    <tr key={red.id}>
                      <td className="py-2.5 px-4 text-[#718078] font-mono">{red.date}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#26332B]">{red.rewardName}</td>
                      <td className="py-2.5 px-4 text-[#718078]">{red.partnerName}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#286B4A]">{red.code}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#D9534F]">-{red.pointsDeducted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Commission Management */}
      {activeTab === 'commission' && (
        <div className="space-y-6">
          {/* Configurator Box */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE4DB] eco-shadow-sm max-w-2xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Commission Business Model Settings
              </h2>
              <p className="text-xs text-[#718078] mt-0.5">
                ecocommune uses a commission rate on eligible completed orders to sustain operations.
              </p>
            </div>

            <form onSubmit={handleApplyCommissionRate} className="flex items-center gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#718078] mb-1">
                  Commission Rate (%):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="w-24 px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs font-semibold"
                  />
                  <span className="text-[#718078] font-bold">%</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#286B4A] hover:bg-[#1F543A] text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  Update Sample Rate
                </button>
              </div>
            </form>

            <p className="text-[11px] text-[#718078] italic bg-[#F7F8F2] p-2.5 rounded-lg border border-[#DCE4DB]">
              * Note: The default 10% rate is a demonstration sample for testing revenue modeling, not a final commercial rate.
            </p>
          </div>

          {/* Breakdown Table for Completed Orders */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#26332B] font-heading">
              Commission Ledger by Order (Completed Orders Only)
            </h3>

            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden eco-shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F2] border-b border-[#DCE4DB] text-[#718078] uppercase text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Fulfilling Seller</th>
                      <th className="py-3 px-4 text-right">Order Product Value</th>
                      <th className="py-3 px-4 text-center">Applied Commission Rate</th>
                      <th className="py-3 px-4 text-right font-bold text-[#286B4A]">Platform Commission</th>
                      <th className="py-3 px-4 text-right font-bold text-[#26332B]">Seller Net Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F8F2]">
                    {completedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#718078]">
                          No completed orders yet. Advance order status to 'Completed' in Seller Dashboard to populate commission ledger!
                        </td>
                      </tr>
                    ) : (
                      completedOrders.map((order) => {
                        const commAmount = order.subtotal * commissionRate;
                        const sellerNet = order.subtotal - commAmount;

                        return (
                          <tr key={order.id} className="hover:bg-[#F7F8F2]/60">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#286B4A]">{order.id}</td>
                            <td className="py-3.5 px-4 font-semibold text-[#26332B]">{order.sellerName}</td>
                            <td className="py-3.5 px-4 text-right tabular-nums font-semibold">${order.subtotal.toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-center font-medium">{(commissionRate * 100).toFixed(0)}%</td>
                            <td className="py-3.5 px-4 text-right font-bold text-[#286B4A] tabular-nums font-heading">
                              +${commAmount.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-[#26332B] tabular-nums font-heading">
                              ${sellerNet.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {completedOrders.length > 0 && (
                    <tfoot className="bg-[#F7F8F2] font-bold text-xs border-t border-[#DCE4DB]">
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-[#26332B]">Totals</td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#26332B]">${totalGrossOrderVolume.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-[#718078]">—</td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#286B4A] font-heading">
                          +${totalCommissionEarned.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#26332B] font-heading">
                          ${(totalGrossOrderVolume - totalCommissionEarned).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Reward Modal */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs" onClick={() => setIsRewardModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl eco-shadow-modal p-6 z-10 border border-[#DCE4DB] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DCE4DB]">
              <h3 className="font-bold text-base text-[#26332B] font-heading">
                {editingRewardId ? 'Edit Reward' : 'Add Reward Voucher'}
              </h3>
              <button onClick={() => setIsRewardModalOpen(false)}>
                <X className="w-5 h-5 text-[#718078]" />
              </button>
            </div>
            <form onSubmit={handleSaveReward} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#718078] mb-1">Reward Name</label>
                <input
                  type="text"
                  required
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  placeholder="e.g. $3 Refill Partner Voucher"
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#718078] mb-1">Required Points</label>
                  <input
                    type="number"
                    required
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#718078] mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={rewardIcon}
                    onChange={(e) => setRewardIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">Partner Store</label>
                <input
                  type="text"
                  required
                  value={rewardPartner}
                  onChange={(e) => setRewardPartner(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">Terms & Conditions</label>
                <input
                  type="text"
                  required
                  value={rewardTerms}
                  onChange={(e) => setRewardTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE4DB]">
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="px-3 py-2 text-[#718078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#286B4A] text-white rounded-lg font-semibold hover:bg-[#1F543A]"
                >
                  Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
