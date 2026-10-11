import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Layers,
  ShoppingBag,
  TrendingUp,
  Package,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  AlertTriangle,
  Mail,
  Sliders,
  DollarSign,
  KeyRound,
  LogOut,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Product, Order, DiscountCode, StoreSettings, NotificationLog } from '../../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
    adminUser,
    adminToken,
    isAdminAuthenticated,
    mustChangeAdminPassword,
    adminLogin,
    adminChangePassword,
    adminLogout
  } = useAuth();

  const { settings, refreshSettings, refreshProducts } = useStore();

  // Navigation tab in admin
  const [adminTab, setAdminTab] = useState<'overview' | 'products' | 'orders' | 'discounts' | 'settings' | 'notifications'>('overview');

  // Login form state
  const [usernameInput, setUsernameInput] = useState('Mustafa');
  const [passwordInput, setPasswordInput] = useState('12345');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('12345');
  const [newPass, setNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Admin Data states
  const [stats, setStats] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allDiscounts, setAllDiscounts] = useState<DiscountCode[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Product Edit / Creation Form Modal State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Discount Form State
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountPct, setNewDiscountPct] = useState(15);
  const [newDiscountMin, setNewDiscountMin] = useState(1000);

  // Store Settings Form State
  const [editableSettings, setEditableSettings] = useState<StoreSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    setEditableSettings(settings);
  }, [settings]);

  // Fetch admin data on auth
  const fetchAdminData = async () => {
    if (!adminToken) return;
    setIsLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [statsRes, prodsRes, ordsRes, discRes, notifsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/products?includeDrafts=true', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/discounts', { headers }),
        fetch('/api/admin/notifications', { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (prodsRes.ok) setAllProducts(await prodsRes.json());
      if (ordsRes.ok) setAllOrders(await ordsRes.json());
      if (discRes.ok) setAllDiscounts(await discRes.json());
      if (notifsRes.ok) setAllNotifications(await notifsRes.json());
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && isOpen) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated, isOpen, adminToken]);

  if (!isOpen) return null;

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const res = await adminLogin(usernameInput, passwordInput);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Admin authentication failed.');
    }
  };

  // Handle Required Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    if (!newPass || newPass.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    setIsChangingPass(true);
    const res = await adminChangePassword(currentPass, newPass);
    setIsChangingPass(false);
    if (res.success) {
      setPassSuccess('Administrator password securely updated! Temporary flag removed.');
      setCurrentPass('');
      setNewPass('');
    } else {
      setPassError(res.error || 'Failed to update password.');
    }
  };

  // Handle Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;

    setIsSavingProduct(true);
    const isNew = !editingProduct.id;
    const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        setEditingProduct(null);
        await Promise.all([fetchAdminData(), refreshProducts()]);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save product.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        await Promise.all([fetchAdminData(), refreshProducts()]);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Add Discount Code
  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscountCode) return;
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          code: newDiscountCode,
          percentage: newDiscountPct,
          minSpend: newDiscountMin
        })
      });
      if (res.ok) {
        setNewDiscountCode('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editableSettings)
      });
      if (res.ok) {
        setSettingsSuccess(true);
        await refreshSettings();
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-6xl bg-[#090b11] border border-[#1d2334] rounded-2xl overflow-hidden shadow-2xl my-4 min-h-[85vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-[#1a2030] bg-[#0c0f18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066ff]/20 border border-[#0066ff]/40 flex items-center justify-center text-[#00f0ff]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-display text-lg sm:text-xl font-black uppercase tracking-tight">
                  KAIRØ DISTRICT // CONTROL TOWER
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#141d30] text-[#00f0ff] border border-[#00f0ff]/30 px-2 py-0.5 rounded">
                  /ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-time Egyptian E-commerce Management & Automated Notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdminAuthenticated && (
              <button
                onClick={adminLogout}
                className="px-3 py-1.5 bg-[#181d2a] hover:bg-rose-950/40 text-rose-400 border border-[#232b3e] rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Secure Admin Login Gate */}
        {!isAdminAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#0c0f18] border border-[#1b2234] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#0066ff]/20 text-[#00f0ff] mx-auto flex items-center justify-center border border-[#0066ff]/40">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  Restricted Administrator Access
                </h3>
                <p className="text-xs text-slate-400">
                  Protected with salted password hashing, rate limiting, and RBAC sessions.
                </p>
              </div>

              {/* Dev Credentials Helper Tip */}
              <div className="p-3 bg-[#111726] border border-[#1e2a44] rounded-xl text-xs space-y-1">
                <div className="text-[#00f0ff] font-bold flex items-center gap-1.5 font-mono">
                  <span>Initial Dev Credentials:</span>
                </div>
                <p className="text-slate-300 font-mono">
                  Username: <strong className="text-white">Mustafa</strong>
                </p>
                <p className="text-slate-300 font-mono">
                  Temporary Password: <strong className="text-white">12345</strong>
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Admin Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    placeholder="Mustafa"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isLoggingIn ? 'Verifying Salted Hash...' : 'Authorize Admin Session'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-[#080a10] border-b md:border-b-0 md:border-r border-[#1a2030] p-4 space-y-1">
              <button
                onClick={() => setAdminTab('overview')}
                className={`w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2.5 transition-colors ${
                  adminTab === 'overview'
                    ? 'bg-[#0066ff] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setAdminTab('products')}
                className={`w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2.5 transition-colors ${
                  adminTab === 'products'
                    ? 'bg-[#0066ff] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products & Stock</span>
              </button>

              <button
                onClick={() => setAdminTab('orders')}
                className={`w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2.5 transition-colors ${
                  adminTab === 'orders'
                    ? 'bg-[#0066ff] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders ({allOrders.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('discounts')}
                className={`w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2.5 transition-colors ${
                  adminTab === 'discounts'
                    ? 'bg-[#0066ff] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Discount Codes</span>
              </button>

              <button
                onClick={() => setAdminTab('settings')}
                className={`w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2.5 transition-colors ${
                  adminTab === 'settings'
                    ? 'bg-[#0066ff] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Store & Content</span>
              </button>

              <button
                onClick={() => setAdminTab('notifications')}
                className={`w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2.5 transition-colors ${
                  adminTab === 'notifications'
                    ? 'bg-[#0066ff] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Delivery Logs</span>
              </button>

              {/* Security Warning If Temporary Password is Still Active */}
              {mustChangeAdminPassword && (
                <div className="pt-4 border-t border-[#1a2030] mt-4">
                  <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Security Notice</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-tight">
                      You are using temporary password "12345". Update to a permanent password below.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[75vh]">
              {/* Mandatory Password Change Banner / Modal */}
              {mustChangeAdminPassword && (
                <div className="mb-6 p-5 bg-[#141208] border border-amber-600/50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <KeyRound className="w-4 h-4" />
                      <span>Mandatory Security Action: Update Temporary Password</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-300">ADMIN USER: MUSTAFA</span>
                  </div>

                  {passError && <p className="text-xs text-rose-400">{passError}</p>}
                  {passSuccess && <p className="text-xs text-emerald-400">{passSuccess}</p>}

                  <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="password"
                      placeholder="Current: 12345"
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      className="bg-[#1b1e2c] border border-[#2a324a] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="New Secure Password"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="bg-[#1b1e2c] border border-[#2a324a] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                    >
                      {isChangingPass ? 'Updating...' : 'Set Permanent Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {adminTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Metric Strips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        Gross Revenue
                      </span>
                      <p className="text-2xl font-black text-white font-mono-num">
                        EGP {(stats?.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        Total Orders
                      </span>
                      <p className="text-2xl font-black text-[#00f0ff] font-mono-num">
                        {stats?.ordersCount || 0}
                      </p>
                    </div>

                    <div className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        Inventory Units In Stock
                      </span>
                      <p className="text-2xl font-black text-white font-mono-num">
                        {stats?.totalInventory || 0}
                      </p>
                    </div>

                    <div className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        Low Stock Alerts
                      </span>
                      <p className="text-2xl font-black text-amber-400 font-mono-num">
                        {stats?.lowStockCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Recent Orders Overview */}
                  <div className="p-5 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Latest Storefront Orders
                      </h3>
                      <button
                        onClick={() => setAdminTab('orders')}
                        className="text-xs text-[#00f0ff] hover:underline font-mono"
                      >
                        View All Orders →
                      </button>
                    </div>

                    {allOrders.length === 0 ? (
                      <p className="text-xs text-slate-400">No orders placed yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {allOrders.slice(0, 4).map(o => (
                          <div
                            key={o.id}
                            className="p-3 bg-[#080b12] rounded-lg border border-[#181f2f] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-white font-mono">#{o.orderNumber}</span>
                              <span className="text-slate-400 ml-2">
                                {o.customerName} ({o.shippingAddress.governorate})
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-emerald-400 font-bold">
                                EGP {o.totalAmount.toLocaleString()}
                              </span>
                              <span className="font-mono text-[10px] bg-[#121929] text-[#00f0ff] px-2 py-0.5 rounded">
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS & STOCK */}
              {adminTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">
                        Product Catalog & Inventory ({allProducts.length})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Manage pricing in EGP, sizes XS-XXL, color variants, and publication status.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setEditingProduct({
                          name: '',
                          description: '',
                          price: 1500,
                          salePrice: null,
                          category: 'Hoodies & Sweatshirts',
                          collection: 'District Cyber 20',
                          sizes: ['S', 'M', 'L', 'XL'],
                          colors: ['Washed Charcoal'],
                          variants: [
                            { size: 'M', color: 'Washed Charcoal', stock: 20 },
                            { size: 'L', color: 'Washed Charcoal', stock: 15 }
                          ],
                          images: ['/src/assets/images/product_hoodie_heavyweight_1791725317370.jpg'],
                          status: 'Published',
                          isFeatured: true,
                          isNewArrival: true,
                          details: ['100% Egyptian Combed Cotton', 'Crafted in Cairo']
                        })
                      }
                      className="px-4 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto border border-[#1b2234] rounded-xl bg-[#0d101a]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#121624] text-slate-400 font-mono uppercase border-b border-[#1b2234]">
                        <tr>
                          <th className="p-3">Item</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price (EGP)</th>
                          <th className="p-3">Sizes</th>
                          <th className="p-3">Total Stock</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#181f2f] text-slate-300">
                        {allProducts.map(prod => (
                          <tr key={prod.id} className="hover:bg-[#121624]/60">
                            <td className="p-3 flex items-center gap-3">
                              <img
                                src={prod.images[0]}
                                alt=""
                                className="w-10 h-10 object-cover rounded bg-[#181f2f]"
                              />
                              <div>
                                <span className="font-bold text-white block truncate max-w-xs">
                                  {prod.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {prod.collection}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 font-mono">{prod.category}</td>
                            <td className="p-3 font-mono-num font-bold text-white">
                              EGP {prod.price.toLocaleString()}
                              {prod.salePrice && (
                                <span className="block text-[10px] text-emerald-400">
                                  Sale: EGP {prod.salePrice.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-[11px]">{prod.sizes.join(', ')}</td>
                            <td className="p-3 font-mono-num font-bold">
                              <span
                                className={prod.totalStock <= 10 ? 'text-amber-400' : 'text-emerald-400'}
                              >
                                {prod.totalStock} units
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  prod.status === 'Published'
                                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {prod.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="p-1 text-slate-400 hover:text-[#00f0ff] transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Product Edit / Create Modal Form */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <div className="bg-[#090b11] border border-[#222b3e] rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
                    <div className="flex justify-between items-center border-b border-[#1b2234] pb-3">
                      <h3 className="text-base font-bold text-white uppercase">
                        {editingProduct.id ? 'Edit Streetwear Product' : 'Add New Streetwear Product'}
                      </h3>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1 font-mono">Product Title *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Price (EGP) *</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.price || 0}
                            onChange={e =>
                              setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Sale Price (EGP, Optional)</label>
                          <input
                            type="number"
                            value={editingProduct.salePrice || ''}
                            onChange={e =>
                              setEditingProduct({
                                ...editingProduct,
                                salePrice: e.target.value ? Number(e.target.value) : null
                              })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Category</label>
                          <select
                            value={editingProduct.category || 'Hoodies & Sweatshirts'}
                            onChange={e =>
                              setEditingProduct({ ...editingProduct, category: e.target.value })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          >
                            <option value="Hoodies & Sweatshirts">Hoodies & Sweatshirts</option>
                            <option value="T-Shirts & Tops">T-Shirts & Tops</option>
                            <option value="Pants & Cargos">Pants & Cargos</option>
                            <option value="Accessories & Bags">Accessories & Bags</option>
                            <option value="Headwear">Headwear</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Status</label>
                          <select
                            value={editingProduct.status || 'Published'}
                            onChange={e =>
                              setEditingProduct({ ...editingProduct, status: e.target.value as any })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          >
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-mono">Image URL / Path</label>
                        <input
                          type="text"
                          value={editingProduct.images?.[0] || ''}
                          onChange={e =>
                            setEditingProduct({ ...editingProduct, images: [e.target.value] })
                          }
                          className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-mono">Description</label>
                        <textarea
                          rows={3}
                          value={editingProduct.description || ''}
                          onChange={e =>
                            setEditingProduct({ ...editingProduct, description: e.target.value })
                          }
                          className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-[#1b2234]">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProduct}
                          className="px-5 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg"
                        >
                          {isSavingProduct ? 'Saving...' : 'Save Product'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS */}
              {adminTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-white uppercase">
                    Customer Orders Management ({allOrders.length})
                  </h3>

                  {allOrders.length === 0 ? (
                    <p className="text-xs text-slate-400">No orders received yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.map(order => (
                        <div
                          key={order.id}
                          className="p-5 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#181f2f] pb-3">
                            <div>
                              <span className="text-sm font-bold text-white font-mono">
                                #{order.orderNumber}
                              </span>
                              <span className="text-xs text-slate-400 ml-2">
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-bold text-white">
                                Total: EGP {order.totalAmount.toLocaleString()}
                              </span>
                              {/* Status Selector */}
                              <select
                                value={order.status}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="bg-[#141b2c] border border-[#232f48] text-xs font-mono text-[#00f0ff] rounded-lg px-3 py-1 cursor-pointer focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer & Address Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                            <div>
                              <p className="text-slate-500 uppercase text-[10px]">Customer Contact</p>
                              <p className="text-white font-bold">{order.customerName}</p>
                              <p>{order.customerEmail}</p>
                              <p>{order.customerPhone}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 uppercase text-[10px]">Shipping Destination</p>
                              <p className="text-white">{order.shippingAddress.street}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.governorate}</p>
                              <p className="text-[#00f0ff] uppercase mt-1">
                                Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'InstaPay / Card'}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="pt-2 border-t border-[#181f2f] space-y-1 text-xs">
                            <p className="text-slate-500 font-mono uppercase text-[10px]">Items Ordered</p>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-slate-300">
                                <span>
                                  {it.quantity}x {it.productName} ({it.size} · {it.color})
                                </span>
                                <span className="font-mono text-white">
                                  EGP {it.totalPrice.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DISCOUNTS */}
              {adminTab === 'discounts' && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-white uppercase">
                    Promotional Discount Codes
                  </h3>

                  {/* Add discount code form */}
                  <form onSubmit={handleAddDiscount} className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl flex flex-wrap gap-3 items-end text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-mono">Code</label>
                      <input
                        type="text"
                        placeholder="e.g. VIP25"
                        required
                        value={newDiscountCode}
                        onChange={e => setNewDiscountCode(e.target.value.toUpperCase())}
                        className="bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-mono">Percentage (%)</label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        required
                        value={newDiscountPct}
                        onChange={e => setNewDiscountPct(Number(e.target.value))}
                        className="bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white w-24"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-mono">Min Spend (EGP)</label>
                      <input
                        type="number"
                        value={newDiscountMin}
                        onChange={e => setNewDiscountMin(Number(e.target.value))}
                        className="bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white w-32"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg uppercase"
                    >
                      Add Code
                    </button>
                  </form>

                  {/* Discounts list */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {allDiscounts.map(d => (
                      <div
                        key={d.id}
                        className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-1 font-mono text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold text-sm text-[#00f0ff]">{d.code}</span>
                          <span className="text-emerald-400 font-bold">{d.percentage}% OFF</span>
                        </div>
                        <p className="text-slate-400">Min spend: EGP {d.minSpend.toLocaleString()}</p>
                        <p className="text-slate-500 text-[11px]">Used: {d.usedCount} times</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: STORE SETTINGS & HOMEPAGE CONTENT */}
              {adminTab === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">
                        Homepage Content & Store Configuration
                      </h3>
                      <p className="text-xs text-slate-400">
                        Update brand name, headlines, shipping fees, and contact info without touching source code.
                      </p>
                    </div>
                  </div>

                  {settingsSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-emerald-400 text-xs">
                      Store settings updated and synchronized across all visitors!
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 block mb-1 font-mono">Brand Name</label>
                        <input
                          type="text"
                          value={editableSettings.brandName}
                          onChange={e =>
                            setEditableSettings({ ...editableSettings, brandName: e.target.value })
                          }
                          className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-mono">Logo Wordmark</label>
                        <input
                          type="text"
                          value={editableSettings.logoText}
                          onChange={e =>
                            setEditableSettings({ ...editableSettings, logoText: e.target.value })
                          }
                          className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono">Announcement Bar Text</label>
                      <input
                        type="text"
                        value={editableSettings.announcementBar}
                        onChange={e =>
                          setEditableSettings({ ...editableSettings, announcementBar: e.target.value })
                        }
                        className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono">Hero Campaign Headline</label>
                      <input
                        type="text"
                        value={editableSettings.heroHeadline}
                        onChange={e =>
                          setEditableSettings({ ...editableSettings, heroHeadline: e.target.value })
                        }
                        className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono">Hero Subheadline</label>
                      <textarea
                        rows={2}
                        value={editableSettings.heroSubheadline}
                        onChange={e =>
                          setEditableSettings({ ...editableSettings, heroSubheadline: e.target.value })
                        }
                        className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    {/* Shipping Rates */}
                    <div className="pt-2 border-t border-[#1b2234]">
                      <h4 className="text-white font-bold uppercase mb-2">Egyptian Shipping Fees (EGP)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Cairo & Giza</label>
                          <input
                            type="number"
                            value={editableSettings.shippingRates.cairoGiza}
                            onChange={e =>
                              setEditableSettings({
                                ...editableSettings,
                                shippingRates: {
                                  ...editableSettings.shippingRates,
                                  cairoGiza: Number(e.target.value)
                                }
                              })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Alexandria</label>
                          <input
                            type="number"
                            value={editableSettings.shippingRates.alexandria}
                            onChange={e =>
                              setEditableSettings({
                                ...editableSettings,
                                shippingRates: {
                                  ...editableSettings.shippingRates,
                                  alexandria: Number(e.target.value)
                                }
                              })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Delta / Canal</label>
                          <input
                            type="number"
                            value={editableSettings.shippingRates.deltaCanal}
                            onChange={e =>
                              setEditableSettings({
                                ...editableSettings,
                                shippingRates: {
                                  ...editableSettings.shippingRates,
                                  deltaCanal: Number(e.target.value)
                                }
                              })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-mono">Free Ship Over</label>
                          <input
                            type="number"
                            value={editableSettings.shippingRates.freeShippingThreshold}
                            onChange={e =>
                              setEditableSettings({
                                ...editableSettings,
                                shippingRates: {
                                  ...editableSettings.shippingRates,
                                  freeShippingThreshold: Number(e.target.value)
                                }
                              })
                            }
                            className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg uppercase tracking-wider"
                    >
                      {isSavingSettings ? 'Saving...' : 'Save & Publish Changes'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: NOTIFICATIONS & DELIVERY LOGS */}
              {adminTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">
                        Automated Welcome & Order Delivery Log
                      </h3>
                      <p className="text-xs text-slate-400">
                        Live server audit trail of every email and WhatsApp message dispatched.
                      </p>
                    </div>
                    <button
                      onClick={fetchAdminData}
                      className="p-2 text-slate-400 hover:text-white rounded-lg border border-[#232b3e]"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {allNotifications.length === 0 ? (
                    <p className="text-xs text-slate-400">No notifications dispatched yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {allNotifications.map(notif => (
                        <div
                          key={notif.id}
                          className="p-4 bg-[#0d101a] border border-[#1b2234] rounded-xl space-y-2 text-xs font-mono"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                                notif.channel === 'email' ? 'bg-blue-950/60 text-[#00f0ff]' : 'bg-emerald-950/60 text-emerald-400'
                              }`}>
                                {notif.channel}
                              </span>
                              <span className="text-white font-bold">{notif.recipient}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                notif.status.includes('delivered')
                                  ? 'bg-emerald-950/40 text-emerald-400'
                                  : notif.status === 'pending_setup'
                                  ? 'bg-amber-950/40 text-amber-400'
                                  : 'bg-rose-950/40 text-rose-400'
                              }`}>
                                {notif.status}
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                {new Date(notif.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          {notif.subject && (
                            <p className="text-slate-300 font-bold">{notif.subject}</p>
                          )}
                          <p className="text-slate-400 line-clamp-2 bg-[#090b11] p-2 rounded border border-[#161d2b]">
                            {notif.content}
                          </p>
                          {notif.providerNote && (
                            <p className="text-[11px] text-slate-500 italic">
                              Provider Note: {notif.providerNote}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
