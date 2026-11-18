import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    setIsCheckoutOpen,
    setCustomerTab,
    setViewRole
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#26332B]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col z-10 border-l border-[#DCE4DB]">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCE4DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#286B4A]" />
            <h2 className="text-lg font-bold text-[#26332B] font-heading">
              Your Sustainable Bag
            </h2>
            <span className="text-xs text-[#718078] bg-[#F7F8F2] px-2 py-0.5 rounded-full font-medium">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-[#718078] hover:text-[#26332B] rounded-lg hover:bg-[#F7F8F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-[#EDF4EB] px-4 py-2 border-b border-[#DCE4DB] text-xs">
          {cartSubtotal >= 25 ? (
            <p className="text-[#286B4A] font-medium flex items-center gap-1.5">
              <span>🎉</span> You unlocked <strong>Free Green Courier Delivery</strong> in Phnom Penh!
            </p>
          ) : (
            <p className="text-[#26332B]">
              Add <strong className="text-[#286B4A]">${(25 - cartSubtotal).toFixed(2)}</strong> more for free delivery
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#718078]">
              <div className="w-16 h-16 rounded-full bg-[#F7F8F2] flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-[#A8C5A0]" />
              </div>
              <h3 className="font-semibold text-base text-[#26332B] mb-1">Your bag is empty</h3>
              <p className="text-xs max-w-xs mb-5">
                Explore local Cambodian businesses offering reusable, refillable, and plastic-free goods.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setViewRole('customer');
                  setCustomerTab('marketplace');
                }}
                className="bg-[#286B4A] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#1F543A] transition-colors"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 p-3 rounded-xl border border-[#DCE4DB] bg-[#FFFFFF] hover:border-[#A8C5A0] transition-colors"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 object-cover rounded-lg shrink-0 bg-[#F7F8F2]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/product_bamboo_goods_1794475239108.jpg';
                  }}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#26332B] line-clamp-1">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-[#718078] hover:text-[#D9534F] p-0.5 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#718078] block truncate">
                      {product.brandName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-[#DCE4DB] rounded-lg overflow-hidden bg-[#F7F8F2]">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="p-1 hover:bg-[#DCE4DB] text-[#26332B] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-medium tabular-nums text-[#26332B]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        className="p-1 hover:bg-[#DCE4DB] text-[#26332B] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-[#26332B] tabular-nums">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#DCE4DB] bg-[#F7F8F2] space-y-3">
            <div className="space-y-1.5 text-xs text-[#718078]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#26332B] tabular-nums">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Eco Delivery</span>
                <span className="font-medium text-[#26332B] tabular-nums">
                  {deliveryFee === 0 ? <span className="text-[#3D8B5A]">FREE</span> : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#26332B] pt-2 border-t border-[#DCE4DB]">
                <span>Total Amount</span>
                <span className="text-[#286B4A] tabular-nums font-heading text-base">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#718078] leading-tight">
              🌱 Earn ~{Math.floor(cartSubtotal)} ecocommune points when this order is delivered.
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-[#286B4A] hover:bg-[#1F543A] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
