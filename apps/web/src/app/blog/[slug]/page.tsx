import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Shield, AlertTriangle, Lock } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const title = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
        title: `${title} | Tingle Talk Blog`,
    };
}

export default function BlogPost({ params }: Props) {
    // In a real app, we'd fetch the post by slug. Here we'll show a comprehensive article for "safe-anonymous-chatting"
    const isSafeChatting = params.slug === 'safe-anonymous-chatting';

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Blog</span>
                    </Link>

                    <article className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/5">
                        <header className="mb-12 space-y-8">
                            <div className="aspect-[21/9] relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                                <Image
                                    src={isSafeChatting ? "/assets/blog-safety.png" : "/assets/blog-trends.png"}
                                    alt="Blog Header"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                                    <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        {isSafeChatting ? "Safety & Privacy" : "Insights"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                    {isSafeChatting ? "The Ultimate Guide to Safe Anonymous Chatting" : params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-slate-400 border-y border-white/5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-bold text-[10px]">TT</div>
                                        <span className="text-sm font-medium">Tingle Team</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-500" />
                                        <span className="text-sm">Feb 1, 2026</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-slate-500" />
                                        <span className="text-sm">5 min read</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="prose prose-invert prose-pink max-w-none space-y-8 text-slate-300 text-lg leading-relaxed">
                            <p>
                                In an increasingly connected digital world, the allure of meeting new people through anonymous chat platforms has never been higher.
                                Whether you're looking for a casual conversation, a deep intellectual debate, or a potential romantic connection,
                                platforms like Tingle Talk provide a unique space for spontaneity. However, anonymity comes with responsibility.
                            </p>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Lock className="text-pink-500" /> 1. Never Share Personal Information
                                </h2>
                                <p>
                                    The most fundamental rule of anonymous chatting is to keep your personal details private.
                                    This includes your full name, home address, phone number, and social media handles.
                                    Wait until you have built a significant level of trust before moving the conversation to a more personal platform.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Shield className="text-indigo-500" /> 2. Use a Unique Nickname
                                </h2>
                                <p>
                                    Avoid using nicknames that you use on other social media accounts.
                                    A unique handle for your anonymous sessions ensures that no one can "reverse search" your identity.
                                    Tingle Talk encourages creators to be creative with their aliases!
                                </p>
                            </section>

                            <section className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <AlertTriangle className="text-red-500" /> 3. Be Wary of Links and Files
                                </h2>
                                <p>
                                    Malicious actors often use anonymous platforms to distribute phishing links or malware.
                                    Never click on suspicious URLs or download files from someone you've just met.
                                    Our platform filters many of these, but your own vigilance is the best defense.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">4. Trust Your Instincts</h2>
                                <p>
                                    If a conversation makes you feel uncomfortable, pressured, or unsafe, end it immediately.
                                    You don't owe anyone an explanation. Use the block and report features to help us keep the community safe for everyone.
                                </p>
                            </section>

                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 mt-12">
                                <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
                                <p>
                                    Anonymous chatting is a fun and exciting way to expand your social circle.
                                    By following these simple safety guidelines, you can enjoy all the benefits of Tingle Talk
                                    while maintaining complete control over your privacy and security.
                                    Stay safe, and happy chatting!
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}
