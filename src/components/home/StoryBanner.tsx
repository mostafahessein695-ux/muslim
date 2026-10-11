import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StoryBannerProps {
  onShopClick: () => void;
}

export const StoryBanner: React.FC<StoryBannerProps> = ({ onShopClick }) => {
  const { settings } = useStore();

  return (
    <section className="py-24 bg-[#090a0f] border-b border-[#1b1f2e] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Image Collage / Campaign Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-[#22293c] aspect-[4/3] bg-[#121622]">
            <img
              src="/src/assets/images/hero_streetwear_campaign_1791725306950.jpg"
              alt="Streetwear campaign in Cairo industrial backdrop"
              className="w-full h-full object-cover object-left"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f]/90 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#090a0f]/90 backdrop-blur-md rounded-xl border border-[#232b3e]">
              <p className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest">
                CAIRO FABRICATION SPECIFICATION
              </p>
              <p className="text-sm text-slate-200 mt-1 font-semibold">
                Single-origin long-staple cotton harvested in Kafr El Sheikh, milled in Alexandria.
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Manifesto */}
          <div className="space-y-6">
            <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block">
              OUR MANIFESTO // 01
            </span>

            <h2 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-[1.05] [text-wrap:balance]">
              {settings.promoBannerTitle || 'THE ARCHITECTURAL CUT'}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Egypt produces the most coveted raw cotton in the world, yet global streetwear brands source it, re-label it abroad, and sell it back at extreme markups.
            </p>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              KAIRØ DISTRICT reverses the equation: We craft heavyweight 480GSM French terry and 280GSM carded jersey directly at the source. Designed for the nocturnal streets of Cairo with razor-sharp oversized cuts, industrial anodized hardware, and uncompromising durability.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-[#0066ff]/20 text-[#00f0ff] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Strict limited batch production — 100 numbered pieces per drop.</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-[#0066ff]/20 text-[#00f0ff] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Double-density unbrushed French terry that never shrinks or loses structure.</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-[#0066ff]/20 text-[#00f0ff] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Local Cairo studio fulfillment with cash on delivery and InstaPay.</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onShopClick}
                className="px-6 py-3 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Experience The Fabric</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
