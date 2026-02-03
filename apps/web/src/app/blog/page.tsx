import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

export const metadata: Metadata = {
    title: "Blog & Articles | Tingle Talk",
    description: "Read the latest tips, guides, and stories about anonymous dating, online safety, and finding connections in the digital age.",
};

const BLOG_POSTS = [
    {
        id: 1,
        title: "The Ultimate Guide to Safe Anonymous Chatting",
        excerpt: "Learn how to protect your identity while making meaningful connections online. Our top tips for staying safe.",
        date: "Feb 1, 2026",
        author: "Tingle Team",
        readTime: "5 min read",
        category: "Safety",
        slug: "safe-anonymous-chatting",
        image: "/assets/blog-safety.png"
    },
    {
        id: 2,
        title: "How to Break the Ice with Strangers Online",
        excerpt: "Struggling to start a conversation? Here are 20 fun and engaging icebreakers that actually work.",
        date: "Jan 28, 2026",
        author: "Alex Rivera",
        readTime: "4 min read",
        category: "Dating Tips",
        slug: "break-the-ice-online",
        image: "/assets/blog-icebreaker.png"
    },
    {
        id: 3,
        title: "Why Anonymous Dating is Trending in 2026",
        excerpt: "The shift away from traditional dating apps and why more people are choosing mystery and spontaneity.",
        date: "Jan 15, 2026",
        author: "Sarah Chen",
        readTime: "7 min read",
        category: "Insights",
        slug: "anonymous-dating-trends-2026",
        image: "/assets/blog-trends.png"
    }
];

export default function BlogPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 pt-32 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Home</span>
                    </Link>

                    <div className="mb-12">
                        <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">Tingle Talk Blog</h1>
                        <p className="text-xl text-slate-400 max-w-2xl">
                            Insights, guides, and stories from the world of anonymous connections.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {BLOG_POSTS.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="glass-panel group cursor-pointer overflow-hidden flex flex-col h-full rounded-[2rem] border border-white/5 hover:border-pink-500/30 transition-all hover:translate-y-[-4px]"
                            >
                                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-60" />
                                    <div className="absolute top-4 left-4 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1 gap-4">
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {post.readTime}
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-pink-500 font-bold text-[10px]">
                                                {post.author.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{post.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-pink-500 text-sm font-bold">
                                            <span>Read More</span>
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-20 p-12 glass-panel rounded-[3rem] text-center border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />
                        <h3 className="text-2xl font-bold text-white mb-4 italic">More articles coming soon...</h3>
                        <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Our team is currently crafting 20+ detailed guides and stories to help you navigate the world of Tingle Talk.
                            Check back daily for new insights!
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
