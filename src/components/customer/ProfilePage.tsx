import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Package, 
  Heart, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  RefreshCcw,
  Sparkles,
  Camera,
  Gift,
  Copy,
  TrendingUp,
  ArrowRight,
  LogIn,
  LogOut
} from 'lucide-react';
import { DeliveryAddress, Order, OrderStatus, Reward } from '../../types';

const PHNOM_PENH_KHANS = [
  'Doun Penh',
  'Prampi Makara / 7 Makara',
  'Chamkar Mon',
  'Boeung Keng Kang / BKK',
  'Tuol Kork',
  'Sen Sok',
  'Russei Keo',
  'Mean Chey',
  'Chroy Changvar',
  'Chbar Ampov',
  'Preaek Phnov',
  'Pou Senchey',
  'Dangkao',
  'Kamboul'
];

const normalizeAddressDistrict = (district: string) => {
  const normalized = district.trim().toLowerCase();
  if (normalized.startsWith('boeung keng kang')) return 'Boeung Keng Kang / BKK';
  if (normalized === 'tuol kouk') return 'Tuol Kork';
  return district;
};

export const ProfilePage: React.FC = () => {
  const {
    user,
    updateUserProfile,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    myOrders,
    products,
    brands,
    rewards,
    redemptions,
    redeemReward,
    toggleFavoriteProduct,
    toggleFavoriteBrand,
    setActiveProductModal,
    setActiveShopModal,
    resetDemoData,
    showToast,
    setCustomerTab,
    profileSubTab,
    setProfileSubTab,
    authSession,
    logout,
    openLoginPage
  } = useApp();

  // Rewards state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<Reward | null>(null);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrRecipient, setAddrRecipient] = useState(user.name);
  const [addrPhone, setAddrPhone] = useState(user.phone);
  const [addrStreet, setAddrStreet] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('Boeung Keng Kang / BKK');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleNotificationsChange = async (enabled: boolean) => {
    const result = await updateUserProfile({ notificationsEnabled: enabled });
    if (!result.success) showToast(result.message, 'error');
  };

  useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setAddrRecipient(user.name);
    setAddrPhone(user.phone);
  }, [user.name, user.email, user.phone]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  // Favorite items lists
  const favoriteProductsList = products.filter((p) => user.favoriteProductIds.includes(p.id));
  const favoriteBrandsList = brands.filter((b) => user.favoriteBrandIds.includes(b.id));

  // Rewards Handlers
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleConfirmRedeem = () => {
    if (!selectedRewardToRedeem) return;
    redeemReward(selectedRewardToRedeem.id);
    setSelectedRewardToRedeem(null);
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileSaveError('');

    try {
      const result = await updateUserProfile({
        name: editName,
        email: editEmail,
        phone: editPhone
      }, avatarFile || undefined);
      if (!result.success) {
        setProfileSaveError(result.message);
        return;
      }

      setAvatarFile(null);
      setIsEditProfileOpen(false);
    } catch (error) {
      setProfileSaveError(error instanceof Error ? error.message : 'Profile could not be saved.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfileSaveError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileSaveError('Profile pictures must be 2 MB or smaller.');
      return;
    }

    setProfileSaveError('');
    setAvatarFile(file);
  };

  // Open Add Address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrRecipient(user.name);
    setAddrPhone(user.phone);
    setAddrStreet('');
    setAddrDistrict('Boeung Keng Kang / BKK');
    setAddrIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  // Open Edit Address
  const handleOpenEditAddress = (addr: DeliveryAddress) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label);
    setAddrRecipient(addr.recipientName);
    setAddrPhone(addr.phone);
    setAddrStreet(addr.streetAddress);
    setAddrDistrict(normalizeAddressDistrict(addr.district));
    setAddrIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  // Save Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      updateAddress(editingAddressId, {
        label: addrLabel,
        recipientName: addrRecipient,
        phone: addrPhone,
        streetAddress: addrStreet,
        district: addrDistrict,
        city: 'Phnom Penh',
        isDefault: addrIsDefault
      });
    } else {
      addAddress({
        label: addrLabel,
        recipientName: addrRecipient,
        phone: addrPhone,
        streetAddress: addrStreet,
        district: addrDistrict,
        city: 'Phnom Penh',
        isDefault: addrIsDefault
      });
    }
    setIsAddressModalOpen(false);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#EDF4EB] text-[#3D8B5A] border-[#A8C5A0]';
      case 'Shipped':
        return 'bg-[#FDF7E7] text-[#B88728] border-[#E6B84A]';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-50 text-[#D9534F] border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Profile & Rewards Overview Header Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-6 eco-shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EDF4EB] text-2xl flex items-center justify-center border border-[#A8C5A0] font-semibold text-[#286B4A] shrink-0 overflow-hidden">
            {user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? (
              <img src={user.avatar} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
            ) : (
              user.avatar || '👩'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#26332B] font-heading">
                {user.name}
              </h1>
              <span className="text-[10px] bg-[#EDF4EB] text-[#286B4A] px-2 py-0.5 rounded font-semibold uppercase">
                Eco Citizen
              </span>
            </div>
            <p className="text-xs text-[#718078] mt-0.5">
              {user.email} · {user.phone}
            </p>
            <p className="text-xs text-[#286B4A] font-medium mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E6B84A]" />
              <span>{user.pointsBalance} ecocommune Points Available</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Compact Points Summary */}
          <div className="bg-[#F7F8F2] px-4 py-2.5 rounded-xl border border-[#DCE4DB] flex items-center gap-4 text-center">
            <div>
              <span className="text-[10px] text-[#718078] block">Available</span>
              <span className="text-base font-bold text-[#286B4A] font-heading tabular-nums">
                {user.pointsBalance} pts
              </span>
            </div>
            <div className="h-6 w-px bg-[#DCE4DB]" />
            <div>
              <span className="text-[10px] text-[#718078] block">Total Earned</span>
              <span className="text-base font-bold text-[#26332B] font-heading tabular-nums">
                {user.totalPointsEarned}
              </span>
            </div>
            <div className="h-6 w-px bg-[#DCE4DB]" />
            <div>
              <span className="text-[10px] text-[#718078] block">Redeemed</span>
              <span className="text-base font-bold text-[#718078] font-heading tabular-nums">
                {user.totalPointsRedeemed}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditName(user.name);
                setEditEmail(user.email);
                setEditPhone(user.phone);
                setAvatarFile(null);
                setProfileSaveError('');
                setIsEditProfileOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F7F8F2] hover:bg-[#DCE4DB] text-[#26332B] border border-[#DCE4DB] flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#718078]" />
              <span>Edit Profile</span>
            </button>

            {authSession.isAuthenticated ? (
              <button
                onClick={logout}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-[#D9534F] border border-red-200 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={openLoginPage}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#286B4A] hover:bg-[#1F543A] text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Rewards combined with Profile) */}
      <div className="flex items-center gap-2 border-b border-[#DCE4DB] overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setProfileSubTab('rewards')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            profileSubTab === 'rewards'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#E6B84A]" />
          <span>Eco Rewards ({user.pointsBalance} pts)</span>
        </button>

        <button
          onClick={() => setProfileSubTab('orders')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            profileSubTab === 'orders'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setProfileSubTab('addresses')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            profileSubTab === 'addresses'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Delivery Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setProfileSubTab('favorites')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            profileSubTab === 'favorites'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Favorites ({favoriteProductsList.length + favoriteBrandsList.length})</span>
        </button>

        <button
          onClick={() => setProfileSubTab('settings')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            profileSubTab === 'settings'
              ? 'border-[#286B4A] text-[#286B4A] bg-[#FFFFFF]'
              : 'border-transparent text-[#718078] hover:text-[#26332B]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab 1: Eco Rewards */}
      {profileSubTab === 'rewards' && (
        <div className="space-y-6">
          {/* Points Rule Card */}
          <div className="bg-[#EDF4EB] border border-[#A8C5A0] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#286B4A] text-white flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#26332B] font-heading">
                  Points Rule: $1 = 1 Point on Eligible Completed Purchases
                </h2>
                <p className="text-xs text-[#26332B]/85 mt-0.5 leading-relaxed">
                  Points are credited automatically when your local Cambodian partner shop marks your delivery as completed.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCustomerTab('marketplace')}
              className="bg-[#286B4A] hover:bg-[#1F543A] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <span>Shop Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Available Rewards Catalog */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#26332B] font-heading">
                Available Eco Rewards
              </h2>
              <p className="text-xs text-[#718078]">
                Redeem your points for instant partner vouchers and zero-waste essentials
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {rewards.map((reward) => {
                const canAfford = user.pointsBalance >= reward.requiredPoints;
                const pointsNeeded = reward.requiredPoints - user.pointsBalance;

                return (
                  <div
                    key={reward.id}
                    className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-5 flex flex-col justify-between hover:eco-shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-3xl p-2.5 rounded-xl bg-[#F7F8F2] border border-[#DCE4DB] inline-block">
                          {reward.image}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-lg text-[#286B4A] font-heading tabular-nums block">
                            {reward.requiredPoints}
                          </span>
                          <span className="text-[10px] text-[#718078] uppercase font-semibold">points</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[#26332B] font-heading mb-1">
                        {reward.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#286B4A] block mb-2">
                        Partner: {reward.partnerName}
                      </span>
                      <p className="text-xs text-[#718078] leading-relaxed mb-3">
                        {reward.description}
                      </p>
                      <p className="text-[10px] text-[#718078] italic bg-[#F7F8F2] p-2 rounded-lg border border-[#DCE4DB]">
                        {reward.terms}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#DCE4DB]">
                      {canAfford ? (
                        <button
                          onClick={() => setSelectedRewardToRedeem(reward)}
                          className="w-full bg-[#286B4A] hover:bg-[#1F543A] text-white py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Redeem for {reward.requiredPoints} pts</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-[#F7F8F2] text-[#718078] py-2.5 px-3 rounded-xl text-xs font-medium cursor-not-allowed border border-[#DCE4DB]"
                        >
                          Need {pointsNeeded} more pts
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rewards History Table */}
          <div className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#26332B] font-heading">
              Redemption & Voucher History
            </h2>

            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden eco-shadow-sm">
              {redemptions.length === 0 ? (
                <div className="p-8 text-center text-[#718078] space-y-2">
                  <Gift className="w-10 h-10 text-[#A8C5A0] mx-auto" />
                  <p className="text-xs sm:text-sm font-semibold text-[#26332B]">No reward redemptions yet</p>
                  <p className="text-xs">Once you redeem available vouchers, your codes and statuses will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F8F2] border-b border-[#DCE4DB] text-[#718078] uppercase text-[11px] font-semibold">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Activity / Reward</th>
                        <th className="py-3 px-4">Partner Store</th>
                        <th className="py-3 px-4">Voucher Code</th>
                        <th className="py-3 px-4 text-right">Points</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7F8F2]">
                      {redemptions.map((red) => (
                        <tr key={red.id} className="hover:bg-[#F7F8F2]/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[#718078] whitespace-nowrap">
                            {red.date}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#26332B]">
                            {red.rewardName}
                          </td>
                          <td className="py-3.5 px-4 text-[#718078]">
                            {red.partnerName}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 bg-[#EDF4EB] text-[#286B4A] px-2.5 py-1 rounded-md font-mono font-bold">
                              <span>{red.code}</span>
                              <button
                                onClick={() => handleCopyCode(red.code)}
                                className="hover:text-[#1F543A] p-0.5"
                                title="Copy Code"
                              >
                                {copiedCode === red.code ? (
                                  <Check className="w-3.5 h-3.5 text-[#3D8B5A]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#D9534F] font-heading tabular-nums">
                            -{red.pointsDeducted}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                red.status === 'Active'
                                  ? 'bg-[#EDF4EB] text-[#286B4A]'
                                  : 'bg-[#F7F8F2] text-[#718078]'
                              }`}
                            >
                              {red.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {profileSubTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-[#FFFFFF] p-10 rounded-2xl border border-[#DCE4DB] text-center text-[#718078] space-y-3">
              <Package className="w-12 h-12 text-[#A8C5A0] mx-auto" />
              <h3 className="font-bold text-base text-[#26332B] font-heading">No orders placed yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Explore sustainable local businesses in Cambodia and make your first order!
              </p>
              <button
                onClick={() => setCustomerTab('marketplace')}
                className="bg-[#286B4A] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#1F543A]"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCE4DB] hover:border-[#A8C5A0] transition-colors eco-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#26332B]">
                        {order.id}
                      </span>
                      <span className="text-xs text-[#718078]">· {order.date}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      {order.status === 'Completed' && (
                        <span className="text-[10px] text-[#3D8B5A] bg-[#EDF4EB] px-2 py-0.5 rounded font-medium">
                          ✓ Points Awarded
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#718078]">
                      Fulfilling Seller: <strong className="text-[#26332B]">{order.sellerName}</strong>
                    </p>

                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F7F8F2] px-2 py-1 rounded-lg text-xs shrink-0 border border-[#DCE4DB]">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-6 h-6 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/src/assets/images/product_bamboo_goods_1794475239108.jpg';
                            }}
                          />
                          <span className="text-[#26332B] font-medium">{item.quantity}x {item.productName}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#DCE4DB]">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-[#718078] block">Total Amount</span>
                      <span className="font-bold text-base text-[#286B4A] font-heading tabular-nums">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EDF4EB] hover:bg-[#DCE4DB] text-[#286B4A] transition-colors"
                    >
                      View Order Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Delivery Addresses */}
      {profileSubTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#26332B] font-heading">
                Saved Delivery Addresses
              </h2>
              <p className="text-xs text-[#718078]">
                Addresses used for sustainable bicycle or scooter delivery in Phnom Penh
              </p>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="bg-[#286B4A] hover:bg-[#1F543A] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-[#FFFFFF] p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-[#286B4A] bg-[#EDF4EB]/20 eco-shadow-sm'
                    : 'border-[#DCE4DB]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#26332B] font-heading">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-semibold text-[#286B4A] bg-[#EDF4EB] px-2 py-0.5 rounded border border-[#A8C5A0]/60">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-[#26332B]">
                    {addr.recipientName} ({addr.phone})
                  </p>
                  <p className="text-xs text-[#718078] leading-relaxed">
                    {addr.streetAddress}, {addr.district}, {addr.city}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DCE4DB] flex items-center justify-between text-xs">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-[#286B4A] font-semibold hover:underline"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[#3D8B5A] text-[11px] font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Primary
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditAddress(addr)}
                      className="text-[#718078] hover:text-[#26332B] p-1"
                      title="Edit Address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-[#718078] hover:text-[#D9534F] p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Favorites */}
      {profileSubTab === 'favorites' && (
        <div className="space-y-6">
          {/* Favorite Products */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#26332B] font-heading">
              Saved Products ({favoriteProductsList.length})
            </h2>

            {favoriteProductsList.length === 0 ? (
              <p className="text-xs text-[#718078] italic bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE4DB] text-center">
                No favorite products saved yet. Click the heart icon on any product in the marketplace!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favoriteProductsList.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#DCE4DB] hover:border-[#286B4A] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-32 object-cover rounded-xl mb-2 bg-[#F7F8F2]"
                        />
                        <button
                          onClick={() => toggleFavoriteProduct(prod.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-[#D9534F] shadow-xs"
                          title="Remove favorite"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-semibold text-[#26332B] line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-[#718078]">{prod.brandName}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#DCE4DB] flex items-center justify-between">
                      <span className="font-bold text-xs text-[#286B4A] tabular-nums">
                        ${prod.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => setActiveProductModal(prod)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EDF4EB] text-[#286B4A] hover:bg-[#DCE4DB]"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorite Businesses */}
          <div className="space-y-3 pt-4 border-t border-[#DCE4DB]">
            <h2 className="text-base font-bold text-[#26332B] font-heading">
              Saved Shops ({favoriteBrandsList.length})
            </h2>

            {favoriteBrandsList.length === 0 ? (
              <p className="text-xs text-[#718078] italic bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE4DB] text-center">
                No favorite shops saved yet. Save shops from the Shop Map or Directory!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteBrandsList.map((brand) => (
                  <div
                    key={brand.id}
                    className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE4DB] hover:border-[#286B4A] transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#EDF4EB] text-2xl flex items-center justify-center shrink-0 border border-[#DCE4DB]">
                        {brand.logo}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#26332B] font-heading">{brand.name}</h4>
                        <p className="text-[11px] text-[#718078]">{brand.district}</p>
                        <button
                          onClick={() => setActiveShopModal(brand)}
                          className="text-[11px] text-[#286B4A] font-semibold hover:underline mt-1 block"
                        >
                          View Shop Profile →
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFavoriteBrand(brand.id)}
                      className="text-[#718078] hover:text-[#D9534F] p-1"
                      title="Remove shop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Account Settings */}
      {profileSubTab === 'settings' && (
        <div className="space-y-5 max-w-2xl bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE4DB] eco-shadow-sm">
          <h2 className="text-base font-bold text-[#26332B] font-heading">
            Preferences & Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#F7F8F2]">
              <div>
                <p className="font-semibold text-[#26332B]">Order & Rewards Updates</p>
                <p className="text-[#718078]">Receive local courier notifications and new reward releases</p>
              </div>
              <input
                type="checkbox"
                checked={user.notificationsEnabled ?? true}
                onChange={(e) => void handleNotificationsChange(e.target.checked)}
                className="w-4 h-4 text-[#286B4A] rounded focus:ring-[#286B4A]"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#F7F8F2]">
              <div>
                <p className="font-semibold text-[#26332B]">Security & Password</p>
                <p className="text-[#718078]">Update your prototype login credentials</p>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-[#DCE4DB] text-[#26332B] font-medium hover:bg-[#F7F8F2]"
              >
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#F7F8F2]">
              <div>
                <p className="font-semibold text-[#26332B]">Reset Demo Prototype</p>
                <p className="text-[#718078]">Restore initial mock products, shops, orders, and points balance</p>
              </div>
              <button
                onClick={resetDemoData}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-[#D9534F] border border-red-200 font-semibold hover:bg-red-100 flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-[#26332B]">Account Session</p>
                <p className="text-[#718078]">
                  {authSession.isAuthenticated
                    ? `Signed in as ${authSession.email}`
                    : 'Browsing as guest — sign in to switch User, Seller, or Admin roles'}
                </p>
              </div>
              {authSession.isAuthenticated ? (
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-[#D9534F] border border-red-200 font-semibold hover:bg-red-100 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={openLoginPage}
                  className="px-3 py-1.5 rounded-lg bg-[#286B4A] text-white font-semibold hover:bg-[#1F543A] flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reward Redemption Confirmation Modal */}
      {selectedRewardToRedeem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs"
            onClick={() => setSelectedRewardToRedeem(null)}
          />
          <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl eco-shadow-modal p-6 z-10 border border-[#DCE4DB] space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EDF4EB] text-[#286B4A] mx-auto flex items-center justify-center text-3xl">
              {selectedRewardToRedeem.image}
            </div>

            <h3 className="text-lg font-bold text-[#26332B] font-heading">
              Redeem {selectedRewardToRedeem.name}?
            </h3>

            <p className="text-xs text-[#718078] leading-relaxed">
              This will deduct <strong className="text-[#286B4A]">{selectedRewardToRedeem.requiredPoints} points</strong> from your balance. You will receive an instant digital voucher code valid at {selectedRewardToRedeem.partnerName}.
            </p>

            <div className="bg-[#F7F8F2] p-3 rounded-xl border border-[#DCE4DB] text-xs flex justify-between">
              <span className="text-[#718078]">Remaining balance:</span>
              <span className="font-bold text-[#26332B] tabular-nums">
                {user.pointsBalance - selectedRewardToRedeem.requiredPoints} points
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedRewardToRedeem(null)}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#718078] hover:bg-[#F7F8F2] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#286B4A] hover:bg-[#1F543A] text-white transition-colors shadow-xs"
              >
                Confirm Redemption
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl eco-shadow-modal p-6 z-10 border border-[#DCE4DB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#DCE4DB]">
              <h3 className="font-bold text-base text-[#26332B] font-heading">Edit Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)}>
                <X className="w-4 h-4 text-[#718078]" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#EDF4EB] border border-[#A8C5A0] overflow-hidden flex items-center justify-center text-2xl text-[#286B4A] shrink-0">
                  {avatarPreviewUrl || user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? (
                    <img
                      src={avatarPreviewUrl || user.avatar}
                      alt="Profile picture preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.avatar || '👩'
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DCE4DB] text-[#26332B] font-semibold hover:bg-[#F7F8F2] cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Choose Profile Picture</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarSelection}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-[11px] text-[#718078]">JPEG, PNG, or WebP · up to 2 MB · hosted publicly</p>
                </div>
              </div>
              {profileSaveError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                  {profileSaveError}
                </p>
              )}
              <div>
                <label className="block font-medium text-[#718078] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-[#718078] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-[#718078] mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-3 py-2 text-[#718078] hover:bg-[#F7F8F2] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#286B4A] text-white rounded-lg font-semibold hover:bg-[#1F543A]"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs"
            onClick={() => setIsAddressModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl eco-shadow-modal p-6 z-10 border border-[#DCE4DB] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DCE4DB]">
              <h3 className="font-bold text-base text-[#26332B] font-heading">
                {editingAddressId ? 'Edit Address' : 'Add Phnom Penh Delivery Address'}
              </h3>
              <button onClick={() => setIsAddressModalOpen(false)}>
                <X className="w-4 h-4 text-[#718078]" />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#718078] mb-1">Label</label>
                  <select
                    value={addrLabel}
                    onChange={(e) => setAddrLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Work / Office">Work / Office</option>
                    <option value="University Campus">University Campus</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#718078] mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addrRecipient}
                  onChange={(e) => setAddrRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="e.g. Apartment 4B, Street 310"
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#718078] mb-1">District (Khan)</label>
                <select
                  value={addrDistrict}
                  onChange={(e) => setAddrDistrict(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg text-xs bg-white"
                >
                  {!PHNOM_PENH_KHANS.includes(addrDistrict) && (
                    <option value={addrDistrict}>{addrDistrict}</option>
                  )}
                  {PHNOM_PENH_KHANS.map((khan) => (
                    <option key={khan} value={khan}>{khan}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddressCheck"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#286B4A] rounded"
                />
                <label htmlFor="defaultAddressCheck" className="text-xs text-[#26332B]">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE4DB]">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-3 py-2 text-[#718078] hover:bg-[#F7F8F2] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#286B4A] text-white rounded-lg font-semibold hover:bg-[#1F543A]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs"
            onClick={() => setSelectedOrderDetails(null)}
          />
          <div className="relative w-full max-w-xl bg-[#FFFFFF] rounded-2xl eco-shadow-modal p-6 z-10 border border-[#DCE4DB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#DCE4DB]">
              <div>
                <h3 className="font-bold text-base text-[#26332B] font-heading">
                  Order Details: {selectedOrderDetails.id}
                </h3>
                <p className="text-xs text-[#718078]">Placed on {selectedOrderDetails.date}</p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)}>
                <X className="w-5 h-5 text-[#718078]" />
              </button>
            </div>

            <div className="bg-[#F7F8F2] p-3 rounded-xl border border-[#DCE4DB] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#718078]">Status:</span>
                <span className={`px-2 py-0.5 rounded font-semibold border ${getStatusBadge(selectedOrderDetails.status)}`}>
                  {selectedOrderDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718078]">Local Merchant:</span>
                <span className="font-semibold text-[#26332B]">{selectedOrderDetails.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718078]">Delivery Address:</span>
                <span className="text-[#26332B] text-right max-w-xs">{selectedOrderDetails.deliveryAddress}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#718078] uppercase">Purchased Items</h4>
              <div className="space-y-2">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-[#DCE4DB] text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg bg-[#F7F8F2]" />
                      <div>
                        <p className="font-semibold text-[#26332B]">{item.productName}</p>
                        <p className="text-[11px] text-[#718078]">{item.brandName} · Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#26332B] tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#DCE4DB] text-xs space-y-1 text-[#718078]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#26332B] tabular-nums">${selectedOrderDetails.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-[#26332B] tabular-nums">${selectedOrderDetails.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#26332B] pt-2 border-t border-[#DCE4DB]">
                <span>Total</span>
                <span className="text-[#286B4A] font-heading tabular-nums">${selectedOrderDetails.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 bg-[#286B4A] hover:bg-[#1F543A] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Change Password Demo Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs"
            onClick={() => setIsChangePasswordOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-[#FFFFFF] rounded-2xl eco-shadow-modal p-6 z-10 border border-[#DCE4DB] space-y-4">
            <h3 className="font-bold text-base text-[#26332B] font-heading">Change Password</h3>
            <p className="text-xs text-[#718078]">Demonstration feature for prototype authentication.</p>
            <div className="space-y-2 text-xs">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full px-3 py-2 border border-[#DCE4DB] rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="px-3 py-2 text-xs text-[#718078]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  showToast('Password updated (Demonstration)', 'success');
                }}
                className="px-4 py-2 bg-[#286B4A] text-white rounded-lg text-xs font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
