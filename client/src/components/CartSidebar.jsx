import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartSidebar = () => {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQty, cartTotal } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white dark:bg-surface-dark shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">shopping_cart</span>
                        <h2 className="text-xl font-bold dark:text-white">Your Cart</h2>
                        <span className="ml-1 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {cartItems.reduce((a, i) => a + i.qty, 0)}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-background-dark transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-slate-400">
                            <span className="material-symbols-outlined text-6xl">production_quantity_limits</span>
                            <p className="font-medium">Your cart is empty</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-primary font-semibold hover:underline text-sm"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item._id} className="flex gap-4 bg-slate-50 dark:bg-background-dark rounded-xl p-3">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-contain rounded-lg bg-white dark:bg-surface-dark"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold dark:text-white text-sm line-clamp-2">{item.name}</p>
                                    <p className="text-xs text-slate-500 mb-2">Part #{item.partNumber}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 border border-slate-200 dark:border-border-dark rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => updateQty(item._id, item.qty - 1)}
                                                className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300 text-lg font-bold transition-colors"
                                            >
                                                −
                                            </button>
                                            <span className="px-2 text-sm font-semibold dark:text-white">{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item._id, item.qty + 1)}
                                                className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300 text-lg font-bold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-black text-primary">${(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors self-start"
                                >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-slate-200 dark:border-border-dark space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Subtotal</span>
                            <span className="font-black text-xl text-primary">${cartTotal.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-slate-400 text-center">Shipping & taxes calculated at checkout</p>
                        <Link
                            to="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <span className="material-symbols-outlined">lock</span>
                            Proceed to Checkout
                        </Link>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-full text-center text-sm text-slate-500 hover:text-primary transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
