'use client';

import { motion } from 'framer-motion';
import { Flame, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export default function AnimatedHero() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-8 justify-center lg:justify-start mb-6">
                <Image
                    src="/assets/logo.png"
                    alt="Tingle Talk Logo - Best Anonymous Chat Platform"
                    width={128}
                    height={128}
                    priority
                    className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-sm font-semibold backdrop-blur-md">
                    <Flame size={16} className="text-pink-500 animate-pulse" />
                    <span>#1 Anonymous Dating App</span>
                </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                Tingle<span className="gradient-text">Talk</span>
            </h1>

            <p className="text-xl text-slate-400 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Skip the signup. Skip the profile. Just pure, anonymous connection. Find your match, share a secret, or just have fun on the most secure anonymous chatting platform.
            </p>

            <div className="flex justify-center lg:justify-start pt-4">
                <a
                    href="#how-it-works"
                    className="flex items-center gap-2 text-slate-500 hover:text-pink-400 font-semibold tracking-wide transition-all group"
                >
                    <span>How it works</span>
                    <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                </a>
            </div>
        </motion.div>
    );
}
