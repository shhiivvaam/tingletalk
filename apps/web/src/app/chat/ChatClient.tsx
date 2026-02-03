'use client';

import { Sparkles, Zap, Ghost, MessageSquare, Shield, Smartphone, Heart, User, CheckCircle2 } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import ChatWindow from '@/components/chat/ChatWindow';
import { useSocket } from './layout'; // Import from layout where context is defined
import { motion } from 'framer-motion';

export default function ChatClient() {
    const { selectedUser } = useChatStore();
    const { username } = useUserStore();
    const socket = useSocket();

    if (selectedUser) {
        return <ChatWindow socket={socket} currentUserId={socket?.id || ''} />;
    }

    const benefits = [
        { icon: <Heart size={16} className="text-pink-400" />, text: "TingleTalk is FREE & will always stay free! :)" },
        { icon: <Smartphone size={16} className="text-blue-400" />, text: "Mobile friendly! Chat seamlessly on your smartphone." },
        { icon: <User size={16} className="text-violet-400" />, text: "Anonymous matching—no sign up needed to start." },
        { icon: <MessageSquare size={16} className="text-emerald-400" />, text: "Select a stranger from the list & say Hi!" },
        { icon: <Sparkles size={16} className="text-amber-400" />, text: "Enjoy your time and make new friends!" }
    ];

    return (
        <div className="flex flex-col items-center justify-start md:justify-center h-full p-4 md:p-6 text-center relative overflow-y-auto custom-scrollbar bg-slate-950/20">

            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none" />

            <div className="relative z-10 max-w-2xl w-full">

                {/* Welcome Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-6 md:mb-8 pt-6 md:pt-0"
                >
                    <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-400">@{username}</span>
                    </h1>
                    <p className="mt-2 text-slate-400 text-sm md:text-xl font-medium">
                        TingleTalk is the best place to find new people!
                    </p>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden text-left"
                >
                    {/* Decorative Gradient Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="space-y-6 relative z-10">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                className="flex items-start gap-4"
                            >
                                <div className="mt-1 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                    {benefit.icon}
                                </div>
                                <p className="text-slate-200 text-xs md:text-base font-medium leading-relaxed">
                                    {benefit.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            System Ready
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                            Select a user from the sidebar to begin
                        </div>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 flex flex-col items-center gap-2"
                >
                    <div className="px-4 py-1.5 rounded-full bg-slate-900/50 border border-white/5 flex items-center gap-2">
                        <Shield size={12} className="text-pink-500" />
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                            End-to-End Encrypted Session
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                        NOTE: You will be automatically disconnected after a long time of inactivity
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

function Badge({ icon, text, color }: { icon: any, text: string, color: string }) {
    return (
        <span className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${color}`}>
            {icon}
            {text}
        </span>
    );
}
