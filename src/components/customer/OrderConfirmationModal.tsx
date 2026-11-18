import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, Package, ArrowRight, Sparkles, MapPin } from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const {
    orderConfirmation,
    setOrderConfirmation,
    setCustomerTab,
    setViewRole
  } = useApp();

  if (!orderConfirmation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setOrderConfirmation(null)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl eco-shadow-modal overflow-hidden z-10 border border-[#DCE4DB] p-6 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-[#EDF4EB] text-[#286B4A] mx-auto flex items-center justify-center mb-4">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#26332B] font-heading mb-1">
          Your order has been placed successfully!
        </h2>
        <p className="text-xs sm:text-sm text-[#718078] max-w-sm mx-auto mb-5">
          Thank you for making a conscious choice to support local sustainable businesses in Cambodia.
        </p>

        {/* Order Details Summary Box */}
        <div className="bg-[#F7F8F2] rounded-xl p-4 border border-[#DCE4DB] text-left text-xs space-y-2 mb-5">
          <div className="flex justify-between items-center pb-2 border-b border-[#DCE4DB]">
            <span className="text-[#718078]">Order Reference:</span>
            <span className="font-mono font-bold text-[#286B4A]">{orderConfirmation.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#718078]">Fulfilling Seller:</span>
            <span className="font-semibold text-[#26332B]">{orderConfirmation.sellerName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#718078]">Total Paid:</span>
            <span className="font-bold text-[#26332B] tabular-nums">${orderConfirmation.total.toFixed(2)}</span>
          </div>

          <div className="flex items-start gap-1.5 pt-1 text-[#718078]">
            <MapPin className="w-3.5 h-3.5 text-[#286B4A] shrink-0 mt-0.5" />
            <span className="line-clamp-1">{orderConfirmation.deliveryAddress}</span>
          </div>
        </div>

        {/* Notice on Seller Delivery & Points */}
        <div className="bg-[#EDF4EB] border border-[#A8C5A0]/60 rounded-xl p-3 text-left text-xs text-[#26332B] space-y-1.5 mb-6">
          <div className="flex items-center gap-1.5 text-[#286B4A] font-semibold">
            <Package className="w-4 h-4" />
            <span>Seller Arranged Delivery</span>
          </div>
          <p className="text-[11px] text-[#26332B]/80 leading-relaxed">
            The participating local brand ({orderConfirmation.sellerName}) will pack your order with minimal plastic-free packaging and dispatch local green delivery.
          </p>
          <div className="flex items-center gap-1.5 text-[#286B4A] font-semibold pt-1">
            <Sparkles className="w-4 h-4 text-[#E6B84A]" />
            <span>Points on Completion</span>
          </div>
          <p className="text-[11px] text-[#26332B]/80 leading-relaxed">
            You will receive <strong>+{Math.floor(orderConfirmation.subtotal)} ecocommune points</strong> as soon as the merchant confirms package delivery!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              setOrderConfirmation(null);
              setViewRole('customer');
              setCustomerTab('profile');
            }}
            className="flex-1 bg-[#286B4A] hover:bg-[#1F543A] text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setOrderConfirmation(null)}
            className="flex-1 bg-[#F7F8F2] hover:bg-[#DCE4DB] text-[#26332B] py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
