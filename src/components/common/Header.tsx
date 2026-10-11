import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Search, Shield, Menu, X, ArrowRight, Globe } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onNavigateTab: (tab: 'home' | 'shop' | 'collections' | 'story' | 'contact') => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenAdmin,
  onOpenOrders,
  onNavigateTab,
  activeTab
}) => {
  const { settings, searchQuery, setSearchQuery } = useStore();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdminAuthenticated } = useAuth();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0f]/95 backdrop-blur-md border-b border-[#1b1f2e] transition-all">
      {/* 1. Slim Announcement Bar */}
      {showAnnouncement && settings.announcementBar && (
        <div className="bg-[#0e121d] border-b border-[#1b1f2e] text-[11px] font-medium tracking-wider text-slate-300 py-1.5 px-4 flex items-center justify-between">
          <div className="w-6" /> {/* spacer for balance */}
          <div className="flex items-center gap-2 truncate text-center">
            <span className="truncate">{settings.announcementBar}</span>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-slate-500 hover:text-slate-200 transition-colors p-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Top Bar Contract: 1-Row, 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Display face, single text element) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onNavigateTab('home');
              setIsMobileMenuOpen(false);
            }}
            className="text-left group whitespace-nowrap shrink-0"
          >
            <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter text-white group-hover:text-[#00f0ff] transition-colors">
              {settings.logoText || 'KAIRØ // 20'}
            </span>
          </button>
        </div>

        {/* Zone 2: 4–5 concise, single-line text links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          <button
            onClick={() => onNavigateTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase text-xs tracking-widest ${
              activeTab === 'home'
                ? 'text-[#00f0ff] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.home}
          </button>
          <button
            onClick={() => onNavigateTab('shop')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase text-xs tracking-widest ${
              activeTab === 'shop'
                ? 'text-[#00f0ff] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.shop}
          </button>
          <button
            onClick={() => onNavigateTab('collections')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase text-xs tracking-widest ${
              activeTab === 'collections'
                ? 'text-[#00f0ff] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.collections}
          </button>
          <button
            onClick={() => onNavigateTab('story')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase text-xs tracking-widest ${
              activeTab === 'story'
                ? 'text-[#00f0ff] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.story}
          </button>
          <button
            onClick={() => onNavigateTab('contact')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase text-xs tracking-widest ${
              activeTab === 'contact'
                ? 'text-[#00f0ff] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.contact}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Search, Language Toggle beside User, Account, Cart, Admin toggle) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Search Trigger */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#141824] border border-[#262c3e] rounded-lg px-2.5 py-1.5 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-36 sm:w-48"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-white ml-1 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  if (activeTab !== 'shop') onNavigateTab('shop');
                }}
                className="p-2 text-slate-300 hover:text-white hover:bg-[#161a26] rounded-lg transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Account / Orders */}
          {isAuthenticated ? (
            <button
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#141824] hover:bg-[#1f2538] border border-[#262c3e] rounded-lg transition-colors whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="hidden sm:inline truncate max-w-[120px]">{user?.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="p-2 text-slate-300 hover:text-white hover:bg-[#161a26] rounded-lg transition-colors"
              aria-label="Account sign in"
              title={t.signIn}
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}

          {/* Language Toggle Icon Right Next to User Icon */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141824] hover:bg-[#1f2538] border border-[#262c3e] hover:border-[#00f0ff] rounded-lg text-xs font-bold transition-all text-slate-200 active:scale-95"
            title={language === 'en' ? 'تغيير اللغة إلى العربية' : 'Switch to English'}
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {language === 'en' ? 'عربي' : 'EN'}
            </span>
          </button>

          {/* Cart Bag with Tabular Count */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-lg transition-all shadow-lg shadow-[#0066ff]/20 active:scale-95"
            aria-label="Open shopping bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#00f0ff] text-slate-950 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center font-mono-num shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {/* Discreet Admin Portal Link */}
          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-lg transition-colors text-xs font-mono flex items-center gap-1 ${
              isAdminAuthenticated
                ? 'text-[#00f0ff] bg-[#121829] border border-[#00f0ff]/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-[#161a26]'
            }`}
            title="Admin Management Panel (/admin)"
            aria-label="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px]">ADMIN</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-[#161a26] rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#1b1f2e] bg-[#0c0e16] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-semibold uppercase tracking-wider">
            <button
              onClick={() => {
                onNavigateTab('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-slate-200 hover:text-[#00f0ff] py-2 border-b border-[#1b1f2e]"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigateTab('shop');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-slate-200 hover:text-[#00f0ff] py-2 border-b border-[#1b1f2e]"
            >
              Shop All Streetwear
            </button>
            <button
              onClick={() => {
                onNavigateTab('collections');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-slate-200 hover:text-[#00f0ff] py-2 border-b border-[#1b1f2e]"
            >
              Collections
            </button>
            <button
              onClick={() => {
                onNavigateTab('story');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-slate-200 hover:text-[#00f0ff] py-2 border-b border-[#1b1f2e]"
            >
              Brand Heritage & Craft
            </button>
            <button
              onClick={() => {
                onNavigateTab('contact');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-slate-200 hover:text-[#00f0ff] py-2"
            >
              Contact & Studio
            </button>
          </div>

          <div className="pt-4 border-t border-[#1b1f2e] flex flex-col gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#141824] border border-[#262c3e] text-center text-xs font-bold uppercase tracking-wider text-white rounded-lg"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenOrders();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#141824] border border-[#262c3e] text-center text-xs font-bold uppercase tracking-wider text-[#00f0ff] rounded-lg"
              >
                My Account & Orders ({user?.name})
              </button>
            )}
            <button
              onClick={() => {
                onOpenAdmin();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-[#0c101c] border border-[#1d263b] text-center text-xs font-mono text-slate-400 hover:text-white rounded-lg flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-[#00f0ff]" />
              Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
