'use client';

import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-950/50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500/20 to-violet-600/20 flex items-center justify-center mb-4 border border-white/5"
            >
                <MessageSquare size={48} className="text-slate-400" />
            </motion.div>

            <div className="space-y-2 max-w-md">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Welcome to the Lobby
                </h1>
                <p className="text-slate-400 leading-relaxed">
                    Select a user from the sidebar to start a private encrypted conversation.
                    <br />
                    <span className="text-sm text-slate-500">
                        (Or wait for someone to message you!)
                    </span>
                </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm">
                <Sparkles size={14} />
                <span>100% Anonymous & Encrypted</span>
            </div>
        </div>
    );
}
