import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState([]);

    // Load favorites on mount / login
    useEffect(() => {
        if (user) {
            api.get('/favorites')
                .then(({ data }) => {
                    setFavoriteIds(data.map((p) => p._id));
                })
                .catch(console.error);
        } else {
            // Guest: read from localStorage
            try {
                const stored = JSON.parse(localStorage.getItem('partify_favorites') || '[]');
                setFavoriteIds(stored);
            } catch {
                setFavoriteIds([]);
            }
        }
    }, [user]);

    const isFavorite = useCallback(
        (productId) => favoriteIds.includes(productId),
        [favoriteIds]
    );

    const toggleFavorite = useCallback(
        async (productId, productName) => {
            if (user) {
                try {
                    const { data } = await api.post(`/favorites/${productId}`);
                    setFavoriteIds(data.favorites);
                    toast(data.isFavorite ? `${productName || 'Item'} added to loved ❤️` : `${productName || 'Item'} removed`, {
                        icon: data.isFavorite ? '❤️' : '💔',
                    });
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to update favorites');
                }
            } else {
                // Guest: toggle in localStorage
                setFavoriteIds((prev) => {
                    const exists = prev.includes(productId);
                    const next = exists
                        ? prev.filter((id) => id !== productId)
                        : [...prev, productId];
                    localStorage.setItem('partify_favorites', JSON.stringify(next));
                    toast(exists ? `${productName || 'Item'} removed` : `${productName || 'Item'} added to loved ❤️`, {
                        icon: exists ? '💔' : '❤️',
                    });
                    return next;
                });
            }
        },
        [user]
    );

    const favoritesCount = favoriteIds.length;

    return (
        <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, favoritesCount }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
