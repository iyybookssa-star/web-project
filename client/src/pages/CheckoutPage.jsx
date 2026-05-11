import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateReceipt } from '../utils/generateReceipt';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { addToPurchaseHistory } from '../utils/cookieUtils';
import PriceTag from '../components/PriceTag';

// ── Validation rules per country ────────────────────────────────────────────
const PHONE_RULES = {
    SA: { pattern: '[0-9]{9}', placeholder: '5XXXXXXXX', title: 'Enter 9 digits (e.g. 512345678)', maxLength: 9 },
    AE: { pattern: '[0-9]{8,9}', placeholder: '5XXXXXXXX', title: 'Enter 8-9 digits', maxLength: 9 },
    US: { pattern: '[0-9]{10}', placeholder: '2125551234', title: 'Enter 10 digits', maxLength: 10 },
    GB: { pattern: '[0-9]{10,11}', placeholder: '7911123456', title: 'Enter 10-11 digits', maxLength: 11 },
    DE: { pattern: '[0-9]{10,11}', placeholder: '15112345678', title: 'Enter 10-11 digits', maxLength: 11 },
    FR: { pattern: '[0-9]{9,10}', placeholder: '612345678', title: 'Enter 9-10 digits', maxLength: 10 },
    JP: { pattern: '[0-9]{10,11}', placeholder: '9012345678', title: 'Enter 10-11 digits', maxLength: 11 },
    IN: { pattern: '[0-9]{10}', placeholder: '9876543210', title: 'Enter 10 digits', maxLength: 10 },
    CA: { pattern: '[0-9]{10}', placeholder: '4165551234', title: 'Enter 10 digits', maxLength: 10 },
    AU: { pattern: '[0-9]{9,10}', placeholder: '412345678', title: 'Enter 9-10 digits', maxLength: 10 },
    KW: { pattern: '[0-9]{8}', placeholder: '51234567', title: 'Enter 8 digits', maxLength: 8 },
    BH: { pattern: '[0-9]{8}', placeholder: '36001234', title: 'Enter 8 digits', maxLength: 8 },
    QA: { pattern: '[0-9]{8}', placeholder: '55001234', title: 'Enter 8 digits', maxLength: 8 },
    OM: { pattern: '[0-9]{8}', placeholder: '92123456', title: 'Enter 8 digits', maxLength: 8 },
    EG: { pattern: '[0-9]{10,11}', placeholder: '1001234567', title: 'Enter 10-11 digits', maxLength: 11 },
    TR: { pattern: '[0-9]{10}', placeholder: '5321234567', title: 'Enter 10 digits', maxLength: 10 },
};
const ZIP_RULES = {
    SA: { pattern: '[0-9]{5}', placeholder: '12345', title: 'Enter 5 digits', maxLength: 5 },
    AE: { pattern: '[0-9]{0,5}', placeholder: 'Optional', title: 'Optional or 5 digits', maxLength: 5, notRequired: true },
    US: { pattern: '[0-9]{5}', placeholder: '10001', title: 'Enter 5 digits', maxLength: 5 },
    GB: { pattern: '[A-Za-z0-9 ]{5,8}', placeholder: 'SW1A 1AA', title: 'Enter a valid UK postcode', maxLength: 8 },
    DE: { pattern: '[0-9]{5}', placeholder: '10115', title: 'Enter 5 digits', maxLength: 5 },
    FR: { pattern: '[0-9]{5}', placeholder: '75001', title: 'Enter 5 digits', maxLength: 5 },
    JP: { pattern: '[0-9]{3}-?[0-9]{4}', placeholder: '100-0001', title: 'Enter 7 digits (e.g. 100-0001)', maxLength: 8 },
    IN: { pattern: '[0-9]{6}', placeholder: '400001', title: 'Enter 6 digits', maxLength: 6 },
    CA: { pattern: '[A-Za-z][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]', placeholder: 'M5V 2T6', title: 'Enter a valid Canadian postal code', maxLength: 7 },
    AU: { pattern: '[0-9]{4}', placeholder: '2000', title: 'Enter 4 digits', maxLength: 4 },
    KW: { pattern: '[0-9]{5}', placeholder: '13001', title: 'Enter 5 digits', maxLength: 5 },
    BH: { pattern: '[0-9]{3,4}', placeholder: '1234', title: 'Enter 3-4 digits', maxLength: 4 },
    QA: { pattern: '[0-9]{0,5}', placeholder: 'Optional', title: 'Optional', maxLength: 5, notRequired: true },
    OM: { pattern: '[0-9]{3}', placeholder: '100', title: 'Enter 3 digits', maxLength: 3 },
    EG: { pattern: '[0-9]{5}', placeholder: '11511', title: 'Enter 5 digits', maxLength: 5 },
    TR: { pattern: '[0-9]{5}', placeholder: '34000', title: 'Enter 5 digits', maxLength: 5 },
};

