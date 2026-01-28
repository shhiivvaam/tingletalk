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
    messages: Message[];

    setOnlineUsers: (users: OnlineUser[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;

    setSelectedUser: (user: OnlineUser | null) => void;

    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    onlineUsers: [],
    selectedUser: null,
    messages: [],

    setOnlineUsers: (users) => set({ onlineUsers: users }),
    addOnlineUser: (user) => set((state) => ({
        onlineUsers: [...state.onlineUsers.filter(u => u.id !== user.id), user]
    })),
    removeOnlineUser: (userId) => set((state) => ({
        onlineUsers: state.onlineUsers.filter(u => u.id !== userId),
        // Deselect if the selected user left
        selectedUser: state.selectedUser?.id === userId ? null : state.selectedUser
    })),

    setSelectedUser: (user) => set({ selectedUser: user, messages: [] }), // Clear messages on switch for now

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    clearMessages: () => set({ messages: [] }),
}));
