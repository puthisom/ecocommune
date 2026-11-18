import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, MapPin, Phone, User, Truck, Check } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    user,
    addresses,
    placeOrder
  } = useApp();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const defaultAddr = addresses.find((a) => a.isDefault);
    return defaultAddr ? defaultAddr.id : addresses[0]?.id || 'custom';
  });

  const [recipientName, setRecipientName] = useState(user.name);
  const [recipientPhone, setRecipientPhone] = useState(user.phone);
  const [customAddress, setCustomAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('Please call upon arrival. Bring reusable bag if applicable.');

  if (!isCheckoutOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalAddress = customAddress;
    if (selectedAddressId !== 'custom') {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (selected) {
        finalAddress = `${selected.streetAddress}, ${selected.district}, ${selected.city}`;
      }
    }

    if (!finalAddress.trim()) {
      alert('Please enter or select a delivery address in Phnom Penh.');
      return;
    }

    placeOrder({
      name: recipientName,
      phone: recipientPhone,
      address: finalAddress,
      notes: deliveryNotes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#26332B]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCheckoutOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl eco-shadow-modal overflow-hidden z-10 max-h-[90vh] flex flex-col border border-[#DCE4DB]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#DCE4DB] flex items-center justify-between bg-[#F7F8F2]">
          <div>
            <h2 className="text-xl font-bold text-[#26332B] font-heading">
              Complete Your Sustainable Order
            </h2>
            <p className="text-xs text-[#718078] mt-0.5">
              Simulated demonstration checkout · Phnom Penh, Cambodia
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-[#718078] hover:text-[#26332B] rounded-lg hover:bg-[#DCE4DB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {/* Prototype Notice */}
          <div className="bg-[#EDF4EB] border border-[#A8C5A0] rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#286B4A]">
            <ShieldCheck className="w-5 h-5 text-[#286B4A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Demonstration Checkout Mode</p>
              <p className="text-[#26332B]/80 mt-0.5 leading-relaxed">
                This is a functional prototype. No actual credit card or real payment is processed. Delivery will be arranged directly by the participating green seller via local eco-courier.
              </p>
            </div>
          </div>

          {/* Customer Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#26332B] flex items-center gap-1.5 font-heading">
              <User className="w-4 h-4 text-[#286B4A]" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#718078] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE4DB] focus:outline-none focus:border-[#286B4A] bg-[#FFFFFF]"
                  placeholder="e.g. Sophea Chan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#718078] mb-1">
                  Phone Number (Telegram / Call)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#718078] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#DCE4DB] focus:outline-none focus:border-[#286B4A] bg-[#FFFFFF]"
                    placeholder="+855 12 345 678"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#26332B] flex items-center gap-1.5 font-heading">
              <MapPin className="w-4 h-4 text-[#286B4A]" />
              Phnom Penh Delivery Address
            </h3>

            {/* Address Selector */}
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? 'border-[#286B4A] bg-[#EDF4EB]/40'
                      : 'border-[#DCE4DB] hover:border-[#A8C5A0]'
                  }`}
                >
                  <input
                    type="radio"
                    name="addressSelection"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 text-[#286B4A] focus:ring-[#286B4A]"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#26332B] mr-2">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-[#A8C5A0]/40 text-[#286B4A] px-1.5 py-0.5 rounded font-medium">
                        Default
                      </span>
                    )}
                    <p className="text-[#26332B] mt-0.5">
                      {addr.streetAddress}, {addr.district}, {addr.city}
                    </p>
                    <p className="text-[#718078] text-[11px] mt-0.5">Contact: {addr.phone}</p>
                  </div>
                </label>
              ))}

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedAddressId === 'custom'
                    ? 'border-[#286B4A] bg-[#EDF4EB]/40'
                    : 'border-[#DCE4DB] hover:border-[#A8C5A0]'
                }`}
              >
                <input
                  type="radio"
                  name="addressSelection"
                  checked={selectedAddressId === 'custom'}
                  onChange={() => setSelectedAddressId('custom')}
                  className="mt-1 text-[#286B4A] focus:ring-[#286B4A]"
                />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-[#26332B]">
                    Enter New Phnom Penh Address
                  </span>
                  {selectedAddressId === 'custom' && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="House / Street / Sangkat / Khan (e.g. Street 302, BKK1, Phnom Penh)"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCE4DB] focus:outline-none focus:border-[#286B4A]"
                        required={selectedAddressId === 'custom'}
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#718078] mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Leave at guardhouse or call when nearby"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCE4DB] focus:outline-none focus:border-[#286B4A]"
              />
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="space-y-2 pt-2 border-t border-[#DCE4DB]">
            <h3 className="text-xs font-semibold text-[#718078] uppercase tracking-wider">
              Order Summary ({cart.length} unique products)
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-[#F7F8F2]"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-semibold text-[#286B4A] tabular-nums">
                      {item.quantity}x
                    </span>
                    <span className="text-[#26332B] truncate">{item.product.name}</span>
                    <span className="text-[#718078] hidden sm:inline text-[11px]">
                      ({item.product.brandName})
                    </span>
                  </div>
                  <span className="font-semibold text-[#26332B] tabular-nums shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-[#F7F8F2] p-4 rounded-xl border border-[#DCE4DB] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#718078]">
              <span>Subtotal</span>
              <span className="font-medium text-[#26332B] tabular-nums">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#718078]">
              <span>Eco Bicycle Delivery</span>
              <span className="font-medium text-[#26332B] tabular-nums">
                {deliveryFee === 0 ? <span className="text-[#3D8B5A]">FREE</span> : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#26332B] pt-2 border-t border-[#DCE4DB]">
              <span>Total Payable</span>
              <span className="text-[#286B4A] font-heading text-lg tabular-nums">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#718078] hover:bg-[#F7F8F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#286B4A] hover:bg-[#1F543A] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Place Order (${cartTotal.toFixed(2)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
