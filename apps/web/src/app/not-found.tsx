'use client';

import { motion } from 'framer-motion';
import { WifiOff, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full" />
                    <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <WifiOff className="w-16 h-16 text-pink-500" strokeWidth={1.5} />
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center space-y-4 max-w-md"
                >
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        Lost Signal
                    </h1>
                    <p className="text-slate-400 font-light text-lg">
                        The frequency you are looking for has been jammed or does not exist in this sector.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12"
                >
                    <Link
                        href="/"
                        className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white font-bold tracking-wide shadow-lg hover:shadow-pink-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        <Home size={20} />
                        <span>Return to Base</span>
                    </Link>
                </motion.div>

                <div className="absolute bottom-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
                    Error Code: 404 • Transmission Terminated
                </div>
            </div>
        </div>
    );
}
