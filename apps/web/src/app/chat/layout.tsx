'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/useUserStore';
import { useChatStore } from '@/store/useChatStore';
import OnlineUsersList from '@/components/chat/OnlineUsersList';
import { Menu, X } from 'lucide-react';

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
    const { onlineUsers, setOnlineUsers, addOnlineUser, removeOnlineUser, addMessage, selectedUser, setSelectedUser } = useChatStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
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
        });

        newSocket.on('connect', () => {
            newSocket.emit('findMatch', {
                username,
                gender: gender || 'other',
                scope: preferences?.location || 'global',
                country: 'Unknown',
                targetGender: preferences?.targetGender || 'all',
            });

            newSocket.emit('getOnlineUsers', {}, (users: OnlineUser[]) => {
                setOnlineUsers(users || []);
            });
        });

        newSocket.on('userJoined', (user: OnlineUser) => {
            addOnlineUser(user);
        });

        newSocket.on('userLeft', ({ userId }: { userId: string }) => {
            removeOnlineUser(userId);
        });

        newSocket.on('receiveMessage', (data: { senderId: string, message: string, timestamp: number }) => {
            // We need to access the LATEST selectedUser state. 
            // Since we are inside a closure, we should use the store getter if possible or rely on the hook.
            // Zustand's hook returns current state.
            const currentSelected = useChatStore.getState().selectedUser;

            if (currentSelected?.id === data.senderId) {
                addMessage({
                    id: Date.now().toString() + Math.random(),
                    senderId: data.senderId,
                    text: data.message,
                    timestamp: data.timestamp
                });
            } else {
                // TODO: Show notification or badge for unread message from other user
                console.log('Message from', data.senderId, 'but chatting with', currentSelected?.id);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [username, gender, preferences, router, setOnlineUsers, addOnlineUser, removeOnlineUser, addMessage]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden absolute top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <OnlineUsersList
                    users={onlineUsers}
                    currentUserId={socket?.id || null}
                    onSelectUser={setSelectedUser}
                />
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
