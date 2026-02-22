import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product, qty = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item._id === product._id);
            if (existing) {
                toast.success(`${product.name} quantity updated`);
                return prev.map((item) =>
                    item._id === product._id
                        ? { ...item, qty: item.qty + qty }
                        : item
                );
            }
            toast.success(`${product.name} added to cart!`);
            return [...prev, { ...product, qty }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => prev.filter((item) => item._id !== productId));
    };

    const updateQty = (productId, qty) => {
        if (qty <= 0) return removeFromCart(productId);
        setCartItems((prev) =>
            prev.map((item) => (item._id === productId ? { ...item, qty } : item))
        );
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                removeFromCart,
                updateQty,
                clearCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
