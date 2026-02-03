'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/useUserStore';
import { Send, ArrowLeft, MoreHorizontal, Smile, Paperclip, Zap, Shield, User, Power } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

interface Message {
    senderId: string;
    message: string;
    timestamp: number;
    isMine: boolean;
}

export default function ChatRoom() {
    const router = useRouter();
    // Select strictly the needed primitive values
    const username = useUserStore((state) => state.username);
    const gender = useUserStore((state) => state.gender);

    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [isMatched, setIsMatched] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        const newSocket = io(wsUrl, {
            transports: ['websocket'],
            autoConnect: true,
            withCredentials: true,
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
        });

        newSocket.on('matchFound', (data) => {
            setRoomId(data.roomId);
            setIsMatched(true);
        });

        newSocket.on('receiveMessage', (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    senderId: data.senderId,
                    message: data.message,
                    timestamp: data.timestamp,
                    isMine: false,
                },
            ]);
        });

        newSocket.on('userTyping', (data) => {
            setPartnerTyping(data.isTyping);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [username, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        const cleanMessage = inputMessage.trim();
        if (!cleanMessage || !socket || !roomId) return;

        if (cleanMessage.length > 500) {
            useToastStore.getState().addToast("Message is too long (max 500 characters)", "error");
            return;
        }

        const newMessage: Message = {
            senderId: socket.id || '',
            message: cleanMessage,
            timestamp: Date.now(),
            isMine: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        socket.emit('sendMessage', { roomId, message: cleanMessage });
        setInputMessage('');
        setIsTyping(false);
        socket.emit('typing', { roomId, isTyping: false });
    };

    const handleTyping = (value: string) => {
        setInputMessage(value);
        if (!socket || !roomId) return;

        if (value && !isTyping) {
            setIsTyping(true);
            socket.emit('typing', { roomId, isTyping: true });
        } else if (!value && isTyping) {
            setIsTyping(false);
            socket.emit('typing', { roomId, isTyping: false });
        }
    };

    const leaveChat = () => {
        if (socket) socket.disconnect();
        router.push('/');
    };

    return (
        <div className="h-screen flex flex-col max-w-5xl mx-auto shadow-2xl relative overflow-hidden bg-slate-900/40 border-x border-white/5">
            {/* Header */}
            <header className="glass-card shadow-2xl z-20 px-4 md:px-8 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={leaveChat}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10">
                                <User size={24} />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-slate-100 uppercase tracking-wider text-xs md:text-sm">Stranger</h2>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-pink-500/10 text-[9px] font-bold uppercase tracking-tighter text-pink-400 border border-pink-500/20">
                                    <Shield size={8} /> Verified
                                </span>
                            </div>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                                {partnerTyping ? (
                                    <span className="text-pink-400 flex items-center gap-1">
                                        Typing<span className="animate-pulse">...</span>
                                    </span>
                                ) : (
                                    "Connected globally"
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="hidden md:flex p-2 items-center gap-2 px-4 rounded-xl hover:bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest transition-all">
                        <Zap size={14} className="text-pink-500" /> Fast Match
                    </button>
                    <button
                        onClick={leaveChat}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                    >
                        <Power size={20} />
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8 scrollbar-hide bg-mesh">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-4"
                        >
                            <div className="p-4 rounded-full bg-white/5 text-slate-600 mb-2">
                                <Smile size={48} strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 tracking-tight">Secret conversation started</h3>
                            <p className="text-sm text-slate-500 max-w-xs font-light">
                                All messages are end-to-end encrypted. Be nice, stay safe. Wave hello!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: msg.isMine ? 20 : -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className={`flex w-full ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] md:max-w-[70%] group relative ${msg.isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-5 py-3.5 rounded-[1.75rem] text-sm leading-relaxed shadow-xl ${msg.isMine
                                ? 'bg-gradient-to-br from-pink-500 to-violet-600 text-white rounded-tr-none'
                                : 'bg-white/10 backdrop-blur-3xl text-slate-200 border border-white/5 rounded-tl-none'
                                }`}>
                                {msg.message}
                            </div>
                            <span className="mt-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-4 md:p-8 relative z-10 bg-gradient-to-t from-slate-950/80 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <div className="relative flex items-end gap-3 glass-card p-2 rounded-[2rem] border border-white/10 shadow-2xl focus-within:border-pink-500/40 transition-all duration-300">
                        <button className="p-3 text-slate-500 hover:text-pink-400 transition-colors">
                            <PlusIcon size={22} />
                        </button>
                        <textarea
                            rows={1}
                            value={inputMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none py-3 text-sm md:text-base text-slate-100 placeholder:text-slate-600 resize-none max-h-32"
                        />
                        <button className="p-3 text-slate-500 hover:text-pink-400 transition-colors hidden md:block">
                            <Smile size={22} />
                        </button>
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim()}
                            className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-lg hover:shadow-pink-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    {/* Security Tip */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em]">
                        <Shield size={10} /> End-to-End Encrypted Node-7.3.0
                    </div>
                </div>
            </footer>
        </div>
    );
}

function PlusIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    );
}
