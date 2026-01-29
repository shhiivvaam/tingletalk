'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, MoreVertical, Phone, Video, Ghost, Flame, Calendar, MapPin, X, Check, CheckCheck } from 'lucide-react';
import { useChatStore, Message } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';

interface ChatWindowProps {
    socket: any;
    currentUserId: string;
}

export default function ChatWindow({ socket, currentUserId }: ChatWindowProps) {
    const { selectedUser, messages, addMessage, typingUsers, onlineUsers, mySessionIds } = useChatStore();
    const [inputValue, setInputValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
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

        // Notify server that we read the messages in this room
        if (selectedUser && socket) {
            socket.emit('messageRead', { roomId: selectedUser.id });
        }
    }, [userMessages, isTyping, selectedUser, socket]);

    const handleSendMessage = (text = inputValue) => {
        if (!text.trim() || !selectedUser || !socket) return;

        const messageContent = text.trim();

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

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue((prev) => prev + emojiData.emoji);
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
                <div className="mt-8 flex gap-4">
                    <button className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors border border-white/5">
                        Latest Matches
                    </button>
                    <button className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold transition-transform hover:scale-105 shadow-lg shadow-pink-500/20">
                        Quick Match
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-3xl relative overflow-hidden">

            {/* Header */}
            <div className="h-20 px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl z-20">
                {/* User Info Toggle */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-4 hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors text-left"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-pink-500/20 ring-2 ring-white/5">
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
                                <Flame size={14} className="text-pink-500 fill-pink-500 animate-pulse" />
                            </h2>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span className="bg-slate-800 px-2 py-0.5 rounded-md capitalize text-slate-400 border border-white/5">{selectedUser.gender}</span>
                                {(selectedUser.country && selectedUser.country !== 'Unknown') && (
                                    <>
                                        <span>•</span>
                                        <span className="truncate max-w-[150px]">
                                            {selectedUser.country}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </button>

                    {/* Chat User Profile Dropdown */}
                    <AnimatePresence>
                        {showProfile && (
                            <>
                                <div
                                    className="fixed inset-0 z-[60]"
                                    onClick={() => setShowProfile(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 mt-2 z-[70] w-72 bg-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                                >
                                    <div className="p-5 space-y-5">
                                        {/* Header */}
                                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                                                {(selectedUser.nickname || '?')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{selectedUser.nickname}</h3>
                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 capitalize border border-white/5">
                                                    {selectedUser.gender}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                                <Calendar size={18} className="text-pink-500" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-500">Age</p>
                                                    <p className="text-sm font-semibold text-slate-200">
                                                        {selectedUser.age ? `${selectedUser.age} years old` : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                                <MapPin size={18} className="text-violet-500" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-500">Location</p>
                                                    <p className="text-sm font-semibold text-slate-200">
                                                        {selectedUser.state && selectedUser.state !== 'Unknown' ? `${selectedUser.state}, ` : ''}
                                                        {selectedUser.country || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="pt-2">
                                            {isOnline ? (
                                                <div className="flex items-center gap-2 text-xs text-green-400 justify-center bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    Online Now
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 justify-center bg-slate-800/50 py-2 rounded-lg border border-white/5">
                                                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                                    Offline
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                    <button disabled title="Coming Soon" className="p-3 rounded-full text-slate-600 cursor-not-allowed border border-transparent relative group">
                        <Phone size={20} />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                        </span>
                        <span className="absolute top-10 right-0 w-max bg-slate-900 text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Coming Soon</span>
                    </button>
                    <button disabled title="Coming Soon" className="p-3 rounded-full text-slate-600 cursor-not-allowed border border-transparent relative group">
                        <Video size={20} />
                        <span className="absolute top-10 right-0 w-max bg-slate-900 text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Coming Soon</span>
                    </button>
                    {/* <button className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/5">
                        <MoreVertical size={20} />
                    </button> */}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar z-10">
                {userMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-inner border border-white/5"
                        >
                            <span className="text-5xl">👋</span>
                        </motion.div>
                        <div className="text-center space-y-2">
                            <h3 className="font-bold text-slate-200 text-lg">Start the conversation!</h3>
                            <p className="text-sm text-slate-500">Don't be shy, say hello to {selectedUser.nickname}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                            {["Hi there! 👋", "How's it going?", "Nice to meet you!", "From where?"].map((text) => (
                                <button
                                    key={text}
                                    onClick={() => handleSendMessage(text)}
                                    className="px-4 py-2 rounded-full bg-slate-800/50 hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30 border border-white/5 text-xs font-medium transition-all"
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    userMessages.map((msg, i) => {
                        const isMe = msg.senderId === currentUserId || mySessionIds.includes(msg.senderId);
                        const isConsecutive = i > 0 && userMessages[i - 1].senderId === msg.senderId;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div
                                    className={`
                                        max-w-[80%] md:max-w-[65%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm relative
                                        ${isMe
                                            ? 'bg-gradient-to-br from-pink-600 to-violet-600 text-white rounded-tr-sm shadow-pink-900/10'
                                            : 'bg-slate-800/80 text-slate-100 rounded-tl-sm border border-white/5 shadow-black/20 backdrop-blur-sm'
                                        }
                                        ${isConsecutive ? (!isMe ? 'rounded-tl-2xl' : 'rounded-tr-2xl') : ''}
                                    `}
                                >
                                    <p>{msg.text}</p>
                                    <div className={`flex items-center gap-1 justify-end mt-1 ${isMe ? 'text-pink-200/50' : 'text-slate-500'}`}>
                                        <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && (
                                            <span className="ml-1">
                                                {msg.isRead ? (
                                                    <CheckCheck size={14} className="text-blue-300" />
                                                ) : (
                                                    <Check size={14} className="opacity-70" />
                                                )}
                                            </span>
                                        )}
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
                        <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl border-t border-white/5 z-20 relative">
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full left-4 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10"
                        >
                            <EmojiPicker
                                theme={Theme.DARK}
                                onEmojiClick={onEmojiClick}
                                searchDisabled={false}
                                width={320}
                                height={400}
                                lazyLoadEmojis={true}
                                skinTonesDisabled
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isOnline ? (
                    <div className="flex items-end gap-2 max-w-4xl mx-auto">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-3 rounded-full hover:bg-white/5 transition-colors ${showEmojiPicker ? 'text-pink-400 bg-white/5' : 'text-slate-400 hover:text-pink-400'}`}
                        >
                            <span className="text-xl">😊</span>
                        </button>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                                setShowEmojiPicker(false);
                            }}
                            className="flex-1 flex items-center gap-3 bg-slate-950/50 p-2 rounded-[1.5rem] border border-white/10 focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500/30 transition-all shadow-inner"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onClick={() => setShowEmojiPicker(false)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent px-4 py-2 text-slate-200 outline-none placeholder:text-slate-600 font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/20"
                            >
                                <Send size={18} fill="currentColor" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400 text-sm font-medium animate-pulse">
                        User has disconnected
                    </div>
                )}
            </div>
        </div>
    );
}
