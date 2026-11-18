import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { MarketplacePage } from './components/customer/MarketplacePage';
import { ShopMapPage } from './components/customer/ShopMapPage';
import { ProfilePage } from './components/customer/ProfilePage';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderConfirmationModal } from './components/customer/OrderConfirmationModal';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { ShopDetailModal } from './components/customer/ShopDetailModal';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginPage } from './components/auth/LoginPage';

const MainLayout: React.FC = () => {
  const { viewRole, customerTab, authSession } = useApp();
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [customerTab, viewRole]);

  if (!authSession.isAuthenticated && !authSession.isGuest) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#26332B] overflow-x-clip">
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#26332B] overflow-x-clip">
      {/* Google Maps Platform Demo Key Quota Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-0">
        {viewRole === 'customer' && (
          <>
            {customerTab === 'marketplace' && <MarketplacePage />}
            {customerTab === 'map' && <ShopMapPage />}
            {customerTab === 'profile' && <ProfilePage />}
          </>
        )}

        {viewRole === 'seller' && <SellerDashboard />}
        {viewRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <ProductDetailModal />
      <ShopDetailModal />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
