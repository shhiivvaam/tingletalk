import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Zap, Heart } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: "About Us | Tingle Talk",
    description: "Learn more about Tingle Talk, the world's leading anonymous dating and random chat platform. Our mission is to connect people safely and instantly.",
};

export default function AboutPage() {
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
                        <h1 className="text-4xl md:text-5xl font-black mb-8 gradient-text">About Tingle Talk</h1>

                        <div className="prose prose-invert prose-pink max-w-none space-y-12 text-slate-300">
                            <section className="space-y-4">
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Users className="text-pink-500" /> Who We Are
                                </h2>
                                <p className="text-lg leading-relaxed">
                                    Tingle Talk is a cutting-edge social platform designed for those who value spontaneity and privacy.
                                    We believe that the most interesting conversations often happen when you're free to be yourself,
                                    without the constraints of a permanent profile or social pressure.
                                </p>
                            </section>

                            <section className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Shield className="text-indigo-500" /> Our Mission
                                    </h2>
                                    <p>
                                        To provide a safe, anonymous, and instant way for people worldwide to connect,
                                        share stories, and find meaningful interactions without the anxiety of traditional dating apps.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Zap className="text-yellow-500" /> Why It Exists
                                    </h2>
                                    <p>
                                        In an era of over-exposure, Tingle Talk offers a breath of fresh air.
                                        No sign-ups, no tracking, just pure human connection focused on the present moment.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Heart className="text-red-500" /> Our Values
                                </h2>
                                <ul className="list-none space-y-4">
                                    <li className="flex gap-4">
                                        <span className="text-pink-500 font-bold">01.</span>
                                        <div>
                                            <strong className="text-white block">Privacy First</strong>
                                            We don't store your data or chat history. Once you leave, it's gone.
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-pink-500 font-bold">02.</span>
                                        <div>
                                            <strong className="text-white block">Safety & Respect</strong>
                                            We employ advanced moderation to keep the community friendly and safe.
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-pink-500 font-bold">03.</span>
                                        <div>
                                            <strong className="text-white block">Global Connection</strong>
                                            Breaking boundaries by connecting people across different cultures and backgrounds.
                                        </div>
                                    </li>
                                </ul>
                            </section>

                            <section className="text-center pt-8">
                                <p className="italic text-slate-400">
                                    "Bringing back the magic of meeting strangers in a digital world."
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
