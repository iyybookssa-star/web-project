import React from 'react';
import { useParams } from 'react-router-dom';

export default function PolicyPage() {
    const { type } = useParams();

    const policies = {
        return: {
            title: "Return Policy",
            content: "We accept returns within 7 days of your purchase. Items must be in their original condition, uninstalled, and with all original packaging. To initiate a return, please contact our support team. Refunds will be processed to the original payment method within 5-7 business days after we receive the returned item."
        },
        privacy: {
            title: "Privacy Policy",
            content: "Your privacy is important to us. We collect information necessary to process your orders and improve your shopping experience. We do not sell your personal data to third parties. For more details, please review our full privacy documentation."
        },
        terms: {
            title: "Terms of Service",
            content: "By using Partify Pro, you agree to our terms of service. All parts and services are provided 'as is'. We are not liable for any indirect damages arising from the use of our products. Please verify compatibility before installation."
        }
    };

    const policy = policies[type] || { title: "Policy Not Found", content: "The policy you are looking for does not exist." };

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="bg-surface-dark rounded-2xl p-8 md:p-12 border border-border-dark shadow-sm">
                <h1 className="text-3xl font-bold text-white mb-8 uppercase tracking-tight">{policy.title}</h1>
                <div className="prose prose-invert max-w-none text-slate-300">
                    <p className="leading-relaxed text-lg">{policy.content}</p>
                </div>
            </div>
        </div>
    );
}
