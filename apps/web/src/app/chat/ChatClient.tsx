'use client';

import { Sparkles, Zap, Ghost } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import ChatWindow from '@/components/chat/ChatWindow';
import { useSocket } from './layout'; // Import from layout where context is defined
import { motion } from 'framer-motion';

export default function ChatClient() {
    const { selectedUser } = useChatStore();
    const socket = useSocket();

    if (selectedUser) {
        return <ChatWindow socket={socket} currentUserId={socket?.id || ''} />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />

            <div className="relative z-10 max-w-lg space-y-8">

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-32 h-32 mx-auto rounded-[2rem] bg-gradient-to-br from-pink-500/20 to-violet-600/20 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl"
                >
                    <Ghost size={64} className="text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                </motion.div>

                <div className="space-y-4">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                    >
                        Tingle<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Lobby</span>
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-400 text-lg leading-relaxed"
                    >
                        Select an online user from the sidebar to start a private, encrypted conversation. Or let fate decide.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-3"
                >
                    <Badge icon={<Ghost size={14} />} text="Anonymous" color="bg-pink-500/10 border-pink-500/20 text-pink-300" />
                    <Badge icon={<Zap size={14} />} text="Real-time" color="bg-amber-500/10 border-amber-500/20 text-amber-300" />
                    <Badge icon={<Sparkles size={14} />} text="Zero Trace" color="bg-violet-500/10 border-violet-500/20 text-violet-300" />
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
