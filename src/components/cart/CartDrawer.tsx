import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    discount,
    applyDiscount,
    removeDiscount,
    estimatedShipping,
    totalAmount
  } = useCart();

  const { settings } = useStore();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings?.shippingRates?.freeShippingThreshold || 2500;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setIsApplying(true);
    setPromoError('');
    setPromoSuccess('');

    const res = await applyDiscount(promoCodeInput.trim());
    setIsApplying(false);

    if (res.success) {
      setPromoSuccess(res.message);
      setPromoCodeInput('');
    } else {
      setPromoError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#090b11] border-l border-[#1d2334] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[#1a2030] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#00f0ff]" />
              <h2 className="font-display text-lg font-black uppercase text-white tracking-tight">
                Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#0f1320] px-6 py-3 border-b border-[#1a2030] text-xs">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <p className="text-slate-300">
                  Add <strong className="text-white font-mono-num font-bold">EGP {remainingForFreeShipping.toLocaleString()}</strong> for Free Shipping across Egypt!
                </p>
                <div className="w-full bg-[#1b2234] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00f0ff] h-full transition-all duration-300"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>You unlocked FREE Express Shipping in Egypt!</span>
              </p>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#121624] text-slate-500 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white uppercase">Your bag is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Explore our limited 480GSM heavyweight drops and add pieces to your collection.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 p-3 bg-[#0d101a] border border-[#1a2030] rounded-xl relative group"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg bg-[#141824] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate pr-6">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {item.size} · {item.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#222a3d] rounded-md bg-[#090b11]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono text-xs text-white font-bold font-mono-num">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="text-xs font-mono-num font-bold text-white">
                        EGP {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Module: Promo Code & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#1a2030] bg-[#0c0f18] space-y-4">
              {/* Discount Code Form */}
              <div>
                {discount ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{discount.code} ({discount.percentage}% OFF)</span>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-xs text-slate-400 hover:text-white underline font-mono"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. GENZ15)"
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value)}
                      className="flex-1 bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-3 py-2 bg-[#1b2234] hover:bg-[#252f48] text-white text-xs font-mono font-bold uppercase rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[11px] text-rose-400 mt-1">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-emerald-400 mt-1">{promoSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono-num text-white">EGP {subtotal.toLocaleString()}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discount.percentage}%)</span>
                    <span className="font-mono-num">- EGP {discount.amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Est. Cairo/Egypt Shipping</span>
                  <span className="font-mono-num text-white">
                    {estimatedShipping === 0 ? 'FREE' : `EGP ${estimatedShipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#1a2030]">
                  <span>Total</span>
                  <span className="font-mono-num text-[#00f0ff]">
                    EGP {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-4 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#0066ff]/25 active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
