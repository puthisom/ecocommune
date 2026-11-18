import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Phone, Clock, Navigation, ShoppingBag, Heart, ExternalLink, Sparkles } from 'lucide-react';

export const ShopDetailModal: React.FC = () => {
  const {
    activeShopModal,
    setActiveShopModal,
    products,
    setActiveProductModal,
    setBrandCollectionId,
    setCustomerTab,
    setViewRole,
    user,
    toggleFavoriteBrand
  } = useApp();

  if (!activeShopModal) return null;

  const shop = activeShopModal;
  const isFavorite = user.favoriteBrandIds.includes(shop.id);
  const shopProducts = products.filter((p) => p.brandId === shop.id);

  // Google Maps directions URL with coordinates
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.coordinates.lat},${shop.coordinates.lng}`;

  const handleBrowseCatalog = () => {
    setActiveShopModal(null);
    setBrandCollectionId(shop.id);
    setViewRole('customer');
    setCustomerTab('marketplace');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setActiveShopModal(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl eco-shadow-modal overflow-hidden z-10 max-h-[92vh] flex flex-col border border-[#DCE4DB]">
        {/* Close Button */}
        <button
          onClick={() => setActiveShopModal(null)}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#26332B] shadow-sm transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Shop Photo */}
        <div className="relative h-48 sm:h-56 bg-[#F7F8F2] w-full shrink-0">
          <img
            src={shop.image}
            alt={shop.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/shop_refill_corner_1794475239956.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="text-white">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A8C5A0] bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                {shop.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading mt-1 leading-tight">
                {shop.name}
              </h2>
            </div>
            <button
              onClick={() => toggleFavoriteBrand(shop.id)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-colors shadow-sm ${
                isFavorite
                  ? 'bg-white text-[#D9534F]'
                  : 'bg-white/80 text-[#26332B] hover:bg-white'
              }`}
              title={isFavorite ? 'Remove shop from favorites' : 'Save shop to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Shop Details Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Demo Note */}
          <div className="bg-[#EDF4EB] border border-[#A8C5A0] rounded-xl px-3 py-2 text-xs text-[#286B4A] flex items-center justify-between">
            <span>Verified Participating Partner · Demonstration Location</span>
            <span className="font-mono text-[10px] text-[#286B4A]">Phnom Penh, KH</span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#26332B] leading-relaxed">
            {shop.fullDescription}
          </p>

          {/* Location & Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F7F8F2] p-4 rounded-xl border border-[#DCE4DB]">
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-[#26332B]">
                <MapPin className="w-4 h-4 text-[#286B4A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{shop.address}</span>
                  <span className="text-[#718078] text-[11px]">{shop.district}, Phnom Penh</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#26332B]">
                <Clock className="w-4 h-4 text-[#286B4A] shrink-0" />
                <span>{shop.openingHours}</span>
              </div>
            </div>

            <div className="space-y-2 sm:border-l sm:border-[#DCE4DB] sm:pl-4">
              <div className="flex items-center gap-2 text-[#26332B]">
                <Phone className="w-4 h-4 text-[#286B4A] shrink-0" />
                <span>{shop.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#26332B]">
                <Sparkles className="w-4 h-4 text-[#E6B84A] shrink-0" />
                <span>Earns ecocommune Points On-Site & Online</span>
              </div>
            </div>
          </div>

          {/* Sample Products from this Brand */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#718078] uppercase tracking-wider">
                Available Products ({shopProducts.length})
              </h3>
              <button
                onClick={handleBrowseCatalog}
                className="text-xs text-[#286B4A] font-semibold hover:underline"
              >
                View all in marketplace →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {shopProducts.slice(0, 3).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setActiveShopModal(null);
                    setActiveProductModal(prod);
                  }}
                  className="p-2 rounded-xl border border-[#DCE4DB] hover:border-[#286B4A] cursor-pointer bg-[#FFFFFF] transition-all group"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-20 object-cover rounded-lg mb-1.5 bg-[#F7F8F2]"
                  />
                  <h4 className="text-[11px] font-semibold text-[#26332B] line-clamp-1 group-hover:text-[#286B4A]">
                    {prod.name}
                  </h4>
                  <span className="text-xs font-bold text-[#286B4A] tabular-nums">
                    ${prod.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#286B4A] hover:bg-[#1F543A] text-white py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions (Google Maps)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <button
              onClick={handleBrowseCatalog}
              className="flex-1 bg-[#F7F8F2] hover:bg-[#DCE4DB] text-[#26332B] py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#DCE4DB]"
            >
              <ShoppingBag className="w-4 h-4 text-[#286B4A]" />
              <span>Browse Shop Products</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
