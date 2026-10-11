import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Ruler, ArrowRight, Truck } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { products } = useStore();

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Black');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  // Check inventory stock for selected size & color variant
  const currentVariant = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );
  const stockAvailable = currentVariant ? currentVariant.stock : product.totalStock;
  const isOutOfStock = stockAvailable <= 0 || product.status === 'Out of Stock';

  const hasSale = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  // Related products
  const related = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.collection === product.collection))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#090b11] border border-[#1d2334] rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-[#0d101a] border-b md:border-b-0 md:border-r border-[#1a2030] flex flex-col justify-between">
            <div className="space-y-4">
              {/* Primary Image */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#141824] border border-[#222a3d]">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                {product.isNewArrival && (
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-[#00f0ff] font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded">
                    NEW ARRIVAL
                  </div>
                )}
              </div>

              {/* Thumbnails if multiple */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border transition-all ${
                        activeImageIdx === i ? 'border-[#00f0ff] scale-95' : 'border-[#222a3d] opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 mt-6 border-t border-[#1a2030] grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00f0ff] shrink-0" />
                <span>Express Egypt delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
                <span>100% combed cotton</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Collection */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase">
                <span>{product.collection}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#00f0ff]">{product.category}</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                {product.name}
              </h1>

              {/* Price in Egyptian Pounds (EGP) */}
              <div className="flex items-baseline gap-3 pt-1">
                {hasSale ? (
                  <>
                    <span className="text-2xl font-black text-white font-mono-num">
                      EGP {product.salePrice?.toLocaleString()}
                    </span>
                    <span className="text-base text-slate-500 line-through font-mono-num">
                      EGP {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      SAVE EGP {((product.price - (product.salePrice || 0))).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-black text-white font-mono-num">
                    EGP {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
                  Colorway: <span className="text-white font-bold">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                        selectedColor === col
                          ? 'border-[#00f0ff] bg-[#141b2b] text-white shadow-sm'
                          : 'border-[#222a3d] bg-[#0d101a] text-slate-400 hover:text-white'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                    Size (Oversized Silhouette):
                  </label>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs text-[#00f0ff] hover:underline flex items-center gap-1 font-mono"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map(size => {
                    const variantForSize = product.variants.find(
                      v => v.size === size && v.color === selectedColor
                    );
                    const isSizeAvailable = variantForSize ? variantForSize.stock > 0 : true;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!isSizeAvailable}
                        className={`py-2 text-xs font-mono rounded-lg border transition-all text-center ${
                          selectedSize === size
                            ? 'border-white bg-white text-slate-950 font-bold'
                            : isSizeAvailable
                            ? 'border-[#222a3d] bg-[#0d101a] text-slate-300 hover:border-slate-400'
                            : 'border-[#1b2030] bg-black/40 text-slate-600 cursor-not-allowed line-through'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Real Inventory Stock Notice */}
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  {isOutOfStock ? (
                    <span className="text-rose-400 font-bold">SOLD OUT IN THIS VARIANT</span>
                  ) : stockAvailable <= 10 ? (
                    <span className="text-amber-400 font-bold">
                      ONLY {stockAvailable} UNITS LEFT IN STOCK
                    </span>
                  ) : (
                    <span className="text-emerald-400">
                      IN STOCK ({stockAvailable} UNITS AVAILABLE)
                    </span>
                  )}
                </div>
              </div>

              {/* Sizing Guide Drawer Preview */}
              {showSizeGuide && (
                <div className="p-3 bg-[#121624] border border-[#232b3e] rounded-lg text-xs space-y-1.5 text-slate-300">
                  <p className="font-bold text-white">Gen Z Oversized Boxy Measurement Chart:</p>
                  <p>• Size S: Chest 120cm, Length 72cm (Recommended for 165-175cm)</p>
                  <p>• Size M: Chest 126cm, Length 74cm (Recommended for 175-182cm)</p>
                  <p>• Size L: Chest 132cm, Length 76cm (Recommended for 180-188cm)</p>
                  <p>• Size XL/XXL: Chest 138cm+, Length 78cm (Aggressive oversized drape)</p>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Quantity:</span>
                <div className="flex items-center border border-[#222a3d] rounded-lg bg-[#0d101a]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-mono text-xs text-white font-bold font-mono-num">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                    disabled={quantity >= stockAvailable || isOutOfStock}
                    className="px-3 py-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Buy Action */}
            <div className="pt-6 border-t border-[#1a2030] space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-[#0066ff]/25'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Add to Bag · EGP {((product.salePrice ?? product.price) * quantity).toLocaleString()}
                    </span>
                  </>
                )}
              </button>

              {/* Fabric Details Specs */}
              {product.details && product.details.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1.5 tracking-wider">
                    Fabrication & Craft:
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    {product.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Footer */}
        {related.length > 0 && (
          <div className="p-6 bg-[#06080e] border-t border-[#1a2030]">
            <h3 className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider mb-4">
              Complete The Fit // Related Pieces
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectProduct(rel);
                    setActiveImageIdx(0);
                    setSelectedSize(rel.sizes[0] || 'M');
                    setSelectedColor(rel.colors[0] || 'Black');
                    setQuantity(1);
                  }}
                  className="flex items-center gap-3 p-2 bg-[#0c0f18] border border-[#1a2030] rounded-lg hover:border-[#2f3954] cursor-pointer transition-colors"
                >
                  <img
                    src={rel.images[0]}
                    alt={rel.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{rel.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">
                      EGP {(rel.salePrice ?? rel.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
