import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ViewRole } from '../../types';
import {
  User,
  Store,
  Shield,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const ROLE_CONFIG: Record<
  ViewRole,
  {
    label: string;
    title: string;
    subtitle: string;
    demoEmail: string;
    demoPassword: string;
    icon: React.ReactNode;
  }
> = {
  customer: {
    label: 'User',
    title: 'Customer Sign In',
    subtitle: 'Shop sustainable Cambodian brands, discover refill shops, and earn eco-points.',
    demoEmail: 'sophea.chan@ecocommune.kh',
    demoPassword: 'eco123',
    icon: <User className="w-4 h-4" />
  },
  seller: {
    label: 'Seller',
    title: 'Partner Seller Portal',
    subtitle: 'Manage your eco-friendly product catalog, fulfill orders, and update shop info.',
    demoEmail: 'seller@ecocommune.kh',
    demoPassword: 'seller123',
    icon: <Store className="w-4 h-4" />
  },
  admin: {
    label: 'Admin',
    title: 'Platform Administration',
    subtitle: 'Verify participating businesses, oversee orders, rewards, and commission rates.',
    demoEmail: 'admin@ecocommune.kh',
    demoPassword: 'admin123',
    icon: <Shield className="w-4 h-4" />
  }
};

export const LoginPage: React.FC = () => {
  const { login, continueAsGuest, brands } = useApp();

  const [selectedRole, setSelectedRole] = useState<ViewRole>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [sellerBrandId, setSellerBrandId] = useState<string>(brands[0]?.id || 'brand-1');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleInfo = ROLE_CONFIG[selectedRole];

  const handleRoleChange = (role: ViewRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setIsSignUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await login({
        role: selectedRole,
        email,
        password,
        name: isSignUp ? name : undefined,
        phone: isSignUp ? phone : undefined,
        sellerBrandId: selectedRole === 'seller' ? sellerBrandId : undefined,
        isSignUp
      });

      if (!result.success) {
        setErrorMsg(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsSignUp(false);
    setErrorMsg('');
    setEmail(roleInfo.demoEmail);
    setPassword(roleInfo.demoPassword);

    const result = await login({
      role: selectedRole,
      email: roleInfo.demoEmail,
      password: roleInfo.demoPassword,
      sellerBrandId: selectedRole === 'seller' ? sellerBrandId : undefined,
      isSignUp: false
    });

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F2] text-[#26332B] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left Editorial Panel (Desktop / Tablet Showcase) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] eco-shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Minimalist_Eco_Leaf_Monogram_9945f68d.png"
                alt="ecocommune Logo"
                className="w-11 h-11 rounded-xl object-cover bg-[#F7F8F2] border border-[#DCE4DB] shrink-0"
              />
              <span className="text-2xl font-bold tracking-tight text-[#26332B] font-heading">
                ecocommune
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#26332B] font-heading leading-snug">
                Sustainable Local Commerce in Cambodia
              </h1>
              <p className="text-sm text-[#718078] leading-relaxed">
                Sign in to access your personalized marketplace, partner store dashboard, or platform governance portal.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8F2] border border-[#DCE4DB]">
                <CheckCircle2 className="w-4 h-4 text-[#286B4A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#26332B] block">User Marketplace</span>
                  <span className="text-[#718078]">Browse eco-friendly goods, locate Phnom Penh shops, and redeem points.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8F2] border border-[#DCE4DB]">
                <CheckCircle2 className="w-4 h-4 text-[#286B4A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#26332B] block">Seller Operations</span>
                  <span className="text-[#718078]">List sustainable products, manage stock, and complete customer deliveries.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8F2] border border-[#DCE4DB]">
                <CheckCircle2 className="w-4 h-4 text-[#286B4A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#26332B] block">Admin Governance</span>
                  <span className="text-[#718078]">Audit merchants, configure rewards vouchers, and monitor commissions.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-44 sm:h-52 hidden sm:block">
            <img
              src="/src/assets/images/hero_sustainable_cambodia_1794475237727.jpg"
              alt="Sustainable lifestyle products in Cambodia"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#26332B]/70 via-[#26332B]/20 to-transparent flex items-end p-5">
              <p className="text-xs text-white/95 font-medium">
                Connecting local refill stations & zero-waste makers across Phnom Penh
              </p>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] eco-shadow-modal p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Role Tabs: User / Seller / Admin */}
            <div>
              <label className="block text-xs font-semibold text-[#718078] uppercase tracking-wider mb-2">
                Select Account Role
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[#F7F8F2] p-1.5 rounded-xl border border-[#DCE4DB]">
                {(['customer', 'seller', 'admin'] as ViewRole[]).map((roleKey) => {
                  const item = ROLE_CONFIG[roleKey];
                  const active = selectedRole === roleKey;
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleRoleChange(roleKey)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                        active
                          ? 'bg-[#286B4A] text-white shadow-xs'
                          : 'text-[#718078] hover:text-[#26332B] hover:bg-[#FFFFFF]/70'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Header + Sign In / Create Account Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#26332B] font-heading">
                  {isSignUp ? `Create ${roleInfo.label} Account` : roleInfo.title}
                </h2>
                <p className="text-xs text-[#718078] mt-0.5">{roleInfo.subtitle}</p>
              </div>

              {selectedRole !== 'admin' && (
                <div className="inline-flex rounded-lg bg-[#F7F8F2] p-1 border border-[#DCE4DB] text-xs font-semibold shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMsg('');
                    }}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      !isSignUp ? 'bg-[#FFFFFF] text-[#286B4A] shadow-xs' : 'text-[#718078]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMsg('');
                    }}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      isSignUp ? 'bg-[#FFFFFF] text-[#286B4A] shadow-xs' : 'text-[#718078]'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Error Feedback */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D9534F]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login / Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && selectedRole !== 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-[#26332B] mb-1.5">
                    {selectedRole === 'seller' ? 'Owner / Contact Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'seller' ? 'e.g. Dara Sok' : 'e.g. Sophea Chan'}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#DCE4DB] rounded-lg focus:outline-none focus:border-[#286B4A] text-[#26332B]"
                  />
                </div>
              )}

              {selectedRole === 'seller' && (
                <div>
                  <label className="block text-xs font-semibold text-[#26332B] mb-1.5">
                    Partner Shop
                  </label>
                  <select
                    value={sellerBrandId}
                    onChange={(e) => setSellerBrandId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#DCE4DB] rounded-lg focus:outline-none focus:border-[#286B4A] text-[#26332B]"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name} — {brand.district}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#26332B] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#718078] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={roleInfo.demoEmail}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#DCE4DB] rounded-lg focus:outline-none focus:border-[#286B4A] text-[#26332B]"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-[#26332B] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#718078] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +855 12 345 678"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#DCE4DB] rounded-lg focus:outline-none focus:border-[#286B4A] text-[#26332B]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#26332B] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#718078] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min. 6 characters)"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FFFFFF] border border-[#DCE4DB] rounded-lg focus:outline-none focus:border-[#286B4A] text-[#26332B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#26332B] p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#286B4A] hover:bg-[#1F543A] text-white font-semibold text-sm rounded-[10px] transition-colors shadow-xs flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? 'Please wait...'
                    : isSignUp
                      ? `Create ${roleInfo.label} Account`
                      : `Sign In as ${roleInfo.label}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access Box */}
            <div className="bg-[#EDF4EB]/75 border border-[#A8C5A0] rounded-xl p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#286B4A]">
                  <Sparkles className="w-4 h-4 text-[#E6B84A]" />
                  <span>Quick Demo Access ({roleInfo.label})</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="px-3 py-1.5 bg-[#286B4A] hover:bg-[#1F543A] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  Fill Demo & Sign In
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#26332B] bg-[#FFFFFF]/80 p-2.5 rounded-lg border border-[#DCE4DB]">
                <div className="truncate">
                  <span className="text-[#718078]">Email: </span>
                  <span className="font-mono font-semibold">{roleInfo.demoEmail}</span>
                </div>
                <div>
                  <span className="text-[#718078]">Password: </span>
                  <span className="font-mono font-semibold">{roleInfo.demoPassword}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Browsing Footer */}
          <div className="pt-4 border-t border-[#DCE4DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-[#718078]">
              Just exploring sustainable shops in Phnom Penh?
            </span>
            <button
              type="button"
              onClick={continueAsGuest}
              className="font-semibold text-[#286B4A] hover:text-[#1F543A] hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>Continue to Marketplace as Guest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
