import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Hero } from './components/home/Hero';
import { FeaturedDrop } from './components/home/FeaturedDrop';
import { CollectionBento } from './components/home/CollectionBento';
import { StoryBanner } from './components/home/StoryBanner';
import { CustomerReviews } from './components/home/CustomerReviews';
import { ProductCatalog } from './components/shop/ProductCatalog';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { CustomerOrdersModal } from './components/account/CustomerOrdersModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StoryView } from './components/pages/StoryView';
import { ContactView } from './components/pages/ContactView';
import { CollectionsView } from './components/pages/CollectionsView';
import { EntryGate } from './components/gate/EntryGate';
import { Product, Order } from './types';

function MainApp() {
  const { setSelectedCategory, setSelectedCollection } = useStore();
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const { isRtl } = useLanguage();

  // Entrance gate state: user must first choose language and sign in (or enter as guest)
  const [hasEnteredGate, setHasEnteredGate] = useState<boolean>(() => {
    return sessionStorage.getItem('kd_entered_gate') === 'true';
  });

  // Navigation tab: 'home' | 'shop' | 'collections' | 'story' | 'contact'
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'collections' | 'story' | 'contact'>('home');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Check URL path for /admin
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdminOpen(true);
      setHasEnteredGate(true);
    }
  }, []);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleNavigateTab = (tab: 'home' | 'shop' | 'collections' | 'story' | 'contact') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromBento = (catName: string) => {
    setSelectedCategory(catName);
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCollection = (colName: string) => {
    setSelectedCollection(colName);
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishEntryGate = () => {
    setHasEnteredGate(true);
    sessionStorage.setItem('kd_entered_gate', 'true');
  };

  // If user hasn't completed entry gate, show the dedicated welcome entrance view
  if (!hasEnteredGate) {
    return <EntryGate onEnterStore={handleFinishEntryGate} />;
  }

  return (
    <div
      className={`min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-[#00f0ff] selection:text-black ${
        isRtl ? 'text-right' : 'text-left'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Bar Header with Language Switch Icon beside User Icon */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onNavigateTab={handleNavigateTab}
        activeTab={activeTab}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onShopClick={() => handleNavigateTab('shop')}
              onCollectionsClick={() => handleNavigateTab('collections')}
            />
            <FeaturedDrop
              onViewAll={() => handleNavigateTab('shop')}
              onQuickView={handleQuickView}
            />
            <CollectionBento onSelectCategory={handleSelectCategoryFromBento} />
            <StoryBanner onShopClick={() => handleNavigateTab('shop')} />
            <CustomerReviews />
          </>
        )}

        {activeTab === 'shop' && (
          <ProductCatalog onQuickView={handleQuickView} />
        )}

        {activeTab === 'collections' && (
          <CollectionsView onSelectCollection={handleSelectCollection} />
        )}

        {activeTab === 'story' && (
          <StoryView onShopClick={() => handleNavigateTab('shop')} />
        )}

        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* Footer */}
      <Footer
        onNavigateTab={handleNavigateTab}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={p => setSelectedProduct(p)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order: Order) => {
          // Handled inside checkout modal
        }}
      />

      {/* Customer Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Customer Past Orders Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.pathname === '/admin') {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </LanguageProvider>
  );
}
