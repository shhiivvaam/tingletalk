'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/useUserStore';
import { useChatStore } from '@/store/useChatStore';
import OnlineUsersList from '@/components/chat/OnlineUsersList';
import { Menu, X, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnlineUser {
    id: string;
    nickname: string;
    gender: 'male' | 'female' | 'other';
    country: string;
    isOccupied: boolean;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { username, gender, preferences } = useUserStore();
    const { onlineUsers, setOnlineUsers, addOnlineUser, removeOnlineUser, addMessage, selectedUser, setSelectedUser, addSessionId } = useChatStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for Zustand to hydrate from localStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        // Don't redirect until hydration is complete
        if (!isHydrated) return;

        if (!username) {
            router.push('/');
            return;
        }

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
        if (!wsUrl) return;

        const newSocket = io(wsUrl, {
            transports: ['websocket'],
            autoConnect: true,
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const registerUser = () => {
            newSocket.emit('findMatch', {
                username,
                gender: gender || 'other',
                age: useUserStore.getState().age, // Send Age
                scope: preferences?.location || 'global',
                country: useUserStore.getState().country || 'Unknown',
                state: useUserStore.getState().state,
                targetGender: preferences?.targetGender || 'all',
            });

            // If we have a stored session ID, we might need to verify it?
            // For now, new connection = new session logic in Gateway

            newSocket.emit('getOnlineUsers', {}, (users: OnlineUser[]) => {
                setOnlineUsers(users || []);
            });
        };

        newSocket.on('connect', () => {
            console.log('✅ Connected to WebSocket');
            setIsConnected(true);
            if (newSocket.id) addSessionId(newSocket.id);
            registerUser();
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
            if (newSocket.id) addSessionId(newSocket.id);
            registerUser();
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('userJoined', (user: OnlineUser) => {
            addOnlineUser(user);
        });

        newSocket.on('userLeft', ({ userId }: { userId: string }) => {
            removeOnlineUser(userId);
        });

        newSocket.on('receiveMessage', (data: {
            senderId: string,
            message: string,
            type?: 'text' | 'image' | 'video' | 'audio' | 'gif',
            attachmentUrl?: string,
            metadata?: any,
            timestamp: number
        }) => {
            const store = useChatStore.getState();
            store.addMessage(data.senderId, {
                id: Date.now().toString() + Math.random(),
                senderId: data.senderId,
                text: data.message,
                type: data.type || 'text',
                attachmentUrl: data.attachmentUrl,
                metadata: data.metadata,
                timestamp: data.timestamp
            });
        });

        newSocket.on('userTyping', (data: { userId: string, isTyping: boolean }) => {
            useChatStore.getState().setTyping(data.userId, data.isTyping);
        });

        newSocket.on('messagesRead', (data: { readerId: string }) => {
            useChatStore.getState().markMessagesAsSeen(data.readerId);
        });

        // Add Match Found Listener
        newSocket.on('matchFound', (data: { user: OnlineUser }) => {
            setIsSearching(false);
            useChatStore.getState().setSelectedUser(data.user);

            // Also ensure we know about this user
            useChatStore.getState().addOnlineUser(data.user);

            // Optional: Notification Sound?
            // const audio = new Audio('/sounds/match.mp3');
            // audio.play().catch(() => {});
        });

        setSocket(newSocket);

        return () => {
            // Only disconnect if not in development hot reload
            if (process.env.NODE_ENV === 'production') {
                newSocket.disconnect();
            } else {
                // In development, just clean up listeners but keep connection
                newSocket.removeAllListeners();
            }
        };
    }, [username, gender, preferences, router, setOnlineUsers, addOnlineUser, removeOnlineUser, addMessage, setSelectedUser, isHydrated]);

    const handleRandomMatch = () => {
        if (!socket) return;
        setIsSearching(true);
        socket.emit('requestRandomMatch', {
            username,
            gender: gender || 'other',
            age: useUserStore.getState().age, // Send Age
            scope: preferences?.location || 'global',
            country: useUserStore.getState().country || 'Unknown',
            state: useUserStore.getState().state,
            targetGender: preferences?.targetGender || 'all',
        });
    };

    // Show loading while hydrating to prevent flash
    if (!isHydrated) {
        return (
            <div className="flex h-screen bg-slate-950 text-slate-200 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen text-slate-200 overflow-hidden relative">
            {/* Connection Status Banner */}
            {!isConnected && isHydrated && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Reconnecting to server...
                </div>
            )}

            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden absolute top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-white/10 text-white"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-full md:w-80 bg-slate-900/95 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Branding & Profile Header */}
                <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-slate-900/50 gap-2 relative z-50">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="TingleTalk" className="w-8 h-8 object-contain" />
                        <span className="font-black text-lg tracking-tight text-white/90 hidden sm:block">
                            Tingle<span className="text-pink-500">Talk</span>
                        </span>
                    </div>

                    {/* Right: Profile Toggle */}
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 bg-white/5 pl-1 pr-3 py-1 rounded-full border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                            {(username || '?').charAt(0).toUpperCase()}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                        </div>
                        <div className="flex flex-col max-w-[80px] text-left">
                            <span className="text-xs font-bold text-slate-200 truncate">{username || 'You'}</span>
                            <span className="text-[10px] text-slate-500 truncate capitalize">{gender}</span>
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                {/* Invisible Backdrop to close on click outside */}
                                <div
                                    className="fixed inset-0 z-[60]"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                {/* Dropdown Menu */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-14 right-4 z-[70] w-64 bg-slate-900 rounded-xl border border-white/10 shadow-xl overflow-hidden"
                                >
                                    <div className="p-4 space-y-4">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0">
                                                {(username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-200 truncate">{username}</h3>
                                                <span className="text-xs text-slate-500 capitalize">{gender}</span>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar size={14} className="text-pink-500 shrink-0" />
                                                <span className="text-slate-400">Age:</span>
                                                <span className="font-medium text-slate-200">{useUserStore.getState().age}</span>
                                            </div>
                                            <div className="flex items-start gap-3 text-sm">
                                                <MapPin size={14} className="text-violet-500 shrink-0 mt-0.5" />
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 leading-tight">
                                                        {useUserStore.getState().state || 'Unknown'},
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {useUserStore.getState().country || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-white/5 px-4 py-2 text-[10px] text-center text-slate-500">
                                        Connected as Anonymous
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <OnlineUsersList
                        users={onlineUsers}
                        currentUserId={socket?.id || null}
                        selectedUserId={selectedUser?.id || null}
                        onSelectUser={(user) => {
                            setSelectedUser(user);
                            setIsSidebarOpen(false); // Close sidebar on mobile on selection
                        }}
                        onFindMatch={handleRandomMatch}
                        isSearching={isSearching}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative w-full h-full">
                {/*
                   We pass the socket to children via Props if we could, but children are pre-determined.
                   Alternatively, we can use a Context to provide the socket.
                   Or we can just rely on the Page to grab the socket if we stored it?
                   actually, storing socket in Zustand is tricky (non-serializable).
                   Better approach: 
                   Render children (which is the Page). USE A CONTEXT for socket.
                */}
                <SocketContext.Provider value={socket}>
                    {children}
                </SocketContext.Provider>
            </div>
        </div>
    );
}

// Simple Context for Socket
import { createContext, useContext } from 'react';
export const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);
