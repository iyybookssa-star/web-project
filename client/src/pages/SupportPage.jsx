export default function SupportPage() {
    return (
        <div className="min-h-[80vh] flex flex-col">

            {/* Hero Banner */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background-dark to-background-dark" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: '320px' }}>support_agent</span>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <span className="material-symbols-outlined text-primary text-5xl">support_agent</span>
                    <h1 className="text-4xl md:text-5xl font-black text-white">
                        Get in <span className="text-primary italic">Touch</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                        Our support team is here to help you with anything you need — from order questions to product compatibility.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="flex-grow py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Email Card */}
                        <a
                            href="mailto:support@partifypro.com"
                            className="group relative flex flex-col items-center gap-5 p-10 rounded-2xl bg-surface-dark/60 border border-border-dark hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white">Email Us</h3>
                                <p className="text-slate-400 text-sm">We typically respond within 24 hours</p>
                                <p className="text-primary font-semibold text-lg">support@partifypro.com</p>
                            </div>
                            <span className="absolute top-4 right-4 material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors text-sm">
                                open_in_new
                            </span>
                        </a>

                        {/* Phone Card */}
                        <a
                            href="tel:+966500000000"
                            className="group relative flex flex-col items-center gap-5 p-10 rounded-2xl bg-surface-dark/60 border border-border-dark hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                <span className="material-symbols-outlined text-primary text-3xl">phone</span>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white">Call Us</h3>
                                <p className="text-slate-400 text-sm">Available Sun – Thu, 9 AM – 6 PM</p>
                                <p className="text-primary font-semibold text-lg">+966 50 000 0000</p>
                            </div>
                            <span className="absolute top-4 right-4 material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors text-sm">
                                call
                            </span>
                        </a>

                    </div>

                    {/* Additional Info */}
                    <div className="mt-16 text-center p-8 rounded-2xl bg-surface-dark/30 border border-border-dark">
                        <span className="material-symbols-outlined text-primary text-3xl mb-3 block">schedule</span>
                        <h4 className="text-lg font-bold text-white mb-2">Business Hours</h4>
                        <p className="text-slate-400 text-sm">
                            Sunday – Thursday: 9:00 AM – 6:00 PM (AST)
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                            Emails received outside business hours will be answered the next working day.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
}
