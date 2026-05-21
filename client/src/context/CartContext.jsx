import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { getCookie, setCookie } from '../utils/cookieUtils';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = getCookie('cart_items');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (err) {
            console.error('Failed to load cart from cookie:', err);
            return [];
        }
    });
    const [loaded, setLoaded] = useState(false);

    // Queue to serialize cart mutations (prevents session race conditions)
    const queueRef = useRef(Promise.resolve());

    // Save cart to cookie whenever it changes
    useEffect(() => {
        try {
            setCookie('cart_items', JSON.stringify(cartItems), 30); // Persist for 30 days
        } catch (err) {
            console.error('Failed to save cart to cookie:', err);
        }
    }, [cartItems]);

    // Load cart from server session on mount and sync with local cookie cart
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const { data: serverCart } = await api.get('/cart');
                
                // Get the local cookie cart
                const cookieCartStr = getCookie('cart_items');
                const localCart = cookieCartStr ? JSON.parse(cookieCartStr) : [];
                
                if (localCart.length > 0) {
                    // Check if server is missing any items from local, or has lower quantity
                    const itemsToSync = [];
                    localCart.forEach((localItem) => {
                        const serverItem = (serverCart || []).find((item) => item._id === localItem._id);
                        if (!serverItem) {
                            itemsToSync.push(localItem);
                        } else if (serverItem.qty < localItem.qty) {
                            // Need to add the difference to the server
                            itemsToSync.push({
                                ...localItem,
                                qty: localItem.qty - serverItem.qty
                            });
                        }
                    });

                    if (itemsToSync.length > 0) {
                        // Sync missing items to the server
                        for (const item of itemsToSync) {
                            queueRef.current = queueRef.current.then(async () => {
                                try {
                                    await api.post('/cart', {
                                        _id: item._id,
                                        name: item.name,
                                        partNumber: item.partNumber,
                                        price: item.price,
                                        image: item.image,
                                        qty: item.qty,
                                    });
                                } catch (err) {
                                    console.error('Failed to sync item to server cart:', err);
                                }
                            });
                        }
                        // After queuing all additions, let's update the cartItems state by merging
                        await queueRef.current;
                        const { data: updatedServerCart } = await api.get('/cart');
                        setCartItems(updatedServerCart || localCart);
                    } else {
                        // Server is fully up to date or has even more items. Let's merge them!
                        const merged = [...localCart];
                        (serverCart || []).forEach((serverItem) => {
                            const existingIndex = merged.findIndex((item) => item._id === serverItem._id);
                            if (existingIndex > -1) {
                                merged[existingIndex].qty = Math.max(merged[existingIndex].qty, serverItem.qty);
                            } else {
                                merged.push(serverItem);
                            }
                        });
                        setCartItems(merged);
                    }
                } else {
                    // Local cart is empty, so just use server cart
                    setCartItems(serverCart || []);
                }
            } catch (error) {
                console.error('Failed to load cart from session:', error);
                // Fallback to local cookie cart if server is down/error
                const cookieCartStr = getCookie('cart_items');
                if (cookieCartStr) {
                    try {
                        setCartItems(JSON.parse(cookieCartStr));
                    } catch (e) {
                        console.error('Failed to parse local cart fallback:', e);
                    }
                }
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
