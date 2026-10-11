import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../shop/ProductCard';
import { Product } from '../../types';

interface FeaturedDropProps {
  onViewAll: () => void;
  onQuickView: (product: Product) => void;
}

export const FeaturedDrop: React.FC<FeaturedDropProps> = ({ onViewAll, onQuickView }) => {
  const { products } = useStore();
  const featured = products.filter(p => p.isFeatured || p.isNewArrival).slice(0, 4);

  return (
    <section className="py-20 bg-[#090a0f] border-b border-[#1b1f2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00f0ff] uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CURRENT DROP / DISTRICT 20</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Featured Heavyweight Pieces
            </h2>
          </div>

          <button
            onClick={onViewAll}
            className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto group"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      </div>
    </section>
  );
};
