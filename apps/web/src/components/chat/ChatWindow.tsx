'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, MoreVertical, Phone, Video, Ghost, Flame } from 'lucide-react';
import { useChatStore, Message } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
    socket: any;
    currentUserId: string;
}

export default function ChatWindow({ socket, currentUserId }: ChatWindowProps) {
    const { selectedUser, messages, addMessage, typingUsers, onlineUsers, mySessionIds } = useChatStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isTyping = selectedUser ? typingUsers[selectedUser.id] : false;
    const isOnline = selectedUser ? onlineUsers.some(u => u.id === selectedUser.id) : false;

    const userMessages = selectedUser ? (messages[selectedUser.id] || []) : [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [userMessages, isTyping]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim() || !selectedUser || !socket) return;

        const messageContent = inputValue.trim();

        // Emit to server
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
        addMessage(selectedUser.id, newMessage);
        setInputValue('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

        if (!selectedUser || !socket) return;

        socket.emit('typing', { roomId: selectedUser.id, isTyping: true });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { roomId: selectedUser.id, isTyping: false });
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            socket.emit('typing', { roomId: selectedUser?.id, isTyping: false });
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/50 backdrop-blur-md">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800">
                    <Ghost size={48} className="text-slate-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2">Ready to Mingle?</h2>
                <p className="text-slate-500 text-center max-w-sm">
                    Select a user from the list to start a private, anonymous conversation.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-3xl relative overflow-hidden">

            {/* Header */}
            <div className="h-20 px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-pink-500/20">
                            {(selectedUser.nickname || '?')[0].toUpperCase()}
                        </div>
                        {isOnline ? (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        ) : (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-500 rounded-full border-2 border-slate-900"></div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                            {selectedUser.nickname}
                            <Flame size={14} className="text-pink-500 fill-pink-500" />
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="bg-slate-800 px-2 py-0.5 rounded-md capitalize text-slate-400">{selectedUser.gender}</span>
                            <span>•</span>
                            <span className="uppercase tracking-wider">{selectedUser.country || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                        <Phone size={20} />
                    </button>
                    <button className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                        <Video size={20} />
                    </button>
                    <button className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar z-10">
                {userMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-inner border border-white/5">
                            <span className="text-4xl">👋</span>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium text-slate-300">Start the conversation!</p>
                            <p className="text-xs text-slate-600">Don't be shy, say hello to {selectedUser.nickname}</p>
                        </div>
                    </div>
                ) : (
                    userMessages.map((msg, i) => {
                        const isMe = msg.senderId === currentUserId || mySessionIds.includes(msg.senderId);
                        const isConsecutive = i > 0 && userMessages[i - 1].senderId === msg.senderId;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div
                                    className={`
                                        max-w-[75%] md:max-w-[60%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
                                        ${isMe
                                            ? 'bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-tr-sm shadow-pink-900/10'
                                            : 'bg-slate-800/80 text-slate-100 rounded-tl-sm border border-white/5 shadow-black/20'
                                        }
                                        ${isConsecutive ? (!isMe ? 'rounded-tl-2xl' : 'rounded-tr-2xl') : ''}
                                    `}
                                >
                                    <p>{msg.text}</p>
                                    <div className={`flex items-center gap-1 justify-end mt-1 ${isMe ? 'text-pink-200/50' : 'text-slate-500'}`}>
                                        <span className="text-[10px] font-medium">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}


                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex justify-start"
                    >
                        <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5 flex items-center gap-1.5 shadow-lg">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl border-t border-white/5 z-20">
                {isOnline ? (
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-2xl border border-white/10 focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500/30 transition-all shadow-inner"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent px-4 py-2 text-slate-200 outline-none placeholder:text-slate-600 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/20"
                        >
                            <Send size={18} fill="currentColor" />
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center justify-center p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400 text-sm font-medium animate-pulse">
                        User has disconnected
                    </div>
                )}
            </div>
        </div>
    );
}
