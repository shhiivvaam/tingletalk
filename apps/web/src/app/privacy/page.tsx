import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Privacy Policy | Tingle Talk",
    description: "Learn how Tingle Talk protects your privacy and handles your data. Your anonymity is our top priority.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-32 pb-16 px-4">
            <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-[2.5rem]">
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
                            We may use third-party analytics (like Google Analytics) to improve our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Third Parties</h2>
                        <p>
                            We show advertisements from third-party networks (like Google AdSense).
                            These partners may use cookies to show personalized ads based on your interests.
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
        </main>
    );
}
