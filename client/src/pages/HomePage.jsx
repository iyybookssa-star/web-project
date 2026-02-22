import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { getCookie } from '../utils/cookieUtils';

const CATEGORIES = [
    {
        name: 'Engines',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbtRcLsd2UAmB7GFTH9C1_9pqa5EPDJ_fedWfGMh-7cVacgcMuU1omTFoUn8nFuG78rP1rx7GOFQefEhZlgvFIftsruAE82bOf3hGrNMHg7iUFeLXcou-AbPcQSSVVuk6OD2Yiq40hRjSSdqD5nL6qcRUCFuelVFdvZuxIF4uue3pGdA6BDmE1kf_H7dhhRpXE-gBNd76LqXO_uBduTiQqyXIXYq4lProyZe56zccsmxv2RJD0rHH2B4FeMWpGKQGAwcwIRGtpdJD8',
        category: 'Engine',
    },
    {
        name: 'Brakes',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_fPEthJy-6mHtL4efdbn3Q0U44fKsOCxpod08iIVt_TZSvj9UOWKssM4rvX0j_3gfkVTZBbglB2OoLGXzPQiZr6xO6vVAAPSNmTNXryJdtfNf4w4jkw6tBbHzQg3r5NaWr9JOIARRLbWILIl5UdokGha2X-ufL2pQhCkzyADvfVYxxMuI2SJ9J0xkPswhBE4DGdThyIqrvd1aGvvflM649YTIPvk1TumkN02xNAAbUaolxcpgcX4HvhmJ70Tu0Q7FgnSjmUiDmIbE',
        category: 'Brakes',
    },
    {
        name: 'Lighting',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjzMPX8ORnMFjS36eTpCq5qDljOPQAA-S0_7G1V3Xqz_K_QfJARuqwdFZOEhRSpSCDCIKLFb1fM1sNhnkdg70guTMbGijHT3-AXbkTyvcd4BIwpblWgh41K4R0DIzs9ermE82RePqdTfm1DhygRYaRYs533vJokZIE0hBsrts-sOB8FBxQhfChabehKiKoo-2Pck3P7AkBhfHZcRlBWSmg6bwr2TweYcs-ABpnYtvE2NNCfr7DTiXN9JQuHYPhT-tbrLg7xXlCzjis',
        category: 'Electrical',
    },
    {
        name: 'Suspension',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWGKo5wxUhlbFpBNZv8RcNscbN4s15jc-prwUN8ZEXOdydBZvYCd866egQ-ZRiimPVp_neFOqfRgmNTMQX70PXd3WIrpewldTBkN4qjjhU0rnC9Db-8oczq1qcIQP_2M5aLff3BchJUVpqcE0i2l4F-Rd7iVNz0NfvCOuq9AN5pzBkCBvO-xwIlUh4dlO3_Vw_7A3k9qWCGoE6CQPbh0Z9fqWfZIjb8jVYJiUMZ6Q356oBbzk0QUK7YpHHXeBAG03QJKOZrezBSl5J',
        category: 'Suspension',
    },
];

