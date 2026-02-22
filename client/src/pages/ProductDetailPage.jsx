import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(({ data }) => setProduct(data))
            .catch(() => navigate('/products'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="animate-pulse bg-surface-dark rounded-2xl h-96" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                Back
            </button>

            <div className="grid md:grid-cols-2 gap-12 bg-surface-dark border border-border-dark rounded-2xl p-8">
                {/* Image */}
                <div className="bg-background-dark rounded-xl overflow-hidden flex items-center justify-center h-72">
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-8xl text-gray-700">directions_car</span>
                    )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between">
                    <div>
                        <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                            {product.category}
                        </span>
                        <h1 className="text-3xl font-bold mt-3 mb-2">{product.name}</h1>
                        {product.partNumber && (
                            <p className="text-gray-500 text-sm mb-4">Part # {product.partNumber}</p>
                        )}
                        <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>
                        <p className="text-3xl font-black text-primary">${product.price?.toFixed(2)}</p>
                        <p className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-background-dark border border-border-dark rounded-xl px-3 py-2">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-400 hover:text-white w-6 text-center text-xl">−</button>
                            <span className="w-8 text-center font-semibold">{qty}</span>
                            <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="text-gray-400 hover:text-white w-6 text-center text-xl">+</button>
                        </div>
                        <button
                            onClick={() => addToCart(product, qty)}
                            disabled={product.stock === 0}
                            className="flex-grow bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