// ── Country → Cities + Regions data ─────────────────────────────────────────
const COUNTRY_CITIES = {
    SA: { name: 'Saudi Arabia', code: '+966', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran', 'Tabuk', 'Abha', 'Taif', 'Hail', 'Buraidah', 'Najran', 'Jizan', 'Yanbu', 'Al Jubail', 'Khamis Mushait'], regions: ['Riyadh Region', 'Makkah Region', 'Madinah Region', 'Eastern Province', 'Asir', 'Tabuk', 'Hail', 'Northern Borders', 'Jazan', 'Najran', 'Al Baha', 'Al Jawf', 'Qassim'] },
    AE: { name: 'United Arab Emirates', code: '+971', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain'], regions: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'] },
    US: { name: 'United States', code: '+1', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Seattle', 'Denver', 'Miami', 'Atlanta', 'Boston', 'Las Vegas', 'Portland'], regions: ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'Arizona', 'Washington', 'Colorado', 'Nevada', 'Oregon', 'Massachusetts'] },
    GB: { name: 'United Kingdom', code: '+44', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Bristol', 'Edinburgh', 'Leeds', 'Sheffield', 'Cardiff', 'Belfast', 'Nottingham', 'Newcastle', 'Brighton', 'Oxford', 'Cambridge'], regions: ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Greater London', 'South East', 'North West', 'West Midlands', 'Yorkshire'] },
    DE: { name: 'Germany', code: '+49', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover', 'Nuremberg'], regions: ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Lower Saxony', 'Hesse', 'Saxony', 'Berlin', 'Hamburg', 'Bremen'] },
    FR: { name: 'France', code: '+33', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims'], regions: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Provence-Alpes-Côte d\'Azur', 'Grand Est', 'Pays de la Loire', 'Brittany'] },
    JP: { name: 'Japan', code: '+81', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Kobe', 'Kyoto', 'Fukuoka', 'Kawasaki', 'Hiroshima', 'Sendai'], regions: ['Kanto', 'Kansai', 'Chubu', 'Kyushu', 'Tohoku', 'Hokkaido', 'Chugoku', 'Shikoku'] },
    IN: { name: 'India', code: '+91', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'], regions: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Kerala'] },
    CA: { name: 'Canada', code: '+1', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Halifax'], regions: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick'] },
    AU: { name: 'Australia', code: '+61', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Hobart', 'Darwin'], regions: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'ACT', 'Northern Territory'] },
    KW: { name: 'Kuwait', code: '+965', cities: ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Jahra', 'Mangaf', 'Fahaheel', 'Ahmadi'], regions: ['Al Asimah', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra'] },
    BH: { name: 'Bahrain', code: '+973', cities: ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town', 'Sitra', 'Budaiya'], regions: ['Capital', 'Muharraq', 'Northern', 'Southern'] },
    QA: { name: 'Qatar', code: '+974', cities: ['Doha', 'Al Wakrah', 'Al Khor', 'Al Rayyan', 'Umm Salal', 'Lusail', 'Mesaieed'], regions: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Daayen', 'Al Shamal', 'Madinat ash Shamal'] },
    OM: { name: 'Oman', code: '+968', cities: ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri', 'Rustaq', 'Barka'], regions: ['Muscat', 'Dhofar', 'Al Batinah North', 'Al Batinah South', 'Al Dakhiliyah', 'Al Sharqiyah North', 'Al Sharqiyah South', 'Al Dhahirah'] },
    EG: { name: 'Egypt', code: '+20', cities: ['Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Luxor', 'Aswan', 'Hurghada', 'Port Said', 'Suez', 'Mansoura'], regions: ['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Luxor', 'Aswan', 'South Sinai', 'Suez', 'Port Said'] },
    TR: { name: 'Turkey', code: '+90', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya', 'Mersin', 'Kayseri'], regions: ['Marmara', 'Central Anatolia', 'Aegean', 'Mediterranean', 'Black Sea', 'Eastern Anatolia', 'Southeastern Anatolia'] },
};

// Sorted list of countries for dropdown
const COUNTRY_LIST = Object.entries(COUNTRY_CITIES)
    .map(([code, data]) => ({ code, name: data.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

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

// ── SELECT helper ───────────────────────────────────────────────────────────
function SelectField({ label, icon, required, children, ...props }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
            <div className="relative">
                {icon && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">{icon}</span>}
                <select
                    {...props}
                    required={required}
                    className={`w-full bg-background-dark border border-border-dark rounded-xl py-3 pr-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none ${icon ? 'pl-10' : 'pl-4'}`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                    {children}
                </select>
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
        phoneCode: '+966',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'SA',
        lat: null,
        lng: null,
        mapAddress: '',
    });

    // When country changes, reset city/state and update phone code
    const handleCountryChange = (countryCode) => {
        const countryData = COUNTRY_CITIES[countryCode];
        setForm(f => ({
            ...f,
            country: countryCode,
            city: '',
            state: '',
            phoneCode: countryData?.code || f.phoneCode,
        }));
    };

    // Get cities and regions for currently selected country
    const availableCities = COUNTRY_CITIES[form.country]?.cities || [];
    const availableRegions = COUNTRY_CITIES[form.country]?.regions || [];
    const phoneRule = PHONE_RULES[form.country] || PHONE_RULES.SA;
    const zipRule = ZIP_RULES[form.country] || ZIP_RULES.SA;

    // Redirect if not logged in or cart is empty
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (cartItems.length === 0 && !placedOrder) navigate('/');
    }, [user, cartItems]);

    const shipping = cartTotal > 150 ? 0 : 12.99;
    const tax = +(cartTotal * 0.15).toFixed(2);
    const total = +(cartTotal + shipping + tax).toFixed(2);

    // ── Step 1 : Delivery Details ─────────────────────────────────────────────
    const handleStep1 = (e) => {
        e.preventDefault();
        setStep(2);
    };

    // ── Step 2 : Mapbox ───────────────────────────────────────────────────────
    const [showHelp, setShowHelp] = useState(false);
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
                    street: form.street,
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
            const newIds = cartItems.map(item => item._id);
            addToPurchaseHistory(newIds);

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
                            <span className="font-black text-primary text-lg"><PriceTag amount={placedOrder.totalPrice} /></span>
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
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                                    Delivery Details
                                </h2>
                                <button type="button" onClick={() => setShowHelp(true)} className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-surface-dark border border-border-dark px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-[18px]">help</span> Help
                                </button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Full Name" icon="person" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="John Smith" required />
                                {/* Phone with country code */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                                    <div className="relative flex gap-2">
                                        <select
                                            value={form.phoneCode}
                                            onChange={e => setForm({ ...form, phoneCode: e.target.value })}
                                            className="w-[100px] flex-shrink-0 bg-background-dark border border-border-dark rounded-xl py-3 px-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none text-sm"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                                        >
                                            {Object.entries(COUNTRY_CITIES)
                                                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                                                .map(([code, data]) => (
                                                    <option key={code} value={data.code}>{data.code}</option>
                                                ))
                                            }
                                        </select>
                                        <div className="relative flex-1">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">phone</span>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
                                                placeholder={phoneRule.placeholder}
                                                pattern={phoneRule.pattern}
                                                title={phoneRule.title}
                                                maxLength={phoneRule.maxLength}
                                                required
                                                className="w-full bg-background-dark border border-border-dark rounded-xl py-3 pr-4 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Field label="Street Address" icon="home" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="123 Main St, Apt 4B" required />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <SelectField label="Country" icon="public" value={form.country} onChange={e => handleCountryChange(e.target.value)} required>
                                    {COUNTRY_LIST.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </SelectField>
                                <SelectField label="City" icon="location_city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required>
                                    <option value="" disabled>Select a city</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </SelectField>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <SelectField label="State / Region" icon="map" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required>
                                    <option value="" disabled>Select a region</option>
                                    {availableRegions.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </SelectField>
                                <Field
                                    label="ZIP / Post Code"
                                    value={form.zip}
                                    onChange={e => setForm({ ...form, zip: e.target.value })}
                                    placeholder={zipRule.placeholder}
                                    pattern={zipRule.pattern}
                                    title={zipRule.title}
                                    maxLength={zipRule.maxLength}
                                    required={!zipRule.notRequired}
                                />
                            </div>
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
                                                <p className="text-slate-400 text-sm">{COUNTRY_CITIES[form.country]?.name || form.country}</p>
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
                                <p className="text-slate-400">{form.phoneCode} {form.phone}</p>
                                <p className="text-slate-400">{form.street}</p>
                                <p className="text-slate-400">{form.city}, {form.state} {form.zip}, {COUNTRY_CITIES[form.country]?.name || form.country}</p>
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
                                <span className="text-sm font-black text-primary flex-shrink-0"><PriceTag amount={item.price * item.qty} /></span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border-dark pt-4 space-y-2.5 text-sm">
                        <div className="flex justify-between text-slate-400">
                            <span>Subtotal</span><span><PriceTag amount={cartTotal} /></span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? <span className="text-green-400 font-semibold">FREE</span> : <PriceTag amount={shipping} />}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Tax (15%)</span><span><PriceTag amount={tax} /></span>
                        </div>
                        <div className="flex justify-between text-white font-black text-lg border-t border-border-dark pt-3">
                            <span>Total</span>
                            <span className="text-primary"><PriceTag amount={total} /></span>
                        </div>
                    </div>

                    {shipping === 0 && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 text-green-400 text-xs">
                            <span className="material-symbols-outlined text-base">local_shipping</span>
                            Free shipping on orders over 150 SAR!
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-500 text-xs justify-center pt-1">
                        <span className="material-symbols-outlined text-base">lock</span>
                        Secure checkout — SSL encrypted
                    </div>
                </div>

            </div>
            
            {/* Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
                    <div className="bg-background-dark border border-border-dark rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">info</span> Checkout Help
                        </h3>
                        <div className="space-y-4 text-slate-300 text-sm">
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-1">Phone Number</h4>
                                <p>Make sure to enter a valid phone number for your country. Our system will validate it automatically.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-1">Country & Region</h4>
                                <p>Select your country first. The City and State/Region dropdowns will update automatically based on your selection.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-1">ZIP / Post Code</h4>
                                <p>Required for most countries. Enter your exact postal code to ensure accurate delivery.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-1">Map Location</h4>
                                <p>On the next step, you will be asked to confirm your location on a map. You can drag the pin or click "Use Current Location".</p>
                            </div>
                        </div>
                        <button onClick={() => setShowHelp(false)} className="w-full mt-6 bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors">
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
