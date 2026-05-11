import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PriceTag from './../components/PriceTag';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-4xl">shopping_cart</span>
                Your Cart
            </h1>

            {cartItems.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-16 text-center shadow-lg">
                    <span className="material-symbols-outlined text-7xl text-slate-300 dark:text-slate-600 mb-4 block">remove_shopping_cart</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Looks like you haven't added any parts to your cart yet.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/30 active:scale-[0.98]"
                    >
                        START SHOPPING
                    </button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-4 flex gap-6 shadow-sm hover:shadow-md transition-shadow">
                                <Link to={`/products/${item._id}`} className="shrink-0 w-32 h-32 bg-slate-100 dark:bg-background-dark rounded-xl overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                                </Link>

                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <Link to={`/products/${item._id}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-slate-500 font-mono mt-1">PN: {item.partNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-primary"><PriceTag amount={item.price} /></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg p-1">
                                            <button
                                                onClick={() => updateQty(item._id, item.qty - 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item._id, item.qty + 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-sm font-bold"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 sticky top-24 shadow-lg">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                Order Summary
                            </h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white"><PriceTag amount={cartTotal} /></span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Shipping</span>
                                    <span className="text-green-500 font-bold">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Taxes</span>
                                    <span className="font-medium text-slate-900 dark:text-white">Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-border-dark pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-900 dark:text-white font-bold">Estimated Total</span>
                                    <span className="text-2xl font-black text-primary"><PriceTag amount={cartTotal} /></span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                PROCEED TO CHECKOUT
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                            
                            <button
                                onClick={() => navigate('/products')}
                                className="w-full mt-3 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors border border-slate-200 dark:border-border-dark"
                            >
                                Continue Shopping
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                Secure checkout — 256-bit SSL encrypted
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
