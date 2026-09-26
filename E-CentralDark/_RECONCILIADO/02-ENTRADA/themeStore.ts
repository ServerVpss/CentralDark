import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    primaryColor: string;
    mode: ThemeMode;
    setPrimaryColor: (color: string) => void;
    setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            primaryColor: '#13ec5b', // Default original green
            mode: 'system',
            setPrimaryColor: (color) => set({ primaryColor: color }),
            setMode: (mode) => set({ mode }),
        }),
        {
            name: 'theme-storage',
        }
    )
);
