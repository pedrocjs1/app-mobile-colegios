// C:\Users\Pedro\.gemini\antigravity\scratch\edu-app\store\useAuthStore.ts
import { create } from 'zustand';

export type UserRole = 'rector' | 'teacher' | 'preceptor' | 'tutor' | 'student';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    school_id: string; // Critical for White Label
    avatar_url?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false, // Could be true if checking persisted session
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));
