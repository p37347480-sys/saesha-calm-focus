import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Grade = 11 | 12;
export type Subject = 'Physics' | 'Chemistry' | 'Math' | 'Biology' | 'English';
export type SessionLength = 3 | 6 | 10;

interface UserSettings {
  grade?: Grade;
  subjects: Subject[];
  sessionLength: SessionLength;
  useHints: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  fontSize: 'small' | 'medium' | 'large';
  isOnboarded: boolean;
}

interface AppState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  subjects: [],
  sessionLength: 6,
  useHints: true,
  reducedMotion: false,
  dyslexiaFont: false,
  fontSize: 'medium',
  isOnboarded: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      completeOnboarding: () =>
        set((state) => ({
          settings: { ...state.settings, isOnboarded: true },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'saesha-storage',
    }
  )
);
