import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, MapPin, User } from 'lucide-react';
import { CustomerTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { customerTab, setCustomerTab, viewRole, setViewRole, setProfileSubTab } = useApp();

  if (viewRole !== 'customer') {
    return null;
  }

  const navItems: { tab: CustomerTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'marketplace', label: 'Market', icon: <Store className="w-5 h-5" /> },
    { tab: 'map', label: 'Shop Map', icon: <MapPin className="w-5 h-5" /> },
    { tab: 'profile', label: 'Profile & Rewards', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#DCE4DB] eco-shadow-sm px-2 py-1 safe-area-pb">
      <div className="grid grid-cols-3 items-center justify-around">
        {navItems.map((item) => {
          const isActive = customerTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => {
                setViewRole('customer');
                if (item.tab === 'profile') {
                  setProfileSubTab('rewards');
                }
                setCustomerTab(item.tab);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md transition-colors ${
                isActive
                  ? 'text-[#286B4A]'
                  : 'text-[#718078] hover:text-[#26332B]'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#286B4A] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] mt-1 whitespace-nowrap ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
