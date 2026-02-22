import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Engine', 'Brakes', 'Suspension', 'Electrical', 'Exhaust', 'Transmission'];

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');

    const category = searchParams.get('category') || 'All';
    const page = Number(searchParams.get('page') || 1);

    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 12 });
        if (category && category !== 'All') params.set('category', category);
        if (search) params.set('search', search);
        if (make) params.set('make', make);
        if (model) params.set('model', model);
        if (year) params.set('year', year);

        api.get(`/products?${params}`)
            .then(({ data }) => { setProducts(data.products || []); setTotal(data.total || 0); })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [category, page, search, make, model, year]);

    const setCategory = (cat) => {
        setSearchParams({ category: cat, page: 1, ...(make && { make }), ...(model && { model }), ...(year && { year }) });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ search, category, page: 1, ...(make && { make }), ...(model && { model }), ...(year && { year }) });
    };

    const clearVehicle = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('make');
        newParams.delete('model');
        newParams.delete('year');
        setSearchParams(newParams);
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-8">All Parts</h1>

            {/* Vehicle Filter Banner */}
            {(make || year) && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-primary">
                        <span className="material-symbols-outlined text-2xl">directions_car</span>
                        <div>
                            <p className="font-bold text-lg">Showing parts for {year} {make} {model}</p>
                            <p className="text-xs opacity-80">Only guaranteed fitment parts shown</p>
                        </div>
                    </div>
                    <button onClick={clearVehicle} className="text-sm font-semibold hover:underline">Change Vehicle</button>
                </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search parts by name, number, or category..."
                    className="flex-grow bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
                <button
                    type="submit"
                    className="bg-primary hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                    Search
                </button>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat
                            ? 'bg-primary border-primary text-white'
                            : 'bg-surface-dark border-border-dark text-gray-400 hover:border-primary hover:text-white'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Results */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="bg-surface-dark rounded-2xl h-72 animate-pulse" />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <>
                    <p className="text-sm text-gray-500 mb-4">{total} parts found</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-10">
                        {page > 1 && (
                            <button
                                onClick={() => setSearchParams({ category, page: page - 1 })}
                                className="px-4 py-2 bg-surface-dark border border-border-dark rounded-lg hover:border-primary text-gray-300 transition-colors"
                            >
                                ← Prev
                            </button>
                        )}
                        {products.length === 12 && (
                            <button
                                onClick={() => setSearchParams({ category, page: page + 1 })}
                                className="px-4 py-2 bg-surface-dark border border-border-dark rounded-lg hover:border-primary text-gray-300 transition-colors"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-24 text-gray-500">
                    <span className="material-symbols-outlined text-6xl mb-4 block">search_off</span>
                    <p>No parts found. Try a different search or category.</p>
                </div>
            )}
        </div>
    );
}
