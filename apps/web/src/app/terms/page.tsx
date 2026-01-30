import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: "Terms of Service | Tingle Talk",
    description: "Read the terms and conditions for using Tingle Talk. By using our platform, you agree to these rules.",
};

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Home</span>
                    </Link>

                    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem]">
                        <h1 className="text-4xl md:text-5xl font-black mb-8 gradient-text">Terms of Service</h1>

                        <div className="prose prose-invert prose-pink max-w-none space-y-6 text-slate-300">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using Tingle Talk, you agree to be bound by these Terms of Service.
                                    If you do not agree, please do not use the service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
                                <p>
                                    You must be at least 18 years of age to use Tingle Talk.
                                    Our platform is intended for adults only. Misrepresenting your age is a violation of our terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">3. Prohibited Content</h2>
                                <div className="space-y-4">
                                    <div className="text-slate-300">Users are prohibited from sending:</div>
                                    <ul className="list-disc ml-6 space-y-1 text-slate-300">
                                        <li>Harassing, abusive, or threatening messages.</li>
                                        <li>Pornographic or sexually explicit content.</li>
                                        <li>Spam, advertisements, or malicious links.</li>
                                        <li>Personal data of others without consent.</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">4. Disclaimers</h2>
                                <p>
                                    Tingle Talk is provided "as is" without any warranties.
                                    We are not responsible for the behavior of users or any interactions that occur through the platform.
                                    Use the service at your own risk.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">5. Account Termination</h2>
                                <p>
                                    We reserve the right to block or ban users who violate our community guidelines or these terms,
                                    without prior notice.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
