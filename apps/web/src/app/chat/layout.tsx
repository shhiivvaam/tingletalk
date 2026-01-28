'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/useUserStore';
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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
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
            // Join lobby by "finding match" with no specific intent?
            // Actually our backend handleFindMatch creates the session.
            // We need to trigger session creation.
            newSocket.emit('findMatch', {
                username,
                gender: gender || 'other',
                scope: preferences?.location || 'global',
                country: 'Unknown', // TODO: Get real location
                targetGender: preferences?.targetGender || 'all',
            });

            // Fetch initial list
            newSocket.emit('getOnlineUsers', {}, (users: OnlineUser[]) => {
                setOnlineUsers(users || []);
            });
        });

        newSocket.on('userJoined', (user: OnlineUser) => {
            setOnlineUsers(prev => {
                if (prev.find(p => p.id === user.id)) return prev;
                return [...prev, user];
            });
        });

        newSocket.on('userLeft', ({ userId }: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(u => u.id !== userId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [username, gender, preferences, router]);

    const handleSelectUser = (user: OnlineUser) => {
        // For now, maybe just log? Or navigate to a direct chat URL?
        // Since the current requirement is just "Main Chat Window panel",
        // we might not have a direct chat UI ready yet for P2P.
        // Let's implement a placeholder action.
        console.log('Selected user:', user);
    };

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
                    onSelectUser={handleSelectUser}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative w-full h-full">
                {children}
            </div>
        </div>
    );
}
