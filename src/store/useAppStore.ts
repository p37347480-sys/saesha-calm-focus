import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Grade = 11 | 12;
export type Chapter = 
  | 'Trigonometry' 
  | 'Algebra' 
  | 'Volume & Surface Area' 
  | 'Probability' 
  | 'Fractions/Decimals/Percentages/Interest';

interface UserSettings {
  grade?: Grade;
  favoriteChapters: Chapter[];
  useHints: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  animationIntensity: 'low' | 'medium' | 'high';
  isOnboarded: boolean;
}

interface AppState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  favoriteChapters: [],
  useHints: true,
  reducedMotion: false,
  dyslexiaFont: false,
  fontSize: 'medium',
  soundEnabled: true,
  animationIntensity: 'medium',
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
