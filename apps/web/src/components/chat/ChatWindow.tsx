'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, MoreVertical, Phone, Video } from 'lucide-react';
import { useChatStore, Message } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
    socket: any;
    currentUserId: string;
}

export default function ChatWindow({ socket, currentUserId }: ChatWindowProps) {
    const { selectedUser, messages, addMessage } = useChatStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim() || !selectedUser || !socket) return;

        const messageContent = inputValue.trim();

        // Emit to server
        // Using selectedUser.id as roomId for direct p2p (server handles logic)
        socket.emit('sendMessage', {
            roomId: selectedUser.id,
            message: messageContent
        });

        // Optimistically add to UI
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: currentUserId,
            text: messageContent,
            timestamp: Date.now(),
        };
        addMessage(newMessage);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500">
                <p>Select a user to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/30 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-pink-500/20">
                            {(selectedUser.nickname || '?')[0].toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-200">{selectedUser.nickname}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="capitalize">{selectedUser.gender}</span>
                            <span>•</span>
                            <span className="uppercase">{selectedUser.country || 'UN'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <Phone size={20} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <Video size={20} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('/grid.svg')] bg-opacity-5">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                            <UserIcon size={32} className="opacity-50" />
                        </div>
                        <p className="text-sm">Start a conversation with {selectedUser.nickname}!</p>
                        <p className="text-xs opacity-50">Say Hello 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-md
                                        ${isMe
                                            ? 'bg-gradient-to-br from-pink-600 to-violet-600 text-white rounded-tr-none'
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                                        }
                                    `}
                                >
                                    <p>{msg.text}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-slate-500'} text-right`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/50 backdrop-blur-md border-t border-white/5">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-xl border border-white/5 focus-within:ring-2 focus-within:ring-pink-500/50 transition-all"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent px-4 py-2 text-slate-200 outline-none placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-3 rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
