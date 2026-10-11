import React from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const hasSale = product.salePrice && product.salePrice < product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 'M';
    const defaultColor = product.colors[0] || 'Black';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group cursor-pointer bg-[#0e111a] border border-[#1b2030] rounded-xl overflow-hidden hover:border-[#2f3954] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
    >
      {/* Product Image Slot (65-75% height) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141724]">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
            NO IMAGE
          </div>
        )}

        {/* Quiet text kicker / single subtle tag */}
        <div className="absolute top-3 left-3">
          {product.isNewArrival && (
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#00f0ff] bg-black/75 px-2 py-0.5 rounded backdrop-blur-sm">
              NEW DROP
            </span>
          )}
          {!product.isNewArrival && product.isFeatured && (
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300 bg-black/75 px-2 py-0.5 rounded backdrop-blur-sm">
              LIMITED RUN
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
          <button
            onClick={handleQuickAdd}
            className="px-3.5 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            title="Quick add default size"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Bag</span>
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2 bg-[#141824]/90 hover:bg-[#1e2436] text-white rounded-lg backdrop-blur-sm transition-all"
            title="View details & size chart"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Metadata Module */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors line-clamp-1 mt-0.5">
            {product.name}
          </h3>
        </div>

        <div className="pt-2 flex items-baseline justify-between border-t border-[#1a1f2e]">
          {/* Price formatted in EGP */}
          <div className="flex items-baseline gap-2 font-mono-num">
            {hasSale ? (
              <>
                <span className="text-sm font-bold text-white">
                  EGP {product.salePrice?.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 line-through">
                  EGP {product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-white">
                EGP {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Sizes available unboxed */}
          <div className="text-[11px] text-slate-400 font-mono">
            {product.sizes.slice(0, 3).join(' · ')}
            {product.sizes.length > 3 ? ' +' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
