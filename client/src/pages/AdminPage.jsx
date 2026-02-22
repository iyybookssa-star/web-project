import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ── Shared helpers ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    Pending: 'bg-yellow-500/20 text-yellow-400',
    Processing: 'bg-blue-500/20 text-blue-400',
    Shipped: 'bg-purple-500/20 text-purple-400',
    Delivered: 'bg-green-500/20 text-green-400',
    Cancelled: 'bg-red-500/20 text-red-400',
};
const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const CATEGORIES = ['Engines', 'Brakes', 'Lighting', 'Suspension', 'Filters', 'Exhaust', 'Transmission', 'Electrical', 'Body', 'Accessories'];

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function Th({ children }) {
    return <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3">{children}</th>;
}
function Td({ children, className = '' }) {
    return <td className={`px-4 py-3 text-sm text-slate-300 ${className}`}>{children}</td>;
}

// ── PRODUCT FORM ──────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
    name: '', partNumber: '', category: 'Brakes', price: '', originalPrice: '',
    description: '', image: '', stock: '', rating: 4.5, isFeatured: false, badge: '',
};

function ProductForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState(initial || EMPTY_PRODUCT);
    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-background-dark border border-border-dark rounded-2xl p-6 space-y-4 mt-4">
            <h3 className="font-bold text-white text-lg">{initial ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
                {[
                    ['Product Name', 'name', 'text', true],
                    ['Part Number', 'partNumber', 'text', true],
                    ['Price ($)', 'price', 'number', true],
                    ['Original Price ($)', 'originalPrice', 'number', false],
                    ['Stock', 'stock', 'number', true],
                    ['Rating (0-5)', 'rating', 'number', false],
                ].map(([label, key, type, req]) => (
                    <div key={key}>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                        <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} required={req} step={type === 'number' ? '0.01' : undefined}
                            className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary" />
                    </div>
                ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)}
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Badge</label>
                    <select value={form.badge || ''} onChange={e => set('badge', e.target.value || null)}
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                        <option value="">None</option>
                        <option value="HOT DEAL">HOT DEAL</option>
                        <option value="IN STOCK">IN STOCK</option>
                        <option value="NEW">NEW</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Image URL</label>
                <input value={form.image} onChange={e => set('image', e.target.value)} required placeholder="https://..." className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary" />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={3}
                    className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary resize-none" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-slate-300">Featured product</span>
            </label>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 border border-border-dark text-slate-400 hover:text-white py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors">
                    {initial ? 'Save Changes' : 'Add Product'}
                </button>
            </div>
        </form>
    );
}

