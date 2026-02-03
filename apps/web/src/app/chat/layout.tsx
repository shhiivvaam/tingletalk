'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/useUserStore';
import { useChatStore } from '@/store/useChatStore';
import OnlineUsersList from '@/components/chat/OnlineUsersList';
import { Menu, X, Calendar, MapPin, ChevronLeft, ChevronRight, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playNotificationSound, playMessageSound } from '@/utils/audio';
import AdUnit from '@/components/ads/AdUnit';
import { AD_CONFIG } from '@/constants/ads';
import ConfirmModal from '@/components/ui/ConfirmModal';

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
    const [notification, setNotification] = useState<{ id: string, nickname: string, message: string } | null>(null);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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

            // TOAST LOGIC
            // If the message is NOT from the current user (sent by me) 
            // AND not from the person I'm currently talking to
            // Show a "New Message" popup 
            const currentSelected = useChatStore.getState().selectedUser?.id;
            const isMe = data.senderId === newSocket.id;

            if (!isMe) {
                if (data.senderId === currentSelected) {
                    playMessageSound();
                } else {
                    const sender = store.onlineUsers.find(u => u.id === data.senderId) || store.knownUsers[data.senderId];
                    playNotificationSound();

                    if (sender) {
                        setNotification({
                            id: data.senderId,
                            nickname: sender.nickname,
                            message: data.type === 'text' ? data.message : `Sent a ${data.type}`
                        });
                        setTimeout(() => setNotification(null), 3000);
                    }
                }

            }

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
        });

        setSocket(newSocket);

        return () => {
            // Clean up listeners first
            newSocket.removeAllListeners();

            // In production, disconnect immediately
            if (process.env.NODE_ENV === 'production') {
                newSocket.disconnect();
            } else {
                // In development, disconnect after a short delay to handle hot reloads
                setTimeout(() => {
                    if (newSocket.connected) {
                        newSocket.disconnect();
                    }
                }, 1000);
            }
        };
    }, [username, gender, preferences, router, setOnlineUsers, addOnlineUser, removeOnlineUser, addMessage, setSelectedUser, addSessionId, isHydrated]);

    // Prevent accidental navigation away from chat
    useEffect(() => {
        if (!isHydrated || !username) return;

        // Warn user before leaving the page
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'You have an active chat session. Are you sure you want to leave?';
            return e.returnValue;
        };

        // Add a history entry to prevent immediate back navigation
        const preventBackNavigation = () => {
            // Push current state to history
            window.history.pushState(null, '', window.location.href);
        };

        // Handle popstate (back button)
        const handlePopState = (e: PopStateEvent) => {
            // Show custom confirmation modal
            e.preventDefault();
            window.history.pushState(null, '', window.location.href);
            setShowLeaveConfirm(true);
        };

        // Initialize
        preventBackNavigation();
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isHydrated, username, router]);

    const handleRandomMatch = (strategy: 'optimal' | 'immediate' = 'optimal') => {
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
            strategy // Pass the selected strategy
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
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden relative" style={{ overscrollBehaviorX: 'none' }}>
            {/* Custom Confirm Modal */}
            <ConfirmModal
                isOpen={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={() => {
                    // Force navigation to home
                    router.push('/');
                }}
                title="End Active Chat?"
                message="You have an active chat session. Going back will disconnect you from others. Your nickname and preferences will be kept."
                confirmText="Leave Chat"
                cancelText="Stay Here"
                type="warning"
            />

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: -50 }}
                        animate={{ opacity: 1, y: 0, x: -50 }}
                        exit={{ opacity: 0, y: -50, x: -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-4 border border-slate-700 cursor-pointer hover:bg-slate-750 active:scale-95 transition-all"
                        onClick={() => {
                            const user = useChatStore.getState().knownUsers[notification.id] || useChatStore.getState().onlineUsers.find(u => u.id === notification.id);
                            if (user) {
                                setSelectedUser(user);
                                setNotification(null);
                            }
                        }}
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-md">
                            {(notification.nickname || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-[120px]">
                            <span className="text-sm font-bold text-indigo-300">{notification.nickname}</span>
                            <span className="text-xs text-slate-300 truncate max-w-[200px]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Connection Status Banner */}
            {!isConnected && isHydrated && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Reconnecting to server...
                </div>
            )}

            {/* GLOBAL TOP FRAME AD */}
            {AD_CONFIG.ENABLE_ADS && (
                <div className="flex shrink-0 w-full z-30 bg-slate-900 border-b border-white/5 h-[90px] overflow-hidden justify-center items-center">
                    <AdUnit
                        type="adsterra-native"
                        format="horizontal"
                        label="Chat Top Banner"
                    />
                </div>
            )}

            {/* MAIN CONTENT ROW */}
            <div className="flex-1 flex min-h-0 overflow-hidden relative w-full">

                {AD_CONFIG.ENABLE_ADS && (
                    <div className="hidden xl:flex shrink-0 w-[160px] border-r border-white/5 bg-slate-900/40 flex-col overflow-hidden">
                        <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
                            <div className="p-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center shrink-0">Sponsored</div>
                            <AdUnit
                                type="adsterra-native"
                                format="vertical"
                                label="Left Skyscraper"
                            />
                        </div>
                    </div>
                )}

                {/* CENTER APP BOX (Sidebar + content) */}
                <div className="flex-1 flex relative min-w-0 bg-slate-950 shadow-2xl z-10">

                    {/* Premium Vertical Toggle Button - Refined & Compact */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`
                        absolute top-1/2 -translate-y-1/2 z-[60]
                        flex items-center justify-center
                        h-12 w-5 md:w-6
                        transition-all duration-500 ease-out group
                        ${isSidebarOpen
                                ? 'left-[100%] md:left-80 -translate-x-full rounded-l-xl bg-slate-900/40 hover:bg-white/10 border-r-0'
                                : 'left-0 rounded-r-xl bg-gradient-to-b from-pink-600 to-violet-600 shadow-[4px_0_15px_rgba(236,72,153,0.25)]'}
                        border border-white/10 backdrop-blur-xl
                    `}
                    >
                        <div className="flex flex-col items-center">
                            {isSidebarOpen ? (
                                <ChevronLeft size={16} className="text-white/40 group-hover:text-white transition-colors" />
                            ) : (
                                <ChevronRight size={16} className="text-white animate-pulse" />
                            )}
                        </div>
                    </button>

                    {/* Sidebar (Left of App Box) */}
                    <motion.div
                        initial={false}
                        animate={{
                            x: isSidebarOpen ? 0 : '-100%',
                            width: isSidebarOpen ? (typeof window !== 'undefined' && window.innerWidth >= 768 ? 320 : '100%') : 0
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        className={`
                        absolute inset-y-0 left-0 z-50 md:relative bg-slate-900/95 backdrop-blur-3xl border-r border-white/5 flex flex-col overflow-hidden h-full
                    `}
                    >
                        {/* Fixed Width Content Container */}
                        <div className="w-[100vw] md:w-80 h-full flex flex-col shrink-0">
                            {/* Header */}
                            <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <img src="/assets/logo.png" alt="TingleTalk" className="w-8 h-8 object-contain" />
                                    <span className="font-black text-lg tracking-tight text-white/90">
                                        Tingle<span className="text-pink-500">Talk</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-xs text-white shadow-sm border border-white/10"
                                    >
                                        {(username || '?').charAt(0).toUpperCase()}
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                    </button>

                                    {/* Mobile Close Button */}
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Profile Dropdown (Inside Sidebar context) */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-16 left-4 right-4 z-[70] bg-slate-800/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-sm text-white">{getInitials(username)}</div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white truncate">{username}</h3>
                                                <p className="text-xs text-slate-400 capitalize">{gender} • {useUserStore.getState().age}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <MapPin size={12} className="text-pink-500" />
                                                <span>{useUserStore.getState().state}, {useUserStore.getState().country}</span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    setShowLeaveConfirm(true);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/10"
                                            >
                                                <Power size={14} />
                                                End Session
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* User List */}
                            <div className="flex-1 overflow-hidden relative">
                                <OnlineUsersList
                                    users={onlineUsers}
                                    currentUserId={socket?.id || null}
                                    selectedUserId={selectedUser?.id || null}
                                    onSelectUser={(user) => {
                                        setSelectedUser(user);
                                        if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
                                    }}
                                    onFindMatch={handleRandomMatch}
                                    isSearching={isSearching}
                                />
                            </div>


                        </div>
                    </motion.div>

                    {/* Mobile Backdrop */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-40"
                            />
                        )}
                    </AnimatePresence>

                    {/* Main Content Area (Center) */}
                    <div className="flex-1 flex flex-col relative min-w-0 h-full bg-slate-950">
                        <SocketContext.Provider value={socket}>
                            {children}
                        </SocketContext.Provider>
                    </div>
                </div>

                {AD_CONFIG.ENABLE_ADS && (
                    <div className="hidden xl:flex shrink-0 w-[160px] border-l border-white/5 bg-slate-900/40 flex-col overflow-hidden">
                        <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
                            <div className="p-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center shrink-0">Sponsored</div>
                            <AdUnit
                                type="adsterra-native"
                                format="vertical"
                                label="Right Skyscraper"
                            />
                        </div>
                    </div>
                )}

            </div>

            {AD_CONFIG.ENABLE_ADS && (
                <div className="hidden md:flex shrink-0 w-full z-30 bg-slate-900 border-t border-white/5 h-[90px] overflow-hidden justify-center items-center">
                    <AdUnit
                        type="adsterra-native"
                        format="horizontal"
                        label="Chat Bottom Banner"
                    />
                </div>
            )}
        </div>
    );
}

const getInitials = (name: string | null) => (name || '?').charAt(0).toUpperCase();

// Simple Context for Socket
import { createContext, useContext } from 'react';
export const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);
