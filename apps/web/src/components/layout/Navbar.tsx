'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageCircle, Info, Mail, BookOpen } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Don't show navbar in the chat interface
    if (pathname?.startsWith('/chat')) {
        return null;
    }

    const navLinks = [
        { name: 'Home', href: '/', icon: <MessageCircle size={18} /> },
        { name: 'Blog', href: '/blog', icon: <BookOpen size={18} /> },
        { name: 'About', href: '/about', icon: <Info size={18} /> },
        { name: 'Contact', href: '/contact', icon: <Mail size={18} /> },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-slate-950/40 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]' : 'py-6 bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                        <Image
                            src="/assets/logo.png"
                            alt="Tingle Talk - #1 Anonymous Dating Site & Private Chatting Platform"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                        />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter">
                        Tingle<span className="text-pink-500">Talk</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-2 font-medium"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="ml-4 h-6 w-px bg-white/10" />
                    <Link
                        href="/#start"
                        className="ml-4 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20"
                    >
                        Start Chatting
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-4 right-4 mt-2 p-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                            >
                                <span className="p-2 bg-white/5 rounded-lg text-pink-500">{link.icon}</span>
                                <span className="font-bold">{link.name}</span>
                            </Link>
                        ))}
                        <div className="h-px bg-white/5 my-2" />
                        <Link
                            href="/#start"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-bold rounded-2xl text-center shadow-lg"
                        >
                            Start Chatting
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
