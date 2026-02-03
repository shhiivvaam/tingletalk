import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="w-full py-12 px-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/assets/logo.png"
                            alt="Tingle Talk"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-xl font-bold text-white tracking-tight">
                            Tingle<span className="text-pink-500">Talk</span>
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                        Connect anonymously with people around the world. Safe, fast, and 100% private.
                    </p>
                </div>

                <nav className="flex flex-wrap justify-center gap-8">
                    <div className="flex flex-col gap-3">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
                        <Link href="/" className="text-slate-400 hover:text-pink-400 text-sm transition-colors">Home</Link>
                        <Link href="/chat" className="text-slate-400 hover:text-pink-400 text-sm transition-colors">Chat Lobby</Link>
                        <Link href="/blog" className="text-slate-400 hover:text-pink-400 text-sm transition-colors">Blog</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Company</h4>
                        <Link href="/about" className="text-slate-400 hover:text-pink-400 text-sm transition-colors">About Us</Link>
                        <Link href="/contact" className="text-slate-400 hover:text-pink-400 text-sm transition-colors">Contact Us</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Legal</h4>
                        <Link href="/privacy" className="text-slate-400 hover:text-pink-400 text-sm transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-slate-400 hover:text-pink-400 text-sm transition-colors">Terms & Conditions</Link>
                    </div>
                </nav>

                <div className="text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Tingle Talk. 18+ Only.
                </div>
            </div>
        </footer>
    );
}
