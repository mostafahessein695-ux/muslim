import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroProps {
  onShopClick: () => void;
  onCollectionsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onCollectionsClick }) => {
  const { settings } = useStore();

  return (
    <section className="relative w-full bg-[#090a0f] overflow-hidden border-b border-[#1b1f2e]">
      {/* Background Graphic Image with Measured Scrim */}
      <div className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_streetwear_campaign_1791725306950.jpg"
            alt="Streetwear campaign models in brutalist concrete landscape"
            className="w-full h-full object-cover object-center scale-100 filter brightness-75 contrast-110"
            referrerPolicy="no-referrer"
          />
          {/* Measured gradient scrim for WCAG AA contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/50 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Unboxed Kicker metadata without pill enclosure */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#00f0ff] uppercase">
              <Flame className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>LIMITED RUN DROP 01</span>
              <span aria-hidden="true">/</span>
              <span>100% EGYPTIAN COTTON</span>
              <span aria-hidden="true">/</span>
              <span>SS26</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-[0.95] [text-wrap:balance]">
              {settings.heroHeadline || 'DISTRICT CYBER 20 // SS26'}
            </h1>

            {/* Subheadline Prose */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
              {settings.heroSubheadline ||
                'Engineered heavyweight streetwear tailored for underground night culture. Handcrafted in Egypt from 480GSM combed cotton with industrial finishes.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onShopClick}
                className="px-7 py-3.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all shadow-xl shadow-[#0066ff]/25 active:scale-95 group"
              >
                <span>Shop New Drop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onCollectionsClick}
                className="px-7 py-3.5 bg-[#121624]/90 hover:bg-[#1a2033] border border-[#2b354e] text-slate-200 hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95"
              >
                Explore Lookbook
              </button>
            </div>

            {/* Proof Metric Adjacency */}
            <div className="pt-6 border-t border-white/10 flex items-center gap-6 text-xs text-slate-400 font-medium">
              <div>
                <span className="text-white font-mono-num font-bold text-sm block">480 GSM</span>
                <span>Heavy French Terry</span>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div>
                <span className="text-white font-mono-num font-bold text-sm block">100 UNITS</span>
                <span>Per Edition Run</span>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div>
                <span className="text-white font-mono-num font-bold text-sm block">24-48H</span>
                <span>Cairo Express Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
