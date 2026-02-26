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
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-base">language</span>
                            </a>
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-base">chat</span>
                            </a>
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-base">forum</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Quick Links</h5>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Find a Store</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Gift Cards</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Affiliate Program</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Support</h5>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Legal</h5>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-border-dark flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">© 2024 Partify Pro. Built for Speed.</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="px-3 py-1 border border-slate-300 dark:border-border-dark rounded">PayPal</span>
                        <span className="px-3 py-1 border border-slate-300 dark:border-border-dark rounded">Visa</span>
                        <span className="px-3 py-1 border border-slate-300 dark:border-border-dark rounded">Mastercard</span>
                    </div>
                </div>

            </div>
        </footer>
    );
}
