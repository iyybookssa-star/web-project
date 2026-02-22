import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const GaragePage = lazy(() => import('./pages/GaragePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
);

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <HashRouter>
                    <div className="flex flex-col min-h-screen bg-background-dark text-white">
                        <Navbar />
                        <CartSidebar />
                        <main className="flex-grow">
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/products" element={<ProductsPage />} />
                                    <Route path="/products/:id" element={<ProductDetailPage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/checkout" element={<CheckoutPage />} />
                                    <Route path="/garage" element={<GaragePage />} />
                                    <Route path="/admin" element={<AdminPage />} />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                    </div>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: { background: '#1e1e1e', color: '#fff', border: '1px solid #333' },
                        }}
                    />
                </HashRouter>
            </CartProvider>
        </AuthProvider>
    );
}
