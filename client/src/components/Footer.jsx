import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-background-light dark:bg-background-dark pt-20 pb-10 border-t border-slate-200 dark:border-border-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">

                    {/* Brand */}
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1 rounded-lg text-white">
                                <span className="material-symbols-outlined block text-sm">tire_repair</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight dark:text-white uppercase">Partify Pro</h2>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                            Precision engineering. High-performance delivery. Since 1998, we've been the primary source for automotive enthusiasts and professionals.
                        </p>

                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Quick Links</h5>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home Page</Link></li>
                            <li><Link to="/products" className="hover:text-primary transition-colors">Shop Page</Link></li>
                            <li><Link to="/garage" className="hover:text-primary transition-colors">My Garage</Link></li>
                            <li><Link to="/cart" className="hover:text-primary transition-colors">Cart Page</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Support</h5>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li>
                                <a href="mailto:support@partifypro.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-base">mail</span>
                                    support@partifypro.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+966500000000" className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-base">phone</span>
                                    +966 50 000 0000
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Legal</h5>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><Link to="/policy/return" className="hover:text-primary transition-colors">Return Policy</Link></li>
                            <li><Link to="/policy/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/policy/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-border-dark flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">© 2024 Partify Pro. Built for Speed.</p>

                </div>

            </div>
        </footer>
    );
}