// ════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');

    // Redirect non-admins
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/'); toast.error('Admin access only'); }
    }, [user]);

    // ── Dashboard ─────────────────────────────────────────────────────────────
    const [stats, setStats] = useState(null);
    const fetchStats = useCallback(async () => {
        try { const { data } = await api.get('/admin/stats'); setStats(data); } catch { }
    }, []);
    useEffect(() => { if (tab === 'dashboard') fetchStats(); }, [tab]);

    // ── Products ──────────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [productForm, setProductForm] = useState(null); // null | 'new' | product obj
    const fetchProducts = useCallback(async () => {
        try { const { data } = await api.get('/admin/products'); setProducts(data); } catch { }
    }, []);
    useEffect(() => { if (tab === 'products') fetchProducts(); }, [tab]);

    const handleSaveProduct = async (form) => {
        try {
            // Ensure empty badge sends null so Mongoose clears it
            const payload = { ...form, badge: form.badge || null };
            if (productForm === 'new') {
                await api.post('/admin/products', payload);
                toast.success('Product added!');
            } else {
                await api.put(`/admin/products/${productForm._id}`, payload);
                toast.success('Product updated!');
            }
            setProductForm(null);
            fetchProducts();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    // ── Orders ────────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState([]);
    const fetchOrders = useCallback(async () => {
        try { const { data } = await api.get('/admin/orders'); setOrders(data); } catch { }
    }, []);
    useEffect(() => { if (tab === 'orders') fetchOrders(); }, [tab]);

    const handleStatusChange = async (orderId, status) => {
        try {
            const { data } = await api.put(`/admin/orders/${orderId}/status`, { status });
            setOrders(o => o.map(x => x._id === orderId ? data : x));
            toast.success('Status updated');
            // Refresh dashboard stats so revenue updates immediately
            fetchStats();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    // ── Users ─────────────────────────────────────────────────────────────────
    const [users, setUsers] = useState([]);
    const fetchUsers = useCallback(async () => {
        try { const { data } = await api.get('/admin/users'); setUsers(data); } catch { }
    }, []);
    useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab]);

    const handleToggleAdmin = async (id) => {
        try {
            const { data } = await api.put(`/admin/users/${id}/toggle-admin`);
            setUsers(u => u.map(x => x._id === id ? data : x));
            toast.success('Admin status updated');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    // ── Tabs ──────────────────────────────────────────────────────────────────
    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'products', label: 'Products', icon: 'inventory_2' },
        { id: 'orders', label: 'Orders', icon: 'receipt_long' },
        { id: 'users', label: 'Users', icon: 'group' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Page header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Admin Panel</h1>
                    <p className="text-slate-400 text-sm">Manage your store</p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-surface-dark border border-border-dark rounded-2xl p-1.5 mb-8 w-fit flex-wrap">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => { setTab(t.id); setProductForm(null); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── DASHBOARD ── */}
            {tab === 'dashboard' && (
                <div className="space-y-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative group">
                            <StatCard icon="attach_money" label="Total Revenue" value={`$${(stats?.revenue || 0).toFixed(2)}`} color="bg-green-500/20 text-green-400" />
                            <button
                                onClick={async () => {
                                    if (!window.confirm('Reset revenue to $0? This will mark all delivered orders as Pending.')) return;
                                    try { await api.post('/admin/reset-revenue'); fetchStats(); toast.success('Revenue reset'); }
                                    catch (e) { toast.error('Error'); }
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-background-dark/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all text-xs"
                                title="Reset Revenue Stats"
                            >
                                <span className="material-symbols-outlined text-sm">restart_alt</span>
                            </button>
                        </div>
                        <StatCard icon="receipt_long" label="Total Orders" value={stats?.orderCount ?? '…'} color="bg-blue-500/20 text-blue-400" />
                        <StatCard icon="inventory_2" label="Products" value={stats?.productCount ?? '…'} color="bg-purple-500/20 text-purple-400" />
                        <StatCard icon="group" label="Users" value={stats?.userCount ?? '…'} color="bg-amber-500/20 text-amber-400" />
                    </div>

                    <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-border-dark flex justify-between items-center">
                            <h2 className="font-bold text-white">Recent Orders</h2>
                            <button onClick={fetchStats} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-border-dark hover:border-primary px-3 py-1.5 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-base">refresh</span> Refresh
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-background-dark"><tr>
                                    <Th>Order ID</Th><Th>Customer</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th>
                                </tr></thead>
                                <tbody className="divide-y divide-border-dark">
                                    {(stats?.recentOrders || []).map(o => (
                                        <tr key={o._id} className="hover:bg-background-dark/50 transition-colors">
                                            <Td><span className="font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</span></Td>
                                            <Td>{o.user?.name || 'Guest'}</Td>
                                            <Td><span className="font-bold text-primary">${o.totalPrice?.toFixed(2)}</span></Td>
                                            <Td><span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status]}`}>{o.status}</span></Td>
                                            <Td>{new Date(o.createdAt).toLocaleDateString()}</Td>
                                        </tr>
                                    ))}
                                    {!stats?.recentOrders?.length && <tr><td colSpan={5} className="text-center py-8 text-slate-500">No orders yet</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PRODUCTS ── */}
            {tab === 'products' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-slate-400 text-sm">{products.length} products total</p>
                        {!productForm && (
                            <button onClick={() => setProductForm('new')}
                                className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-[18px]">add</span> Add Product
                            </button>
                        )}
                    </div>

                    {productForm && (
                        <ProductForm
                            initial={productForm === 'new' ? null : productForm}
                            onSave={handleSaveProduct}
                            onCancel={() => setProductForm(null)}
                        />
                    )}

                    <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-background-dark"><tr>
                                    <Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Featured</Th><Th>Actions</Th>
                                </tr></thead>
                                <tbody className="divide-y divide-border-dark">
                                    {products.map(p => (
                                        <tr key={p._id} className="hover:bg-background-dark/50 transition-colors">
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} alt={p.name} className="w-10 h-10 object-contain bg-background-dark rounded-lg p-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-white text-sm line-clamp-1 max-w-[200px]">{p.name}</p>
                                                        <p className="text-xs text-slate-500">#{p.partNumber}</p>
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td><span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{p.category}</span></Td>
                                            <Td><span className="font-bold text-white">${p.price}</span>{p.originalPrice && <span className="text-slate-500 line-through ml-2 text-xs">${p.originalPrice}</span>}</Td>
                                            <Td><span className={p.stock > 0 ? 'text-green-400' : 'text-red-400'}>{p.stock}</span></Td>
                                            <Td>{p.isFeatured ? <span className="material-symbols-outlined text-primary text-base">star</span> : <span className="material-symbols-outlined text-slate-600 text-base">star</span>}</Td>
                                            <Td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setProductForm(p)} className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/30 text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-colors">
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                    {!products.length && <tr><td colSpan={6} className="text-center py-8 text-slate-500">No products found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ORDERS ── */}
            {tab === 'orders' && (
                <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-border-dark">
                        <h2 className="font-bold text-white">{orders.length} Orders</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background-dark"><tr>
                                <Th>Order ID</Th><Th>Customer</Th><Th>Items</Th><Th>Total</Th><Th>Payment</Th><Th>Status</Th><Th>Date</Th>
                            </tr></thead>
                            <tbody className="divide-y divide-border-dark">
                                {orders.map(o => (
                                    <tr key={o._id} className="hover:bg-background-dark/50 transition-colors">
                                        <Td><span className="font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</span></Td>
                                        <Td>
                                            <p className="font-semibold text-white text-sm">{o.user?.name || 'Guest'}</p>
                                            <p className="text-xs text-slate-500">{o.user?.email}</p>
                                        </Td>
                                        <Td>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</Td>
                                        <Td><span className="font-bold text-primary">${o.totalPrice?.toFixed(2)}</span></Td>
                                        <Td><span className="text-xs">{o.paymentMethod}</span></Td>
                                        <Td>
                                            <select
                                                value={o.status}
                                                onChange={e => handleStatusChange(o._id, e.target.value)}
                                                className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${STATUS_COLORS[o.status]} bg-transparent`}
                                            >
                                                {STATUSES.map(s => <option key={s} value={s} className="bg-surface-dark text-white">{s}</option>)}
                                            </select>
                                        </Td>
                                        <Td>{new Date(o.createdAt).toLocaleDateString()}</Td>
                                    </tr>
                                ))}
                                {!orders.length && <tr><td colSpan={7} className="text-center py-8 text-slate-500">No orders yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── USERS ── */}
            {tab === 'users' && (
                <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-border-dark">
                        <h2 className="font-bold text-white">{users.length} Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background-dark"><tr>
                                <Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th>Actions</Th>
                            </tr></thead>
                            <tbody className="divide-y divide-border-dark">
                                {users.map(u => (
                                    <tr key={u._id} className="hover:bg-background-dark/50 transition-colors">
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-white">{u.name}</span>
                                            </div>
                                        </Td>
                                        <Td>{u.email}</Td>
                                        <Td>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.isAdmin ? 'bg-primary/20 text-primary' : 'bg-slate-500/20 text-slate-400'}`}>
                                                {u.isAdmin ? '⚡ Admin' : 'User'}
                                            </span>
                                        </Td>
                                        <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                                        <Td>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleAdmin(u._id)}
                                                    disabled={u._id === user?._id}
                                                    title={u.isAdmin ? 'Remove admin' : 'Make admin'}
                                                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${u.isAdmin ? 'bg-primary/20 hover:bg-primary/40 text-primary' : 'bg-slate-500/20 hover:bg-slate-500/40 text-slate-400'}`}
                                                >
                                                    <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    disabled={u._id === user?._id}
                                                    title="Delete user"
                                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </Td>
                                    </tr>
                                ))}
                                {!users.length && <tr><td colSpan={5} className="text-center py-8 text-slate-500">No users found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
