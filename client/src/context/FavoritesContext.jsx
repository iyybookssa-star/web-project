import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState([]);

    // Fetch favorites when user logs in
    useEffect(() => {
        if (user?.token) {
            api.get('/favorites')
                .then(({ data }) => {
                    setFavoriteIds(data.map((p) => p._id));
                })
                .catch(() => setFavoriteIds([]));
        } else {
            setFavoriteIds([]);
        }
    }, [user]);

    const isFavorite = useCallback(
        (productId) => favoriteIds.includes(productId),
        [favoriteIds]
    );

    const toggleFavorite = useCallback(
        async (productId) => {
            if (!user?.token) {
                toast.error('Please login to save favorites');
                return;
            }
            try {
                const { data } = await api.post(`/favorites/${productId}`);
                setFavoriteIds(data.favorites);
                toast.success(data.isFavorite ? 'Added to garage!' : 'Removed from garage');
            } catch (error) {
                toast.error('Failed to update favorites');
            }
        },
        [user]
    );

    return (
        <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
