'use client';

import { motion } from 'framer-motion';
import { AlertOctagon, RotateCw, Home, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md w-full">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 relative"
                >
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />
                    <div className="relative p-6 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl text-red-500">
                        <AlertOctagon size={64} strokeWidth={1.5} />
                    </div>
                </motion.div>

                <h1 className="text-3xl font-black tracking-tight mb-2">System Glitch Detected</h1>
                <p className="text-slate-400 font-light mb-8">
                    The matrix encountered a critical error. Our automated repair drones have been notified.
                </p>

                <div className="p-4 rounded-lg bg-black/40 border border-red-500/20 font-mono text-xs text-red-400 mb-8 w-full overflow-hidden text-left">
                    <p>Error Code: {error.digest || 'UNKNOWN_ANOMALY'}</p>
                    <p className="truncate mt-1">{error.message}</p>
                </div>

                <div className="flex flex-col w-full gap-4">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white font-bold tracking-wide shadow-lg hover:shadow-red-500/25 transition-all hover:scale-105 active:scale-95 text-sm uppercase"
                    >
                        <RotateCw size={18} />
                        <span>Reboot System</span>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-slate-300"
                        >
                            <Home size={16} />
                            <span>Home</span>
                        </Link>
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-slate-300"
                        >
                            <ArrowLeft size={16} />
                            <span>Go Back</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
