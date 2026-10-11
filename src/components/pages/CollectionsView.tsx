import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CollectionsViewProps {
  onSelectCollection: (name: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({ onSelectCollection }) => {
  const { collections } = useStore();

  const curatedDrops = [
    {
      name: 'District Cyber 20',
      season: 'Drop 01 // Spring Summer 2026',
      desc: 'Aggressive heavyweight 480GSM boxy silhouettes, articulated modular ripstop cargo trousers, and water-repellent Cordura harnesses.',
      image: '/src/assets/images/hero_streetwear_campaign_1791725306950.jpg',
      tag: 'FLAGSHIP DROP'
    },
    {
      name: 'Electric Mirage',
      season: 'Summer 2026',
      desc: 'Acid stone-washed combed cotton jersey, distressed digital cyan screen prints, and relaxed dropped shoulder proportions.',
      image: '/src/assets/images/product_acid_tee_1791725337324.jpg',
      tag: 'SUMMER RUN'
    },
    {
      name: 'Core Essentials',
      season: 'Perpetual Archive',
      desc: 'Minimalist blank foundations crafted from raw unbrushed Egyptian cotton for daily utilitarian wear.',
      image: '/src/assets/images/product_cargo_pants_1791725327850.jpg',
      tag: 'ALL-YEAR ESSENTIALS'
    }
  ];

  return (
    <div className="py-16 bg-[#090a0f] text-slate-300 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block">
            LOOKBOOK & SEASONAL ARCHIVES
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            Curated Drops
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Each collection is produced in strictly limited editions of 100 units. Discover the conceptual stories behind our seasonal capsules.
          </p>
        </div>

        <div className="space-y-12">
          {curatedDrops.map((drop, idx) => (
            <div
              key={drop.name}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-6 sm:p-8 bg-[#0c0f18] border border-[#1b2234] rounded-2xl ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#121624] border border-[#232b3e]">
                <img
                  src={drop.image}
                  alt={drop.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#00f0ff] bg-black/80 px-2.5 py-1 rounded backdrop-blur-sm">
                    {drop.tag}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  {drop.season}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {drop.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {drop.desc}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectCollection(drop.name)}
                    className="px-6 py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#0066ff]/25"
                  >
                    <span>Shop {drop.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
