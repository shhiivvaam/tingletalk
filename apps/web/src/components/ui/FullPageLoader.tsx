'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MessageSquare, Shield, Sparkles } from 'lucide-react';

const LOADING_MESSAGES = [
    "Establishing secure connection...",
    "Encrypting your anonymity...",
    "Waking up the local gossip...",
    "Preparing your secret identity...",
    "Finding matches across the globe...",
    "Polishing the chat bubbles...",
    "Tuning the frequencies..."
];

interface FullPageLoaderProps {
    message?: string;
    showMessages?: boolean;
}

export default function FullPageLoader({ message, showMessages = true }: FullPageLoaderProps) {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (!showMessages) return;
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [showMessages]);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden font-sans">
            {/* Background Aesthetic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo / Icon Hexagon Wrapper */}
                <div className="relative mb-12">
                    {/* Animated Rotating Rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-8 border border-white/5 rounded-[3rem] opacity-20"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-12 border border-white/5 rounded-[4rem] opacity-10"
                    />

                    {/* Central Pulsing Container */}
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                                "0 0 0px 0px rgba(236,72,153,0)",
                                "0 0 40px 10px rgba(236,72,153,0.1)",
                                "0 0 0px 0px rgba(236,72,153,0)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex items-center justify-center relative shadow-2xl backdrop-blur-xl"
                    >
                        <img
                            src="/assets/logo.png"
                            alt="TingleTalk"
                            className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                        />

                        {/* Floating Micro Icons */}
                        <motion.div
                            animate={{ y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }}
                            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                            className="absolute -top-4 -right-4 text-pink-500"
                        >
                            <Sparkles size={16} />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 10, 0], opacity: [0.2, 0.6, 0.2] }}
                            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                            className="absolute -bottom-2 -left-4 text-violet-400"
                        >
                            <MessageSquare size={14} />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-4 max-w-xs">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/80 mb-2">TingleTalk Chat</span>
                        <div className="h-6 flex items-center">
                            {showMessages ? (
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={messageIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-slate-300 text-sm font-medium"
                                    >
                                        {LOADING_MESSAGES[messageIndex]}
                                    </motion.p>
                                </AnimatePresence>
                            ) : (
                                <p className="text-slate-300 text-sm font-medium">{message || 'Loading...'}</p>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar (Indeterminate) */}
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
                        <motion.div
                            animate={{
                                x: ["-100%", "100%"]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-pink-500 to-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Version / Technical hint */}
            <div className="absolute bottom-8 text-[9px] font-mono text-slate-700 uppercase tracking-widest">
                Nodes Connected: {3000 + Math.floor(Math.random() * 500)} // System Ready
            </div>
        </div>
    );
}