export default function HomePage() {
    const [topSellers, setTopSellers] = useState([]);
    const [pastPurchases, setPastPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch top sellers
        api.get('/products?limit=4')
            .then(({ data }) => setTopSellers(data.products || []))
            .catch(() => setTopSellers([]))
            .finally(() => setLoading(false));

        // Fetch past purchases from cookie
        const pastIds = getCookie('past_purchases');
        if (pastIds) {
            api.get(`/products?ids=${pastIds}`)
                .then(({ data }) => setPastPurchases(data.products || []))
                .catch(() => { });
        }
    }, []);

    return (
        <div>

            {/* ── Hero Section ── */}
            <section className="relative h-[600px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA67kmxV4KARGeg5sHr9ZkgdnZIa9vSBfrt30Q3cZ14lhmV878aSj-o6EwE9WXdpIc9OaRpArOX9PmtlxnQy3FzKNDPMZhZfcCSbnTVGCPLP3_C5VrLQU3cktLV4n3hCNPROcGpl7aVgufxYeT1753X7iB4EE7Kct1K9S0eKGYPwyNdzq3JEHXC7baUYSqBTvTlMW9lqdt_3m2kGMaxyUwI7iSKp40CTGHdN8ZvMHvv77KESXjiuUVmKzwcLGByrqHrcsgZvP_ZlY9h"
                        alt="Sports car"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center w-full">
                    {/* Hero Text */}
                    <div className="space-y-6">
                        <h2 className="text-5xl lg:text-6xl font-black leading-[1.1] text-white">
                            FIND THE <span className="text-primary italic">RIGHT PARTS</span> FOR YOUR RIDE
                        </h2>
                        <p className="text-lg text-slate-300 max-w-md">
                            Guaranteed fit for every make and model. Get high-performance parts delivered to your door.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                                <span className="material-symbols-outlined text-primary">verified</span> Guaranteed Fit
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                                <span className="material-symbols-outlined text-primary">local_shipping</span> Next Day Delivery
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Selector Widget */}
                    <div className="bg-surface-dark/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary">directions_car</span>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Vehicle Selector</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Year', options: ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'] },
                                { label: 'Make', options: ['Toyota', 'Ford', 'BMW', 'Honda', 'Chevrolet', 'Audi', 'Mercedes'] },
                                { label: 'Model', options: ['Camry', 'F-150', '3 Series', 'Civic', 'Silverado', 'Corolla', 'Mustang'] },
                                { label: 'Engine', options: ['V6', 'V8', '2.0L Turbo', 'Hybrid'] },
                            ].map(({ label, options }) => (
                                <div key={label} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
                                    <select
                                        id={`select-${label.toLowerCase()}`}
                                        className="w-full bg-background-dark border-border-dark rounded-lg text-white focus:ring-primary focus:border-primary text-sm py-2 px-3"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select {label}</option>
                                        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                const year = document.getElementById('select-year').value;
                                const make = document.getElementById('select-make').value;
                                const model = document.getElementById('select-model').value;
                                if (!year && !make) {
                                    alert('Please select at least a Year or Make');
                                    return;
                                }
                                window.location.href = `/products?year=${year}&make=${make}&model=${model}`;
                            }}
                            className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined">search</span>
                            FIND COMPATIBLE PARTS
                        </button>
                        <p className="text-center mt-4 text-xs text-slate-500 italic">
                            Looking for a specific VIN? <a href="#" className="text-primary hover:underline">Click here</a>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Shop by Category ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-end justify-between mb-10">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-bold dark:text-white">
                            Shop by <span className="text-primary">Category</span>
                        </h3>
                        <p className="text-slate-500">Everything you need from bumper to bumper.</p>
                    </div>
                    <Link
                        to="/products"
                        className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                        VIEW ALL CATEGORIES <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/products?category=${cat.category}`}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-border-dark mb-4">
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h4 className="text-lg font-bold text-white">{cat.name}</h4>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Past Purchases ── */}
            {pastPurchases.length > 0 && (
                <section className="bg-slate-50 dark:bg-surface-dark/30 py-20 border-b border-slate-200 dark:border-border-dark">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3 mb-10">
                            <span className="material-symbols-outlined text-primary text-3xl">history</span>
                            <h3 className="text-3xl font-bold dark:text-white">
                                Buy It <span className="text-primary">Again</span>
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {pastPurchases.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Top Sellers ── */}
            <section className="bg-slate-50 dark:bg-surface-dark/30 py-20 border-y border-slate-200 dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-3xl font-bold dark:text-white">
                            Top <span className="text-primary">Sellers</span>
                        </h3>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-300 dark:border-border-dark hover:bg-white dark:hover:bg-surface-dark transition-colors">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-300 dark:border-border-dark hover:bg-white dark:hover:bg-surface-dark transition-colors">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : topSellers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {topSellers.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
                            <p>No products yet — add some via the API or seed script.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Newsletter ── */}
            <section className="py-20 relative overflow-hidden bg-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-center md:text-left space-y-4">
                            <h3 className="text-3xl font-black text-white">
                                NEVER MISS A <span className="italic underline decoration-slate-900 underline-offset-4">DEAL</span>
                            </h3>
                            <p className="text-white/80 max-w-sm">
                                Sign up for our newsletter and get 15% off your first order plus exclusive maintenance tips.
                            </p>
                        </div>
                        <form className="w-full max-w-lg" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-grow px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-xl transition-all shadow-xl"
                                >
                                    SUBSCRIBE
                                </button>
                            </div>
                            <p className="text-[10px] text-white/60 mt-4 text-center sm:text-left uppercase tracking-widest">
                                No spam. Just high-octane deals.
                            </p>
                        </form>
                    </div>
                </div>
                {/* Decorative bg icon */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none translate-x-1/4">
                    <span className="material-symbols-outlined" style={{ fontSize: '400px' }}>engineering</span>
                </div>
            </section>

        </div>
    );
}
