import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: "Privacy Policy | Tingle Talk",
    description: "Learn how Tingle Talk protects your privacy and handles your data. Your anonymity is our top priority.",
};

export default function PrivacyPage() {
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
                        <h1 className="text-4xl md:text-5xl font-black mb-8 gradient-text">Privacy Policy</h1>

                        <div className="prose prose-invert prose-pink max-w-none space-y-6 text-slate-300">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection</h2>
                                <p>
                                    Tingle Talk is designed to be anonymous. We do not require registration or social media login.
                                    We collect minimal information such as your temporary nickname, age range, and general location (country/state)
                                    to facilitate matching.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">2. Message Privacy</h2>
                                <p>
                                    Your messages are delivered in real-time. We do not store chat logs on our servers once a session is ended.
                                    Always be cautious and never share personal information with strangers.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">3. Cookies & Tracking</h2>
                                <p>
                                    We use local storage and essential cookies to maintain your session and preferences.
                                    These are necessary for the core functionality of the site.
                                </p>
                                <p className="mt-4">
                                    <strong>Google AdSense & DoubleClick Cookie:</strong>
                                    Google, as a third-party vendor, uses cookies to serve ads on our site.
                                    Google's use of the DoubleClick cookie enables it and its partners to serve ads to our users
                                    based on their visit to our site or other sites on the Internet.
                                    You may opt out of the use of the DoubleClick cookie for interest-based advertising by visiting
                                    <a href="https://adssettings.google.com" target="_blank" className="text-pink-500 hover:underline px-1">Google Ads Settings</a>.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">4. Third Parties & Advertising</h2>
                                <p>
                                    Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.
                                </p>
                                <p className="mt-2">
                                    We use third-party analytics (like Google Analytics) to improve our service.
                                    These partners may collect information about your use of the site to provide us with reports
                                    and help us understand user behavior.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">5. Contact</h2>
                                <p>
                                    For any privacy-related concerns, please contact our team via the support channels listed on our platform.
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
