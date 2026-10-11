import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Shield, Truck, RefreshCw, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  onNavigateTab: (tab: 'home' | 'shop' | 'collections' | 'story' | 'contact') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onOpenAdmin }) => {
  const { settings } = useStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'VIP Access granted.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  };

  return (
    <footer className="bg-[#06070a] border-t border-[#161a26] text-slate-400 text-sm">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-[#161a26] py-10 bg-[#090b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#121622] border border-[#22283a] flex items-center justify-center shrink-0 text-[#00f0ff]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold tracking-tight">Express Egypt Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">24-48h in Cairo & Giza. Free shipping over EGP 2,500.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#121622] border border-[#22283a] flex items-center justify-center shrink-0 text-[#0066ff]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold tracking-tight">Cash on Delivery & InstaPay</h4>
              <p className="text-xs text-slate-400 mt-0.5">Pay upon delivery or instant bank wallet verification.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#121622] border border-[#22283a] flex items-center justify-center shrink-0 text-[#00f0ff]">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold tracking-tight">14-Day Free Exchange</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free size and fit replacements across Egypt.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <span className="font-display text-2xl font-black tracking-tighter text-white">
            {settings.logoText || 'KAIRØ // 20'}
          </span>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {settings.brandSlogan ||
              'Raw Architectural Streetwear Crafted from 480GSM Egyptian Heavyweight Combed Cotton. Designed for nocturnal urban culture.'}
          </p>
          <div className="pt-2 text-xs text-slate-500 space-y-1">
            <p>Studio: {settings.address}</p>
            <p>Direct Inquiries: {settings.supportEmail}</p>
            <p>Customer WhatsApp: {settings.supportPhone}</p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Catalog</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={() => onNavigateTab('shop')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                All Streetwear Drops
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('shop')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                480GSM Hoodies
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('shop')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                Acid Wash Graphic Tees
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('shop')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                Modular Cargo Pants
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('shop')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                Tactical Harnesses & Bags
              </button>
            </li>
          </ul>
        </div>

        {/* Navigation & Policies */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Brand</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={() => onNavigateTab('story')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                Egyptian Cotton Story
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('collections')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                SS26 Lookbook
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('contact')}
                className="hover:text-[#00f0ff] transition-colors"
              >
                Cairo Studio Visit
              </button>
            </li>
            <li>
              <button
                onClick={onOpenAdmin}
                className="hover:text-[#00f0ff] transition-colors flex items-center gap-1 text-slate-400"
              >
                <Shield className="w-3 h-3 text-[#00f0ff]" />
                Admin Dashboard (/admin)
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
            Underground Drops
          </h4>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Gain early 15-minute access to limited 100-piece runs and exclusive secret coupon codes.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="your.email@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#121622] border border-[#22283a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] transition-colors pr-10"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {status === 'success' && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                {message}
              </p>
            )}
            {status === 'error' && (
              <p className="text-[11px] text-rose-400 mt-1">{message}</p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#161a26] py-6 bg-[#040508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 {settings.brandName}. Handcrafted in Egypt. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Prices in Egyptian Pounds (EGP)</span>
            <span aria-hidden="true">·</span>
            <span>Cairo, Egypt</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
