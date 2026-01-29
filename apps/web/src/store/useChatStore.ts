import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    age?: number;
    country: string;
    state?: string;
    isOccupied: boolean;
}

interface ChatState {
    onlineUsers: OnlineUser[];
    selectedUser: OnlineUser | null;
    messages: Record<string, Message[]>; // Map userId -> messages
    unreadCounts: Record<string, number>; // Map userId -> unread count
    typingUsers: Record<string, boolean>;
    knownUsers: Record<string, OnlineUser>; // Cache of user details
    mySessionIds: string[]; // Track my own socket IDs across sessions

    setOnlineUsers: (users: OnlineUser[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;
    setSelectedUser: (user: OnlineUser | null) => void;
    addMessage: (userId: string, message: Message) => void;
    markAsRead: (userId: string) => void;
    setTyping: (userId: string, isTyping: boolean) => void;
    addSessionId: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            onlineUsers: [],
            selectedUser: null,
            messages: {},
            unreadCounts: {},
            typingUsers: {},
            knownUsers: {},
            mySessionIds: [],

            setOnlineUsers: (users) => set((state) => {
                const newKnown = { ...state.knownUsers };
                users.forEach(u => newKnown[u.id] = u);
                return { onlineUsers: users, knownUsers: newKnown };
            }),

            addOnlineUser: (user) => set((state) => ({
                onlineUsers: [...state.onlineUsers.filter(u => u.id !== user.id), user],
                knownUsers: { ...state.knownUsers, [user.id]: user }
            })),

            removeOnlineUser: (userId) => set((state) => ({
                onlineUsers: state.onlineUsers.filter(u => u.id !== userId),
                typingUsers: { ...state.typingUsers, [userId]: false }
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

            addSessionId: (id) => set((state) => ({
                mySessionIds: state.mySessionIds.includes(id) ? state.mySessionIds : [...state.mySessionIds, id]
            })),
        }),
        {
            name: 'tingle-chat-storage',
            partialize: (state) => ({
                messages: state.messages,
                knownUsers: state.knownUsers,
                unreadCounts: state.unreadCounts,
                selectedUser: state.selectedUser,
                mySessionIds: state.mySessionIds,
                // Don't persist: onlineUsers, typingUsers
            }),
            storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for tab isolation
        }
    )
);
