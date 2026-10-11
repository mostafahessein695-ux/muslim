import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle2, Truck, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({ isOpen, onClose }) => {
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && token) {
      setIsLoading(true);
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#090b11] border border-[#1d2334] rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-[#1a2030] flex items-center justify-between bg-[#0d101a]">
          <div>
            <span className="text-[11px] font-mono text-[#00f0ff] uppercase tracking-widest block">
              CLIENT MEMBER PROFILE
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              {user?.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <h3 className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider border-b border-[#1a2030] pb-2">
            Order Archive & Tracking ({orders.length})
          </h3>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">
              Querying Cairo database records...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-[#0c0f18] rounded-xl border border-[#181d2a] space-y-2 p-6">
              <Package className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-white font-bold">No orders placed yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Once you place an order, your tracking status and items will be archived here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="p-4 bg-[#0d101a] border border-[#1b2132] rounded-xl space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#181d2a] pb-2.5">
                    <div>
                      <span className="text-xs font-bold font-mono text-white">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#162033] text-[#00f0ff] border border-[#00f0ff]/20">
                        {order.status}
                      </span>
                      <span className="text-xs font-bold text-white font-mono-num">
                        EGP {order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-slate-500">{item.quantity}x</span>
                          <span className="truncate">{item.productName} ({item.size} / {item.color})</span>
                        </div>
                        <span className="font-mono-num text-white shrink-0">
                          EGP {item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#181d2a] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      Deliver to: {order.shippingAddress.city}, {order.shippingAddress.governorate}
                    </span>
                    <span className="uppercase text-slate-300">
                      Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'InstaPay / Card'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
