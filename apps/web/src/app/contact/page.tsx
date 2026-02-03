import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, ShieldCheck, Globe } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: "Contact Us | Tingle Talk - #1 Anonymous Dating & Private Chatting Site",
    description: "Got questions or feedback about our anonymous dating site? Reach out to the Tingle Talk team. We're here to help you have the best private chatting experience.",
};

export default function ContactPage() {
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
                        <h1 className="text-4xl md:text-5xl font-black mb-8 gradient-text">Contact Tingle Talk</h1>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold text-white">Get in Touch</h2>
                                    <p className="text-slate-300">
                                        Have a suggestion, reported an issue, or just want to say hello?
                                        Our team is always ready to listen. We strive to reply to all inquiries within 24-48 hours.
                                    </p>
                                </section>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Email Us</p>
                                            <a href="mailto:support@tingletalk.com" className="text-lg text-white hover:text-pink-500 transition-colors">
                                                support@tingletalk.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Location</p>
                                            <p className="text-lg text-white">Global Platform / Distributed Team</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <ShieldCheck className="text-green-500" size={20} /> Safety First
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        For urgent safety concerns or to report a major violation, please use "URGENT" in your email subject line.
                                    </p>
                                </div>
                            </div>

                            <form className="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/10">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1">Message</label>
                                    <textarea
                                        rows={4}
                                        placeholder="How can we help?"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors resize-none"
                                    ></textarea>
                                </div>
                                <button
                                    type="button"
                                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all transform active:scale-[0.98] shadow-lg shadow-pink-500/20"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
