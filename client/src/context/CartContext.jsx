import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Queue to serialize cart mutations (prevents session race conditions)
    const queueRef = useRef(Promise.resolve());

    // Load cart from server session on mount
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const { data } = await api.get('/cart');
                setCartItems(data || []);
            } catch (error) {
                console.error('Failed to load cart from session:', error);
            } finally {
                setLoaded(true);
            }
        };
        fetchCart();
    }, []);

    const addToCart = (product, qty = 1) => {
        // Chain onto the queue so requests run one-at-a-time
        queueRef.current = queueRef.current.then(async () => {
            try {
                const { data } = await api.post('/cart', {
                    _id: product._id,
                    name: product.name,
                    partNumber: product.partNumber,
                    price: product.price,
                    image: product.image,
                    qty,
                });
                setCartItems(data);
                toast.success(`${product.name} added to cart!`);
                setIsCartOpen(true);
            } catch (error) {
                console.error('Failed to add to cart:', error);
                // Fallback: update locally
                setCartItems((prev) => {
                    const existing = prev.find((item) => item._id === product._id);
                    if (existing) {
                        return prev.map((item) =>
                            item._id === product._id
                                ? { ...item, qty: item.qty + qty }
                                : item
                        );
                    }
                    return [...prev, { ...product, qty }];
                });
                toast.success(`${product.name} added to cart!`);
                setIsCartOpen(true);
            }
        });
        return queueRef.current;
    };

    const removeFromCart = async (productId) => {
        try {
            const { data } = await api.delete(`/cart/${productId}`);
            setCartItems(data);
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            setCartItems((prev) => prev.filter((item) => item._id !== productId));
        }
    };

    const updateQty = async (productId, qty) => {
        if (qty <= 0) return removeFromCart(productId);
        try {
            const { data } = await api.put(`/cart/${productId}`, { qty });
            setCartItems(data);
        } catch (error) {
            console.error('Failed to update qty:', error);
            setCartItems((prev) =>
                prev.map((item) => (item._id === productId ? { ...item, qty } : item))
            );
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart');
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
        setCartItems([]);
    };

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
                loaded,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
