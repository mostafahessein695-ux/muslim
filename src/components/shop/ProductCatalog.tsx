import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';

interface ProductCatalogProps {
  onQuickView: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onQuickView }) => {
  const {
    products,
    categories,
    collections,
    selectedCategory,
    setSelectedCategory,
    selectedCollection,
    setSelectedCollection,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');
  const [selectedSize, setSelectedSize] = useState<string>('All');

  // Filter products
  const filtered = products.filter(p => {
    // Category match
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Collection match
    if (selectedCollection !== 'All' && p.collection.toLowerCase() !== selectedCollection.toLowerCase()) {
      return false;
    }
    // Size match
    if (selectedSize !== 'All' && !p.sizes.includes(selectedSize as any)) {
      return false;
    }
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    const priceA = a.salePrice ?? a.price;
    const priceB = b.salePrice ?? b.price;
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const allSizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="py-12 bg-[#090a0f] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Catalog Banner / Title */}
        <div className="mb-10 pb-6 border-b border-[#1b2030] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest mb-1.5">
              FULL ARCHIVE // ARCHITECTURAL STREETWEAR
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Catalog & Drops
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Showing <span className="text-white font-mono-num font-bold">{sorted.length}</span> pieces engineered in Cairo, Egypt.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00f0ff]" />
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#121624] border border-[#232b3e] text-white text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-[#00f0ff] cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High (EGP)</option>
              <option value="price_desc">Price: High to Low (EGP)</option>
            </select>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-6 mb-10">
          {/* 1. Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/25'
                  : 'bg-[#121622] text-slate-300 hover:text-white border border-[#202738]'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/25'
                    : 'bg-[#121622] text-slate-300 hover:text-white border border-[#202738]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 2. Sub-filters: Size selector & Collections */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0e111a] border border-[#1b2030] rounded-xl">
            {/* Sizes */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                Size:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {allSizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      selectedSize === sz
                        ? 'bg-white text-slate-950 font-bold'
                        : 'bg-[#161a26] text-slate-300 hover:text-white border border-[#242c3f]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Collection Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Collection:
              </span>
              <select
                value={selectedCollection}
                onChange={e => setSelectedCollection(e.target.value)}
                className="bg-[#161a26] border border-[#242c3f] text-slate-200 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="All">All Drops</option>
                {collections.map(col => (
                  <option key={col.id} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Active search or filter reset */}
            {(selectedCategory !== 'All' || selectedCollection !== 'All' || selectedSize !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCollection('All');
                  setSelectedSize('All');
                  setSearchQuery('');
                }}
                className="text-xs font-mono text-[#00f0ff] hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorted.map(product => (
              <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#0e111a] border border-[#1b2030] rounded-2xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white uppercase">No pieces found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              We couldn't find any streetwear drops matching your selected filters or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCollection('All');
                setSelectedSize('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              View All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
