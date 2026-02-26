import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateReceipt } from '../utils/generateReceipt';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getCookie, setCookie } from '../utils/cookieUtils';

// ── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ step }) {
    const steps = ['Delivery Details', 'Confirm Location', 'Review & Pay'];
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {steps.map((label, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                    <div key={label} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${done ? 'bg-green-500 border-green-500 text-white'
                                : active ? 'bg-primary border-primary text-white'
                                    : 'border-border-dark text-slate-500'
                                }`}>
                                {done ? <span className="material-symbols-outlined text-base">check</span> : num}
                            </div>
                            <span className={`mt-1 text-[10px] font-semibold whitespace-nowrap ${active ? 'text-primary' : done ? 'text-green-500' : 'text-slate-500'}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-0.5 w-16 sm:w-24 mx-1 mb-4 transition-colors ${done ? 'bg-green-500' : 'bg-border-dark'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── INPUT helper ────────────────────────────────────────────────────────────
function Field({ label, icon, required, ...props }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
            <div className="relative">
                {icon && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">{icon}</span>}
                <input
                    {...props}
                    required={required}
                    className={`w-full bg-background-dark border border-border-dark rounded-xl py-3 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors ${icon ? 'pl-10' : 'pl-4'}`}
                />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);

    const [form, setForm] = useState({
        fullName: user?.name || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
        lat: null,
        lng: null,
        mapAddress: '',
    });

    // Redirect if not logged in or cart is empty
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (cartItems.length === 0 && !placedOrder) navigate('/');
    }, [user, cartItems]);

    const shipping = cartTotal > 150 ? 0 : 12.99;
    const tax = +(cartTotal * 0.08).toFixed(2);
    const total = +(cartTotal + shipping + tax).toFixed(2);

    // ── Step 1 : Delivery Details ─────────────────────────────────────────────
    const handleStep1 = (e) => {
        e.preventDefault();
        setStep(2);
    };

    // ── Step 2 : Mapbox ───────────────────────────────────────────────────────
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [mapsLoaded, setMapsLoaded] = useState(false);
    const [mapsError, setMapsError] = useState(false);

    // ⬇ Mapbox public token
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZW5nZWxpYnJhaGltbyIsImEiOiJjbWx1NXVvNGUwNXZvM2dxdHhibnliaWV2In0.EgGXVX3x0GFVozTjhOxFCA';

    // Inject Mapbox GL JS + CSS when entering Step 2
    useEffect(() => {
        if (step !== 2) return;

        if (MAPBOX_TOKEN === 'YOUR_MAPBOX_PUBLIC_TOKEN') {
            setMapsError(true);
            return;
        }

        // If already loaded
        if (window.mapboxgl) { setMapsLoaded(true); return; }

        // Inject CSS
        if (!document.getElementById('mapbox-css')) {
            const link = document.createElement('link');
            link.id = 'mapbox-css';
            link.rel = 'stylesheet';
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
            document.head.appendChild(link);
        }

        // Inject JS
        if (!document.getElementById('mapbox-js')) {
            const script = document.createElement('script');
            script.id = 'mapbox-js';
            script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js';
            script.onload = () => setMapsLoaded(true);
            script.onerror = () => setMapsError(true);
            document.head.appendChild(script);
        }
    }, [step]);

    // Init Mapbox once script is ready
    useEffect(() => {
        if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

        const mbgl = window.mapboxgl;
        mbgl.accessToken = MAPBOX_TOKEN;

        // Default center: Riyadh
        const defaultLng = 46.6753;
        const defaultLat = 24.7136;

        const map = new mbgl.Map({
            container: mapRef.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [defaultLng, defaultLat],
            zoom: 13,
        });
        mapInstanceRef.current = map;

        // Draggable marker
        const el = document.createElement('div');
        el.innerHTML = `<span class="material-symbols-outlined" style="font-size:36px;color:#3b82f6;filter:drop-shadow(0 2px 8px #3b82f6aa);cursor:grab;">location_on</span>`;

        const marker = new mbgl.Marker({ element: el, draggable: true })
            .setLngLat([defaultLng, defaultLat])
            .addTo(map);
        markerRef.current = marker;

        // Reverse geocode using Mapbox Geocoding API
        const reverseGeocode = async (lng, lat) => {
            try {
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place`
                );
                const data = await res.json();
                const place = data.features?.[0]?.place_name || '';
                setForm((f) => ({ ...f, lat, lng, mapAddress: place }));
            } catch {
                setForm((f) => ({ ...f, lat, lng }));
            }
        };

        reverseGeocode(defaultLng, defaultLat);

        marker.on('dragend', () => {
            const { lng, lat } = marker.getLngLat();
            reverseGeocode(lng, lat);
        });

        map.on('click', (e) => {
            marker.setLngLat(e.lngLat);
            reverseGeocode(e.lngLat.lng, e.lngLat.lat);
        });

        return () => { map.remove(); mapInstanceRef.current = null; };
    }, [mapsLoaded]);

    const handleConfirmLocation = () => {
        if (form.mapAddress && !form.street) {
            setForm((f) => ({ ...f, street: form.mapAddress }));
        }
        setStep(3);
    };



    // ── Step 3 : Place order ──────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const orderData = {
                items: cartItems.map((item) => ({
                    product: item._id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    qty: item.qty,
                })),
                shippingAddress: {
                    street: form.mapAddress || form.street,
                    city: form.city,
                    state: form.state,
                    zip: form.zip,
                    country: form.country,
                },
                paymentMethod: 'Cash on Delivery',
                itemsPrice: +cartTotal.toFixed(2),
                shippingPrice: shipping,
                taxPrice: tax,
                totalPrice: total,
            };

            const { data } = await api.post('/orders', orderData);

            // Save to past purchases cookie
            const existingCookie = getCookie('past_purchases');
            const currentIds = existingCookie ? existingCookie.split(',') : [];
            const newIds = cartItems.map(item => item._id);
            // Combine new and old, remove duplicates, keep top 12
            const uniqueIds = [...new Set([...newIds, ...currentIds])].slice(0, 12);
            setCookie('past_purchases', uniqueIds.join(','), 365);

            setPlacedOrder(data);
            clearCart();
            toast.success('Order placed successfully! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ────────────────────────────────────────────────────────
    if (placedOrder) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-lg text-center space-y-6">
                    {/* Animated checkmark */}
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500">
                        <span className="material-symbols-outlined text-5xl text-green-400">check_circle</span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Order Confirmed! 🎉</h1>
                        <p className="text-slate-400">Thank you for your purchase. Your order has been placed and will be delivered soon.</p>
                    </div>

                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Order ID</span>
                            <span className="font-mono font-bold text-white">#{placedOrder._id?.slice(-10).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Payment</span>
                            <span className="text-green-400 font-semibold">Cash on Delivery</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total</span>
                            <span className="font-black text-primary text-lg">${Number(placedOrder.totalPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Status</span>
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">Pending</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => generateReceipt(placedOrder, user)}
                            className="flex-1 flex items-center justify-center gap-2 bg-surface-dark hover:bg-border-dark border border-border-dark text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <span className="material-symbols-outlined">download</span>
                            Download PDF Receipt
                        </button>
                        <Link
                            to="/"
                            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <span className="material-symbols-outlined">home</span>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Checkout layout ───────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <StepBar step={step} />

            <div className="grid md:grid-cols-[1fr_360px] gap-8 items-start">

                {/* ── Left: step content ── */}
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 sm:p-8">

                    {/* STEP 1 – Delivery Details */}
                    {step === 1 && (
                        <form onSubmit={handleStep1} className="space-y-5">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                Delivery Details
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Full Name" icon="person" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="John Smith" required />
                                <Field label="Phone Number" icon="phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" required />
                            </div>
                            <Field label="Street Address" icon="home" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="123 Main St, Apt 4B" required />
                            <div className="grid sm:grid-cols-3 gap-4">
                                <Field label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Riyadh" required />
                                <Field label="State / Region" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Riyadh Region" required />
                                <Field label="ZIP / Post Code" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} placeholder="12345" required />
                            </div>
                            <Field label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="US" required />
                            <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2">
                                Next: Confirm on Map <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </form>
                    )}

                    {/* STEP 2 – Google Maps */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                Confirm Delivery Location
                            </h2>

                            {/* No API key fallback */}
                            {mapsError ? (
                                <div className="space-y-4">
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-amber-400 mt-0.5">info</span>
                                        <div>
                                            <p className="text-amber-300 font-semibold text-sm">Mapbox not configured</p>
                                            <p className="text-amber-400/70 text-xs mt-1">
                                                Get your <strong>free</strong> token at{' '}
                                                <a href="https://account.mapbox.com" target="_blank" rel="noreferrer" className="underline text-amber-300">account.mapbox.com</a>{' '}
                                                and paste it as <code className="bg-black/30 px-1 rounded">MAPBOX_TOKEN</code> in <code className="bg-black/30 px-1 rounded">CheckoutPage.jsx</code>.
                                            </p>
                                        </div>
                                    </div>
                                    {/* Show the address entered in step 1 */}
                                    <div className="bg-background-dark rounded-xl p-5 space-y-2 border border-border-dark">
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Delivery Address (from Step 1)</p>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary">home</span>
                                            <div>
                                                <p className="text-white font-semibold">{form.fullName}</p>
                                                <p className="text-slate-400 text-sm">{form.street}</p>
                                                <p className="text-slate-400 text-sm">{form.city}, {form.state} {form.zip}</p>
                                                <p className="text-slate-400 text-sm">{form.country}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-xs text-center">Your address from Step 1 will be used for delivery.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-slate-400 text-sm">Click or drag the pin to your exact delivery location.</p>
                                    {/* Map container */}
                                    <div ref={mapRef} className="w-full h-80 rounded-xl overflow-hidden border border-border-dark bg-background-dark flex items-center justify-center">
                                        {!mapsLoaded && (
                                            <div className="flex flex-col items-center gap-2 text-slate-500">
                                                <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                                                <span className="text-sm">Loading map…</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Detected address */}
                                    {form.mapAddress && (
                                        <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
                                            <span className="material-symbols-outlined text-primary mt-0.5">pin_drop</span>
                                            <div>
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Detected Address</p>
                                                <p className="text-white text-sm">{form.mapAddress}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 border border-border-dark text-slate-400 hover:text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">arrow_back</span> Back
                                </button>
                                <button onClick={handleConfirmLocation} className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    Confirm Location <span className="material-symbols-outlined">check</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 – Review & Pay */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                Review & Pay
                            </h2>

                            {/* Delivery summary */}
                            <div className="bg-background-dark rounded-xl p-4 space-y-1 text-sm">
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Delivering to</p>
                                <p className="text-white font-semibold">{form.fullName}</p>
                                <p className="text-slate-400">{form.phone}</p>
                                <p className="text-slate-400">{form.mapAddress || form.street}</p>
                                <p className="text-slate-400">{form.city}, {form.state} {form.zip}, {form.country}</p>
                            </div>

                            {/* Payment method selector */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Method</p>
                                <div className="border-2 border-primary rounded-xl p-4 flex items-center gap-4 bg-primary/5">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">payments</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white">Cash on Delivery</p>
                                        <p className="text-xs text-slate-400">Pay when your order arrives at your door</p>
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 border border-border-dark text-slate-400 hover:text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">arrow_back</span> Back
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    {loading ? (
                                        <><span className="material-symbols-outlined animate-spin">progress_activity</span> Placing…</>
                                    ) : (
                                        <><span className="material-symbols-outlined">check_circle</span> Place Order</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: order summary ── */}
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-4 md:sticky md:top-24">
                    <h3 className="font-bold text-white text-lg border-b border-border-dark pb-3">Order Summary</h3>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex gap-3 items-center">
                                <img src={item.image} alt={item.name} className="w-14 h-14 object-contain bg-background-dark rounded-lg p-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                                </div>
                                <span className="text-sm font-black text-primary flex-shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border-dark pt-4 space-y-2.5 text-sm">
                        <div className="flex justify-between text-slate-400">
                            <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? <span className="text-green-400 font-semibold">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white font-black text-lg border-t border-border-dark pt-3">
                            <span>Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {shipping === 0 && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 text-green-400 text-xs">
                            <span className="material-symbols-outlined text-base">local_shipping</span>
                            Free shipping on orders over $150!
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-500 text-xs justify-center pt-1">
                        <span className="material-symbols-outlined text-base">lock</span>
                        Secure checkout — SSL encrypted
                    </div>
                </div>

            </div>
        </div>
    );
}
