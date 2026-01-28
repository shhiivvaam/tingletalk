import { create } from 'zustand';

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
}

interface OnlineUser {
    id: string;
    nickname: string;
    gender: 'male' | 'female' | 'other';
    country: string;
    isOccupied: boolean;
}

interface ChatState {
    onlineUsers: OnlineUser[];
    selectedUser: OnlineUser | null;
    messages: Record<string, Message[]>; // Map userId -> messages
    unreadCounts: Record<string, number>; // Map userId -> unread count

    setOnlineUsers: (users: OnlineUser[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;

    setSelectedUser: (user: OnlineUser | null) => void;

    addMessage: (userId: string, message: Message) => void;
    markAsRead: (userId: string) => void;
    setTyping: (userId: string, isTyping: boolean) => void;
    typingUsers: Record<string, boolean>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    onlineUsers: [],
    selectedUser: null,
    messages: {},
    unreadCounts: {},
    typingUsers: {},

    setOnlineUsers: (users) => set({ onlineUsers: users }),
    addOnlineUser: (user) => set((state) => ({
        onlineUsers: [...state.onlineUsers.filter(u => u.id !== user.id), user]
    })),
    removeOnlineUser: (userId) => set((state) => ({
        onlineUsers: state.onlineUsers.filter(u => u.id !== userId),
        // Keep selectedUser even if they leave so we can show "Disconnected" state
        // selectedUser: state.selectedUser?.id === userId ? null : state.selectedUser,
        typingUsers: { ...state.typingUsers, [userId]: false } // Clear typing if they leave
    })),

    setSelectedUser: (user) => {
        set({ selectedUser: user });
        if (user) {
            get().markAsRead(user.id);
        }
    },

    addMessage: (userId, message) => set((state) => {
        const isSelected = state.selectedUser?.id === userId;
        const currentMessages = state.messages[userId] || [];

        return {
            messages: {
                ...state.messages,
                [userId]: [...currentMessages, message]
            },
            typingUsers: {
                ...state.typingUsers,
                [userId]: false
            },
            unreadCounts: {
                ...state.unreadCounts,
                [userId]: isSelected ? 0 : (state.unreadCounts[userId] || 0) + 1
            }
        };
    }),

    markAsRead: (userId) => set((state) => ({
        unreadCounts: {
            ...state.unreadCounts,
            [userId]: 0
        }
    })),

    setTyping: (userId, isTyping) => set((state) => ({
        typingUsers: { ...state.typingUsers, [userId]: isTyping }
    })),
}));
