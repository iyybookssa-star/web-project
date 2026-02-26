import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [search, setSearch] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products?search=${search.trim()}`);
            setMobileOpen(false);
        }
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '';

    return (
        <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-8">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined block">tire_repair</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Partify <span className="text-primary">Pro</span>
                        </h1>
                    </Link>

                    {/* Main Nav — visible on md+ (tablet & desktop) */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
                        <Link to="/garage" className="hover:text-primary transition-colors">My Garage</Link>
                        <a href="#" className="hover:text-primary transition-colors">Deals</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                        {user?.isAdmin && (
                            <Link to="/admin" className="flex items-center gap-1.5 text-primary font-bold hover:text-blue-400 transition-colors">
                                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Search Bar — visible on md+ */}
                    <div className="flex-1 max-w-md hidden md:block">
                        <form onSubmit={handleSearch} className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">
                                search
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-surface-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 placeholder-slate-500"
                                placeholder="Search by part name, number, or VIN..."
                            />
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <button
                                    onClick={() => {
                                        logout();
                                        toast.success('Signed out successfully');
                                        navigate('/');
                                    }}
                                    className="hidden md:block text-sm text-slate-500 hover:text-primary transition-colors"
                                >
                                    Sign Out
                                </button>
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <span className="text-xs font-bold text-primary uppercase">{initials}</span>
                                </div>
                            </>
                        ) : (
                            <Link to="/login">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-full transition-colors">
                                    <span className="material-symbols-outlined">person</span>
                                </button>
                            </Link>
                        )}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-full transition-colors relative"
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Hamburger — visible only on mobile */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {mobileOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Mobile Menu Drawer ── */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark">
                    <div className="px-4 py-4 space-y-4">

                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">
                                search
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-surface-dark border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 placeholder-slate-500"
                                placeholder="Search parts..."
                            />
                        </form>

                        {/* Mobile Nav Links */}
                        <nav className="flex flex-col gap-1">
                            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-primary text-[20px]">home</span>
                                Home
                            </Link>
                            <Link to="/products" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                                Shop
                            </Link>
                            <Link to="/garage" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-primary text-[20px]">garage_home</span>
                                My Garage
                            </Link>
                            <a href="#" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-primary text-[20px]">local_offer</span>
                                Deals
                            </a>
                            <a href="#" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
                                Support
                            </a>
                            {user?.isAdmin && (
                                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-sm font-medium text-primary">
                                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                                    Admin
                                </Link>
                            )}
                        </nav>

                        {/* Mobile Sign Out */}
                        {user && (
                            <button
                                onClick={() => {
                                    logout();
                                    toast.success('Signed out successfully');
                                    navigate('/');
                                    setMobileOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-medium text-red-400"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
