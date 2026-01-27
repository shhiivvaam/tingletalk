import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    userId: string | null;
    username: string | null;
    isAnonymous: boolean;
    gender: 'male' | 'female' | 'other' | null;
    preferences: {
        targetGender: 'male' | 'female' | 'all';
        location: 'local' | 'global';
    };
    setAnonymousUser: (data: { username: string; gender: string }) => void;
    updatePreferences: (prefs: Partial<UserState['preferences']>) => void;
    reset: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            userId: null,
            username: null,
            isAnonymous: false,
            gender: null,
            preferences: {
                targetGender: 'all',
                location: 'global',
            },
            setAnonymousUser: (data) =>
                set((state) => ({
                    ...state,
                    username: data.username,
                    gender: data.gender as any,
                    isAnonymous: true,
                })),
            updatePreferences: (prefs) =>
                set((state) => ({
                    ...state,
                    preferences: { ...state.preferences, ...prefs },
                })),
            reset: () => set({ userId: null, username: null, isAnonymous: false }),
        }),
        {
            name: 'tingle-user-storage',
        }
    )
);
