import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-100 dark:border-border-dark flex flex-col h-full group">

            {/* Image */}
            <div className="relative aspect-square rounded-xl bg-slate-50 dark:bg-background-dark overflow-hidden mb-4">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">directions_car</span>
                    </div>
                )}

                {/* Badge */}
                {product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/20">
                        HOT DEAL
                    </span>
                )}
                {product.stock > 0 && !product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/20">
                        IN STOCK
                    </span>
                )}

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                </button>
            </div>

            {/* Info */}
            <div className="flex-grow">
                {/* Rating placeholder */}
                <div className="flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm">star</span>
                    <span className="text-xs font-bold dark:text-slate-300">4.8 (Reviews)</span>
                </div>

                <Link to={`/products/${product._id}`}>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                    </h4>
                </Link>

                {product.partNumber && (
                    <p className="text-xs text-slate-500 mb-4">Part #{product.partNumber}</p>
                )}

                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-primary">${product.price?.toFixed(2)}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-slate-500 line-through">${product.originalPrice?.toFixed(2)}</span>
                    )}
                </div>
            </div>

            {/* Add to Cart */}
            <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
        </div>
    );
}
