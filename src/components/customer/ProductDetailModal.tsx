import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Heart, Plus, Minus, ShoppingBag, CheckCircle, ShieldCheck, Store, MapPin } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    activeProductModal,
    setActiveProductModal,
    addToCart,
    user,
    toggleFavoriteProduct,
    setBrandCollectionId,
    setCustomerTab,
    setViewRole,
    brands
  } = useApp();

  const [quantity, setQuantity] = useState(1);

  if (!activeProductModal) return null;

  const product = activeProductModal;
  const isFavorite = user.favoriteProductIds.includes(product.id);
  const brand = brands.find((b) => b.id === product.brandId);

  const handleBrandClick = () => {
    setActiveProductModal(null);
    setBrandCollectionId(product.brandId);
    setViewRole('customer');
    setCustomerTab('marketplace');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setActiveProductModal(null)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-2xl eco-shadow-modal overflow-hidden z-10 max-h-[92vh] flex flex-col md:flex-row border border-[#DCE4DB]">
        {/* Close Button */}
        <button
          onClick={() => setActiveProductModal(null)}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#26332B] shadow-sm transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Product Image Gallery */}
        <div className="md:w-1/2 bg-[#F7F8F2] relative flex items-center justify-center min-h-[260px] md:min-h-full">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover max-h-[360px] md:max-h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/product_bamboo_goods_1794475239108.jpg';
            }}
          />
          <button
            onClick={() => toggleFavoriteProduct(product.id)}
            className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isFavorite
                ? 'bg-white text-[#D9534F]'
                : 'bg-white/80 text-[#718078] hover:text-[#26332B]'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="md:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            {/* Category & Status */}
            <div className="flex items-center gap-2 text-xs text-[#718078] mb-1.5">
              <span className="font-medium text-[#286B4A]">{product.category}</span>
              <span>·</span>
              <span>{product.inStock ? 'In Stock in Phnom Penh' : 'Out of Stock'}</span>
            </div>

            {/* Product Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#26332B] font-heading leading-tight mb-2">
              {product.name}
            </h2>

            {/* Price & Eco points teaser */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-[#286B4A] font-heading tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-[#718078] bg-[#F7F8F2] px-2.5 py-1 rounded-md border border-[#DCE4DB]">
                Earns {Math.floor(product.price)} reward pts
              </span>
            </div>

            {/* Seller Info Card */}
            <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#DCE4DB] flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#DCE4DB] flex items-center justify-center text-sm shadow-xs">
                  {brand?.logo || <Store className="w-4 h-4 text-[#286B4A]" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#26332B]">{product.brandName}</h4>
                  <p className="text-[11px] text-[#718078] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#286B4A]" />
                    <span>{brand?.district || 'Phnom Penh'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleBrandClick}
                className="text-xs text-[#286B4A] font-semibold hover:underline"
              >
                View Shop
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-4 text-xs text-[#26332B] leading-relaxed">
              <h4 className="font-semibold text-xs text-[#718078] uppercase tracking-wider">
                Product Details
              </h4>
              <p>{product.description}</p>
            </div>

            {/* Verified Sustainability Justification Section */}
            <div className="bg-[#EDF4EB] p-3.5 rounded-xl border border-[#A8C5A0]/60 space-y-1.5 mb-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#286B4A]">
                <ShieldCheck className="w-4 h-4 text-[#286B4A]" />
                <span>Why This Product Is on ecocommune</span>
              </div>
              <p className="text-xs text-[#26332B]/90 leading-relaxed">
                {product.sustainabilityNote}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-[#DCE4DB] space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#DCE4DB] rounded-xl bg-[#F7F8F2] p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-[#26332B] hover:bg-[#DCE4DB] rounded-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-semibold text-sm tabular-nums text-[#26332B]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#26332B] hover:bg-[#DCE4DB] rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                disabled={!product.inStock}
                onClick={() => {
                  addToCart(product, quantity);
                  setActiveProductModal(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors ${
                  product.inStock
                    ? 'bg-[#286B4A] hover:bg-[#1F543A] text-white'
                    : 'bg-[#DCE4DB] text-[#718078] cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {product.inStock
                    ? `Add to Bag · $${(product.price * quantity).toFixed(2)}`
                    : 'Currently Unavailable'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
