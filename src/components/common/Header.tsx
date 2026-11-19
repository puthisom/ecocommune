import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, MapPin, User, Search, Store, Shield, Sparkles, X, LogIn, LogOut } from 'lucide-react';
import { CustomerTab } from '../../types';

export const Header: React.FC = () => {
  const {
    viewRole,
    setViewRole,
    customerTab,
    setCustomerTab,
    setProfileSubTab,
    cartItemCount,
    setIsCartOpen,
    user,
    searchQuery,
    setSearchQuery,
    setBrandCollectionId,
    setSelectedCategory,
    authSession,
    logout,
    openLoginPage
  } = useApp();

  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleNavClick = (tab: CustomerTab) => {
    setViewRole('customer');
    setCustomerTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#DCE4DB] eco-shadow-sm">
      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Identity */}
        <button
          onClick={() => {
            setBrandCollectionId(null);
            setSelectedCategory('All');
            handleNavClick('marketplace');
          }}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none min-w-0 flex-1 lg:flex-initial"
        >
          <img
            src="/assets/aistudio/Minimalist_Eco_Leaf_Monogram_9945f68d.png"
            alt="ecocommune Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-xs transition-transform group-hover:scale-105 bg-[#F7F8F2] border border-[#DCE4DB] shrink-0"
          />
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#26332B] font-heading block leading-none truncate">
              ecocommune
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation Links (Visible when in Customer Mode) */}
        {viewRole === 'customer' ? (
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#26332B]">
            <button
              onClick={() => {
                setBrandCollectionId(null);
                setSelectedCategory('All');
                handleNavClick('marketplace');
              }}
              className={`transition-colors pb-0.5 whitespace-nowrap flex items-center gap-1.5 ${
                customerTab === 'marketplace'
                  ? 'text-[#286B4A] font-semibold border-b-2 border-[#286B4A]'
                  : 'text-[#718078] hover:text-[#286B4A]'
              }`}
            >
              <Store className="w-4 h-4 text-[#286B4A]" />
              Marketplace
            </button>
            <button
              onClick={() => handleNavClick('map')}
              className={`transition-colors pb-0.5 whitespace-nowrap flex items-center gap-1.5 ${
                customerTab === 'map'
                  ? 'text-[#286B4A] font-semibold border-b-2 border-[#286B4A]'
                  : 'text-[#718078] hover:text-[#286B4A]'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#286B4A]" />
              Shop Map
            </button>
            <button
              onClick={() => {
                setProfileSubTab('rewards');
                handleNavClick('profile');
              }}
              className={`transition-colors pb-0.5 whitespace-nowrap flex items-center gap-1.5 ${
                customerTab === 'profile'
                  ? 'text-[#286B4A] font-semibold border-b-2 border-[#286B4A]'
                  : 'text-[#718078] hover:text-[#286B4A]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#E6B84A]" />
              Profile & Rewards
            </button>
          </nav>
        ) : (
          <div className="hidden lg:flex items-center gap-2 text-sm text-[#718078]">
            <span className="font-medium text-[#26332B]">
              {viewRole === 'seller' ? 'Seller Management Portal' : 'Platform Administration'}
            </span>
            <span>·</span>
            <span>Sustainable Commerce Network Cambodia</span>
          </div>
        )}

        {/* Right: Search, Role Switcher, Cart, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Bar / Toggle */}
          {showSearchInput ? (
            <div className="flex items-center bg-[#F7F8F2] border border-[#DCE4DB] rounded-lg px-2.5 py-1 text-sm">
              <Search className="w-4 h-4 text-[#718078] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or shops..."
                className="bg-transparent text-xs sm:text-sm focus:outline-none w-32 sm:w-48 text-[#26332B]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setViewRole('customer');
                    setCustomerTab('marketplace');
                  }
                }}
              />
              <button
                onClick={() => {
                  setShowSearchInput(false);
                  setSearchQuery('');
                }}
                className="text-[#718078] hover:text-[#26332B] p-0.5"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-2 text-[#718078] hover:text-[#286B4A] hover:bg-[#F7F8F2] rounded-lg transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Role Switcher (Customer / Seller / Admin) */}
          <div className="hidden sm:flex items-center bg-[#F7F8F2] p-1 rounded-lg border border-[#DCE4DB] text-xs font-medium">
            <button
              onClick={() => setViewRole('customer')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                viewRole === 'customer'
                  ? 'bg-[#286B4A] text-white shadow-xs'
                  : 'text-[#718078] hover:text-[#26332B]'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setViewRole('seller')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 whitespace-nowrap ${
                viewRole === 'seller'
                  ? 'bg-[#286B4A] text-white shadow-xs'
                  : 'text-[#718078] hover:text-[#26332B]'
              }`}
            >
              <Store className="w-3 h-3" />
              Seller
            </button>
            <button
              onClick={() => setViewRole('admin')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 whitespace-nowrap ${
                viewRole === 'admin'
                  ? 'bg-[#286B4A] text-white shadow-xs'
                  : 'text-[#718078] hover:text-[#26332B]'
              }`}
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#26332B] hover:text-[#286B4A] hover:bg-[#F7F8F2] rounded-lg transition-colors"
            title="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#286B4A] text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Profile & Points Trigger */}
          <button
            onClick={() => {
              setViewRole('customer');
              setProfileSubTab('rewards');
              setCustomerTab('profile');
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F8F2] transition-colors text-left"
            title="Profile & Rewards"
          >
            <div className="w-8 h-8 rounded-full bg-[#A8C5A0]/40 text-[#286B4A] flex items-center justify-center font-semibold text-xs border border-[#A8C5A0] overflow-hidden">
              {user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user.avatar || <User className="w-4 h-4" />
              )}
            </div>
            <div className="hidden xl:block leading-tight">
              <span className="text-xs font-medium text-[#26332B] block truncate max-w-[90px]">
                {authSession.isAuthenticated ? (authSession.displayName || user.name).split(' ')[0] : 'Guest'}
              </span>
              <span className="text-[11px] font-semibold text-[#286B4A] tabular-nums block">
                {user.pointsBalance} pts
              </span>
            </div>
          </button>

          {/* Sign In / Log Out Action */}
          {authSession.isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-[#F7F8F2] hover:bg-red-50 hover:border-red-200 hover:text-[#D9534F] text-[#26332B] text-xs font-semibold transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={openLoginPage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#286B4A] hover:bg-[#1F543A] text-white text-xs font-semibold transition-colors shrink-0"
              title="Sign In"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Role Bar */}
      <div className="sm:hidden px-4 py-1.5 bg-[#F7F8F2] border-t border-[#DCE4DB] flex items-center justify-between text-xs">
        <span className="text-[#718078] font-medium">Mode:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewRole('customer')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              viewRole === 'customer' ? 'bg-[#286B4A] text-white' : 'text-[#718078]'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setViewRole('seller')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              viewRole === 'seller' ? 'bg-[#286B4A] text-white' : 'text-[#718078]'
            }`}
          >
            Seller
          </button>
          <button
            onClick={() => setViewRole('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              viewRole === 'admin' ? 'bg-[#286B4A] text-white' : 'text-[#718078]'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
