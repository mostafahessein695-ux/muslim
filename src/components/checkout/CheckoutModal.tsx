import React, { useState } from 'react';
import { X, CheckCircle, Truck, CreditCard, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const { cart, subtotal, discount, clearCart } = useCart();
  const { settings } = useStore();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+20 ');
  const [governorate, setGovernorate] = useState('Cairo');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [buildingApartment, setBuildingApartment] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card_instapay'>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Calculate governorate shipping fee
  const calculateShippingFee = () => {
    if (subtotal >= (settings?.shippingRates?.freeShippingThreshold || 2500)) {
      return 0;
    }
    const gov = governorate.toLowerCase();
    if (gov.includes('alex')) return settings?.shippingRates?.alexandria || 75;
    if (gov.includes('upper') || gov.includes('aswan') || gov.includes('luxor') || gov.includes('asyut')) {
      return settings?.shippingRates?.upperEgypt || 110;
    }
    if (gov.includes('delta') || gov.includes('suez') || gov.includes('port said') || gov.includes('ismailia') || gov.includes('mansoura')) {
      return settings?.shippingRates?.deltaCanal || 85;
    }
    return settings?.shippingRates?.cairoGiza || 60;
  };

  const currentShippingFee = calculateShippingFee();
  const discountAmount = discount ? discount.amount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + currentShippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || !customerEmail || !customerPhone || !city || !street) {
      setErrorMessage('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.id || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          governorate,
          city,
          street,
          buildingApartment,
          notes
        },
        items: cart,
        discountCode: discount?.code,
        paymentMethod
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('kd_customer_token')
            ? { Authorization: `Bearer ${localStorage.getItem('kd_customer_token')}` }
            : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place order.');
        setIsSubmitting(false);
        return;
      }

      setCompletedOrder(data);
      clearCart();
      onOrderSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#090b11] border border-[#1d2334] rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-[#1a2030] flex items-center justify-between bg-[#0d101a]">
          <div>
            <span className="text-[11px] font-mono text-[#00f0ff] uppercase tracking-widest block">
              {completedOrder ? 'TRANSACTION COMPLETE' : 'SECURE CHECKOUT // EGYPT'}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              {completedOrder ? `Order #${completedOrder.orderNumber}` : 'Customer & Delivery Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                Your Streetwear Order is Confirmed
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Order <strong className="text-[#00f0ff] font-mono">{completedOrder.orderNumber}</strong> has been received by our Cairo atelier. We dispatched a confirmation email to <strong className="text-white">{completedOrder.customerEmail}</strong>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#0e121d] border border-[#1b2234] rounded-xl p-5 text-left max-w-md mx-auto space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-[#1b2234] pb-2 text-slate-400">
                <span>Payment Mode</span>
                <span className="text-white uppercase font-bold">
                  {completedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'InstaPay / Card'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1b2234] pb-2 text-slate-400">
                <span>Destination</span>
                <span className="text-white truncate max-w-[200px]">
                  {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.governorate}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1b2234] pb-2 text-slate-400">
                <span>Shipping Status</span>
                <span className="text-emerald-400 uppercase font-bold">{completedOrder.status}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Total Due Upon Delivery</span>
                <span className="text-[#00f0ff] font-mono-num">
                  EGP {completedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3.5 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Contact */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider border-b border-[#1a2030] pb-2">
                  1. Contact Information
                </h3>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Omar Hassan"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Email Address (for order tracking) *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Phone Number (Egypt +20) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider border-b border-[#1a2030] pb-2">
                  2. Egyptian Shipping Address
                </h3>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Governorate *
                  </label>
                  <select
                    value={governorate}
                    onChange={e => setGovernorate(e.target.value)}
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff] cursor-pointer"
                  >
                    <option value="Cairo">Cairo (Same Day / 24h Express)</option>
                    <option value="Giza">Giza & 6th of October</option>
                    <option value="Alexandria">Alexandria</option>
                    <option value="Delta/Canal">Delta & Canal (Mansoura, Tanta, Suez)</option>
                    <option value="Upper Egypt">Upper Egypt (Luxor, Aswan, Asyut)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Zamalek, Maadi, New Cairo, Dokki"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Street & Building Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="Street name, building number"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Apt / Suite / Floor (Optional)
                  </label>
                  <input
                    type="text"
                    value={buildingApartment}
                    onChange={e => setBuildingApartment(e.target.value)}
                    placeholder="Apt 4B, 3rd Floor"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-4 border-t border-[#1a2030]">
              <h3 className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider">
                3. Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#00f0ff] bg-[#121828]'
                      : 'border-[#222a3d] bg-[#0d101a] opacity-75 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                      Pay courier in cash upon package inspection at your door in Egypt.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('card_instapay')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'card_instapay'
                      ? 'border-[#00f0ff] bg-[#121828]'
                      : 'border-[#222a3d] bg-[#0d101a] opacity-75 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card_instapay'}
                    onChange={() => setPaymentMethod('card_instapay')}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">InstaPay / Bank Card</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                      Transfer directly via Egyptian InstaPay or debit/credit card.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Review Box */}
            <div className="p-4 bg-[#0d101a] border border-[#1d2334] rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-white font-mono-num">EGP {subtotal.toLocaleString()}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discount.code})</span>
                  <span className="font-mono-num">- EGP {discount.amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Shipping to {governorate}</span>
                <span className="text-white font-mono-num">
                  {currentShippingFee === 0 ? 'FREE' : `EGP ${currentShippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#1a2030]">
                <span>Total Amount Due</span>
                <span className="text-[#00f0ff] font-mono-num">
                  EGP {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#0066ff]/25 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Order Record...</span>
              ) : (
                <>
                  <span>Confirm Order · EGP {finalTotal.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
