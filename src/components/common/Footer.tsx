import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Heart, ShieldCheck, RefreshCw, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCustomerTab, setProfileSubTab, setViewRole, setSelectedCategory, setBrandCollectionId } = useApp();

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#DCE4DB] text-xs text-[#718078] mt-16">
      <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/Minimalist_Eco_Leaf_Monogram_9945f68d.png"
                alt="ecocommune Logo"
                className="w-8 h-8 rounded-lg object-cover shadow-xs bg-[#F7F8F2] border border-[#DCE4DB]"
              />
              <span className="text-lg font-bold text-[#26332B] font-heading">
                ecocommune
              </span>
            </div>
            <p className="text-xs text-[#718078] leading-relaxed max-w-sm">
              ecocommune is a digital marketplace connecting environmentally conscious consumers with local sustainable businesses across Cambodia. Discover zero-waste refill shops, plastic-free essentials, and earn points with every mindful purchase.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#286B4A] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#286B4A]" />
              <span>Phnom Penh, Kingdom of Cambodia</span>
            </div>
          </div>

          {/* Customer Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#26332B] font-heading">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setSelectedCategory('All');
                    setBrandCollectionId(null);
                    setCustomerTab('marketplace');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  Sustainable Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setCustomerTab('map');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  Physical Shop Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setProfileSubTab('rewards');
                    setCustomerTab('profile');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  Rewards Program
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setProfileSubTab('orders');
                    setCustomerTab('profile');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  My Account & Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#26332B] font-heading">
              Categories
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setSelectedCategory('Reusable Products');
                    setCustomerTab('marketplace');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  Reusable Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setSelectedCategory('Refill Products');
                    setCustomerTab('marketplace');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  Refill Grocers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setSelectedCategory('Recycled Products');
                    setCustomerTab('marketplace');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  Upcycled Materials
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewRole('customer');
                    setSelectedCategory('Plastic-Free Alternatives');
                    setCustomerTab('marketplace');
                  }}
                  className="hover:text-[#286B4A] transition-colors"
                >
                  Plastic-Free Alternatives
                </button>
              </li>
            </ul>
          </div>

          {/* Portal Switch & Prototype Notes */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#26332B] font-heading">
              Demonstration
            </h4>
            <p className="text-[11px] text-[#718078] leading-relaxed">
              Designed as a comprehensive prototype for university capstone & final year project presentation.
            </p>
            <div className="pt-2 flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => setViewRole('seller')}
                className="text-left font-semibold text-[#286B4A] hover:underline"
              >
                Access Seller Dashboard →
              </button>
              <button
                onClick={() => setViewRole('admin')}
                className="text-left font-semibold text-[#286B4A] hover:underline"
              >
                Access Admin Portal →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-[#DCE4DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} ecocommune Cambodia. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[#718078]">
            <span>Crafted for sustainable communities in Phnom Penh</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
