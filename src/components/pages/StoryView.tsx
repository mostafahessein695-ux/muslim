import React from 'react';
import { ArrowRight, Compass, Shield, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StoryViewProps {
  onShopClick: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({ onShopClick }) => {
  const { settings } = useStore();

  return (
    <div className="py-16 bg-[#090a0f] text-slate-300 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block">
            GENESIS & ARCHITECTURAL PHILOSOPHY
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight [text-wrap:balance]">
            Raw Cotton. Nocturnal Geometry.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Born between the brutalist flyovers of Cairo and the Nile Delta's long-staple cotton farms.
          </p>
        </div>

        {/* Campaign Imagery Frame */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#232b3e] shadow-2xl">
          <img
            src="/src/assets/images/hero_streetwear_campaign_1791725306950.jpg"
            alt="Cairo streetwear archive"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-xs font-mono text-[#00f0ff]">
            CAIRO METROPOLIS // DISTRICT 20 PROTOCOL
          </div>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-[#0e111a] border border-[#1d2334] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#0066ff]/20 text-[#00f0ff] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">480 GSM Unbrushed Terry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard commercial hoodies use 260-320 GSM fleece that collapses after washing. We engineer double-weight 480 GSM terry loops that produce an architectural, stiff drape that holds its boxy form permanently.
            </p>
          </div>

          <div className="p-6 bg-[#0e111a] border border-[#1d2334] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#0066ff]/20 text-[#00f0ff] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Single-Origin Harvesting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every fiber originates in Egyptian soil, famed for its extra-long staple length and tensile resistance. Milled and dyed with custom mineral pigment washes directly in Alexandria and Cairo.
            </p>
          </div>

          <div className="p-6 bg-[#0e111a] border border-[#1d2334] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#0066ff]/20 text-[#00f0ff] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Strict 100-Piece Runs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We reject fast fashion and massive warehouse surpluses. Each style drop is restricted to 100 numbered pieces. When an edition sells out, its patterns are permanently archived.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <button
            onClick={onShopClick}
            className="px-8 py-3.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl inline-flex items-center gap-2 transition-all shadow-xl active:scale-95"
          >
            <span>Explore Current Drop</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
