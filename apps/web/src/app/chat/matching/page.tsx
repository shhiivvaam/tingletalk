'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Globe, MapPin, Sparkles, UserCheck, Zap, Heart } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import HeartLoader from '@/components/ui/HeartLoader';

export default function MatchingPage() {
    const router = useRouter();
    // Use separate selectors to avoid object reference loop
    const username = useUserStore((state) => state.username);
    const gender = useUserStore((state) => state.gender);
    const preferences = useUserStore((state) => state.preferences);

    const [status, setStatus] = useState<'connecting' | 'searching' | 'matched'>('connecting');
    const [matchDetails, setMatchDetails] = useState<{ roomId: string; partnerId: string } | null>(null);

    useEffect(() => {
        if (!username) {
            router.push('/');
            return;
        }

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
        if (!wsUrl) {
            console.error('NEXT_PUBLIC_WS_URL is not configured');
            router.push('/');
            return;
        }

        const socket = io(wsUrl, {
            transports: ['websocket'],
            autoConnect: true,
            withCredentials: true,
        });

        socket.on('connect', () => {
            setStatus('searching');
            socket.emit('findMatch', {
                username: username,
                gender: gender,
                scope: preferences.location,
                targetGender: preferences.targetGender,
            });
        });

        socket.on('matchFound', (data) => {
            setMatchDetails(data);
            setStatus('matched');
            // Premium transition delay
            setTimeout(() => {
                router.push('/chat/room');
            }, 1500);
        });

        return () => {
            socket.disconnect();
        };
    }, [username, gender, preferences, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 text-pink-500/10">
                <AnimatePresence>
                    {status === 'searching' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            {[1, 2, 3, 4, 5].map((circle) => (
                                <motion.div
                                    key={circle}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: circle * 0.6,
                                        ease: "easeOut"
                                    }}
                                    className="absolute"
                                >
                                    <Heart size={100} fill="currentColor" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative z-10 w-full max-w-sm text-center space-y-12">
                <div className="space-y-4">
                    <motion.div
                        animate={status === 'matched' ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                        className="inline-flex mb-2 relative"
                    >
                        {status === 'matched' ? (
                            <div className="p-6 rounded-full bg-pink-500/10 border-2 border-pink-500/20 text-pink-500">
                                <UserCheck size={48} />
                            </div>
                        ) : (
                            <HeartLoader size={160} />
                        )}
                    </motion.div>

                    <h2 className="text-3xl font-black tracking-tight">
                        {status === 'connecting' && "Securing Connection..."}
                        {status === 'searching' && "Finding Your Match"}
                        {status === 'matched' && "Tingle Found!"}
                    </h2>

                    <p className="text-slate-400 font-light px-4">
                        {status === 'connecting' && "Dialing into the global encrypted matrix..."}
                        {status === 'searching' && "Scanning 1.2M active whispers around the globe..."}
                        {status === 'matched' && "Prepare for the conversation. Connecting to encrypted vault..."}
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 self-end">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live</span>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-2xl font-bold border-pink-500/50">
                                    {username?.[0].toUpperCase()}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">You</span>
                            </div>

                            <motion.div
                                animate={{ x: [-5, 5, -5] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="text-slate-700"
                            >
                                <Zap size={24} fill="currentColor" />
                            </motion.div>

                            <div className="flex flex-col items-center gap-2">
                                <motion.div
                                    animate={status === 'searching' ? { opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className={`w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-2xl font-bold ${status === 'matched' ? 'border-pink-500 border-2' : ''}`}
                                >
                                    {status === 'matched' ? '?' : <Sparkles size={24} className="text-slate-600" />}
                                </motion.div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mystery</span>
                            </div>
                        </div>

                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: status === 'matched' ? "100%" : "60%" }}
                                transition={{ duration: 10, ease: "linear" }}
                                className="h-full bg-gradient-to-r from-pink-500 to-violet-600"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="text-slate-500 text-sm font-medium hover:text-red-400 transition-colors"
                    >
                        Cancel Search
                    </button>
                </div>
            </div>

            {/* Global Scopes */}
            <div className="absolute bottom-12 flex gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${preferences.location === 'global' ? 'bg-pink-500/10 border-pink-500/50 text-white' : 'border-white/10 text-slate-600'}`}>
                    <Globe size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Global Matrix</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${preferences.location === 'local' ? 'bg-pink-500/10 border-pink-500/50 text-white' : 'border-white/10 text-slate-600'}`}>
                    <MapPin size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Local Proximity</span>
                </div>
            </div>
        </div>
    );
}
