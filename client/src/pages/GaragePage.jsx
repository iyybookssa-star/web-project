import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { getCookie } from '../utils/cookieUtils';
import { useAuth } from '../context/AuthContext';
import { generateReceipt } from '../utils/generateReceipt';

export default function GaragePage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [pastPurchases, setPastPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    // Fetch real orders from DB
                    const { data } = await api.get('/orders/myorders');
                    setOrders(data);
                } else {
                    // Fallback to cookie for guests
                    const pastIds = getCookie('past_purchases');
                    if (pastIds) {
                        const { data } = await api.get(`/products?ids=${pastIds}`);
                        setPastPurchases(data.products || []);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <div className="min-h-screen bg-background-dark pb-20">
            {/* ── Header ── */}
            <div className="bg-surface-dark border-b border-border-dark py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                            <span className="material-symbols-outlined text-4xl text-primary">garage_home</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-wide">My Garage</h1>
                            <p className="text-slate-400 mt-1">Manage your vehicles and past purchases</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

                {/* ── Your Vehicle (Placeholder) ── */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">directions_car</span>
                        Your Vehicle
                    </h2>
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
                        <div className="w-32 h-32 bg-black/40 rounded-full flex items-center justify-center border-2 border-dashed border-slate-700">
                            <span className="material-symbols-outlined text-4xl text-slate-600">add_a_photo</span>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div>
                                <h3 className="text-2xl font-bold text-white">No vehicle added</h3>
                                <p className="text-slate-400">Add your car to find parts that fit perfectly.</p>
                            </div>
                            <button className="bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-Flex items-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                Add Vehicle
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Order History (Logged In) ── */}
                {user ? (
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">receipt_long</span>
                            Order History
                        </h2>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-surface-dark rounded-2xl h-40 animate-pulse border border-border-dark" />
                                ))}
                            </div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                                        <div className="bg-black/20 p-4 flex flex-wrap gap-4 justify-between items-center border-b border-border-dark">
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Order Placed</p>
                                                <p className="text-sm text-white font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total</p>
                                                <p className="text-sm text-white font-medium">${order.totalPrice.toFixed(2)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Order #</p>
                                                <p className="text-sm text-slate-300 font-mono">{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Status</p>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => generateReceipt(order, user)}
                                                className="text-primary hover:text-white text-sm font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">download</span> Invoice
                                            </button>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 items-center">
                                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-background-dark rounded-lg p-1 border border-border-dark" />
                                                    <div className="flex-1">
                                                        <Link to={`/products/${item.product}`} className="text-white font-bold hover:text-primary transition-colors line-clamp-1">
                                                            {item.name}
                                                        </Link>
                                                        <p className="text-sm text-slate-400">Qty: {item.qty} × ${item.price}</p>
                                                    </div>
                                                    <Link to={`/products/${item.product}`} className="bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">
                                                        Buy Again
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-surface-dark border border-border-dark rounded-2xl">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-3 block">receipt_long</span>
                                <h3 className="text-lg font-bold text-white mb-1">No orders yet</h3>
                                <p className="text-slate-400 text-sm mb-6">Once you place an order, it will appear here.</p>
                                <Link to="/products" className="text-primary font-bold hover:underline">Start Shopping</Link>
                            </div>
                        )}
                    </section>
                ) : (
                    /* ── Guest History (Cookies) ── */
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Recently Viewed / Purchased
                        </h2>
                        {pastPurchases.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {pastPurchases.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-surface-dark border border-border-dark rounded-2xl">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-3 block">history</span>
                                <h3 className="text-lg font-bold text-white mb-1">No history found</h3>
                                <p className="text-slate-400 text-sm mb-6">Log in to see your full order history.</p>
                                <Link to="/login" className="bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">
                                    Log In
                                </Link>
                            </div>
                        )}
                    </section>
                )}

            </div>
        </div>
    );
}
