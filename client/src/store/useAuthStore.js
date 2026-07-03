import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loginUser: (user, token) => set({ user, token, isAuthenticated: true }),
            logoutUser: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        { name: 'varta-auth' }
    )
);
