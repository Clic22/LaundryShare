import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'user' | 'host';

interface ModeState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'user',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'mode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper hooks for easy access
export const useAppMode = () => useModeStore((state) => state.mode);
export const useSetMode = () => useModeStore((state) => state.setMode);
