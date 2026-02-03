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
    const postKeywords = params.slug.replace(/-/g, ', ');
    const isSafeChatting = params.slug === 'safe-anonymous-chatting';
    const imageUrl = isSafeChatting ? "/assets/blog-safety.png" : "/assets/blog-trends.png";

    return {
        title: `${title} | Tingle Talk Blog - Anonymous Dating & Private Chatting`,
        description: `Read our guide about ${title} on Tingle Talk, the #1 anonymous dating site and private chatting platform. Discover tips for safe and fun anonymous connections.`,
        keywords: [postKeywords, "anonymous dating", "private chatting", "tingletalk", "dating tips", "online safety"],
        openGraph: {
            title: `${title} | Tingle Talk Blog`,
            description: `Read our guide about ${title} on Tingle Talk.`,
            images: [imageUrl],
            type: 'article',
        }
    };
}

const POST_CONTENT: Record<string, {
    title: string;
    category: string;
    date: string;
    image: string;
    content: React.ReactNode;
}> = {
    'safe-anonymous-chatting': {
        title: "The Ultimate Guide to Safe Anonymous Dating & Private Chatting",
        category: "Safety & Privacy",
        date: "Feb 1, 2026",
        image: "/assets/blog-safety.png",
        content: (
            <>
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
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 mt-12">
                    <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
                    <p>
                        Anonymous chatting is a fun and exciting way to expand your social circle.
                        By following these simple safety guidelines, you can enjoy all the benefits of Tingle Talk
                        while maintaining complete control over your privacy and security.
                    </p>
                </div>
            </>
        )
    },
    'break-the-ice-online': {
        title: "20 Best Icebreakers for Anonymous Dating & Chatting",
        category: "Dating Tips",
        date: "Jan 28, 2026",
        image: "/assets/blog-icebreaker.png",
        content: (
            <>
                <p>
                    Starting a conversation on a <strong>private chatting site</strong> can be nerve-wracking.
                    The "Hi" and "Hello" often lead to dead ends. To find success on our <strong>anonymous dating site</strong>,
                    you need some creative icebreakers to spark interest immediately.
                </p>
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. The "Would You Rather" Classic</h2>
                    <p>
                        "Would you rather always have to sing instead of speaking or dance everywhere you go?"
                        This is a low-pressure way to learn about someone's personality while keeping the mood light.
                    </p>
                </section>
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. The Travel Adventure</h2>
                    <p>
                        "If you could teleport anywhere in the world for just 10 minutes, where would you go?"
                        This opens up a conversation about dreams, memories, and favorite places.
                    </p>
                </section>
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. The Foodie Fact</h2>
                    <p>
                        "What's one dish you could eat every single day for the rest of your life?"
                        Everyone loves food, making this one of the most reliable icebreakers for any <strong>anonymous chat</strong>.
                    </p>
                </section>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 mt-12">
                    <h3 className="text-xl font-bold text-white mb-4">Tip</h3>
                    <p>
                        The best icebreakers are open-ended. Avoid questions that can be answered with a simple "yes" or "no."
                        On Tingle Talk, being yourself is the ultimate icebreaker!
                    </p>
                </div>
            </>
        )
    },
    'anonymous-dating-trends-2026': {
        title: "Why Tingle Talk is the Best Anonymous Dating Site in 2026",
        category: "Insights",
        date: "Jan 15, 2026",
        image: "/assets/blog-trends.png",
        content: (
            <>
                <p>
                    The digital dating landscape has shifted. Users are tired of endless swiping, superficial profiles,
                    and the privacy concerns of big-tech apps. In 2026, <strong>anonymous dating sites</strong> are the new trend.
                    Here is why Tingle Talk is leading the way.
                </p>
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Authenticity Through Anonymity</h2>
                    <p>
                        When you don't have to maintain a perfect profile, you're free to show your true personality.
                        This paradox—being more real while being anonymous—is why Tingle Talk connections often feel deeper.
                    </p>
                </section>
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. Zero Barrier to Entry</h2>
                    <p>
                        No sign-ups, no email verification, and no waitlists. You can go from visiting our site
                        to having a meaningful <strong>private chat</strong> in under 10 seconds.
                    </p>
                </section>
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Privacy-First Philosophy</h2>
                    <p>
                        In an age of data leaks, our "No Storage" policy is a breath of fresh air.
                        Your conversations exist only in the moment, making us the most trusted <strong>private chatting platform</strong>.
                    </p>
                </section>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 mt-12">
                    <h3 className="text-xl font-bold text-white mb-4">Conclusion</h3>
                    <p>
                        The future of connection is spontaneous, safe, and anonymous. Tingle Talk is proud to be
                        at the forefront of this revolution. Join us and experience the magic of meeting strangers!
                    </p>
                </div>
            </>
        )
    }
};

export default function BlogPost({ params }: Props) {
    const post = POST_CONTENT[params.slug] || POST_CONTENT['safe-anonymous-chatting'];

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
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                                    <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                    {post.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-slate-400 border-y border-white/5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-bold text-[10px]">TT</div>
                                        <span className="text-sm font-medium">Tingle Team</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-500" />
                                        <span className="text-sm">{post.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-slate-500" />
                                        <span className="text-sm">5 min read</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="prose prose-invert prose-pink max-w-none space-y-8 text-slate-300 text-lg leading-relaxed">
                            {post.content}
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}
