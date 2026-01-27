'use client';

import { motion } from 'framer-motion';
import { AlertOctagon, RotateCw } from 'lucide-react';
import { useEffect } from 'react';

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md">
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

                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:scale-105 transition-all active:scale-95 font-bold uppercase tracking-wider text-sm"
                >
                    <RotateCw size={16} />
                    <span>Reboot System</span>
                </button>
            </div>
        </div>
    );
}
