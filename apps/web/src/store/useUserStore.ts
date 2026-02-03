import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
    userId: string | null;
    username: string | null;
    isAnonymous: boolean;
    gender: 'male' | 'female' | 'other' | null;
    age: number | null;
    country: string | null;
    state: string | null;
    hasAgreedToRules: boolean;
    preferences: {
        targetGender: 'male' | 'female' | 'all';
        location: 'local' | 'global';
    };
    setAnonymousUser: (data: { username: string; gender: string; age: number; country: string; state: string }) => void;
    setHasAgreedToRules: (val: boolean) => void;
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
            age: null,
            country: null,
            state: null,
            hasAgreedToRules: false,
            preferences: {
                targetGender: 'all',
                location: 'global',
            },
            setAnonymousUser: (data) =>
                set((state) => ({
                    ...state,
                    username: data.username,
                    gender: data.gender as any,
                    age: data.age,
                    country: data.country,
                    state: data.state,
                    isAnonymous: true,
                    hasAgreedToRules: false, // Reset agreement on new user entry
                })),
            setHasAgreedToRules: (val) => set({ hasAgreedToRules: val }),
            updatePreferences: (prefs) =>
                set((state) => ({
                    ...state,
                    preferences: { ...state.preferences, ...prefs },
                })),
            reset: () => set({
                userId: null,
                username: null,
                isAnonymous: false,
                gender: null,
                age: null,
                country: null,
                state: null,
                hasAgreedToRules: false
            }),
        }),
        {
            name: 'tingle-user-storage',
            storage: createJSONStorage(() => localStorage), // Use localStorage to persist across navigation
        }
    )
);
