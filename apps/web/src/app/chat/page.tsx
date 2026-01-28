'use client';

import { MessageCircle } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import ChatWindow from '@/components/chat/ChatWindow';
import { useSocket } from './layout'; // Import from layout where context is defined
import { useUserStore } from '@/store/useUserStore';

export default function ChatPage() {
    const { selectedUser } = useChatStore();
    const socket = useSocket();
    const { username } = useUserStore(); // Assume username is currentUserId for now? No, we need actual ID.
    // Wait, socket.id is the currentUserId usually. 
    // And we can get it from socket directly.

    if (selectedUser) {
        return <ChatWindow socket={socket} currentUserId={socket?.id || ''} />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 p-4 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center animate-pulse">
                <MessageCircle size={48} className="opacity-50" />
            </div>
            <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-bold text-slate-200">Welcome to TingleTalk Lobby</h2>
                <p>
                    Select an online user from the sidebar to start a private chat.
                </p>

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs border border-white/5">Anonymous</span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs border border-white/5">Encrypted</span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs border border-white/5">Real-time</span>
                </div>
            </div>
        </div>
    );
}
