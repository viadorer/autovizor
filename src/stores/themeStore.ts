import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

function applyTheme(mode: ThemeMode) {
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',

      setMode: (mode) => {
        set({ mode });
        applyTheme(mode);
      },

      toggleMode: () => {
        const current = get().mode;
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        set({ mode: next });
        applyTheme(next);
      },
    }),
    {
      name: 'autovizor-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.mode);
        }
      },
    }
  )
);

// Listen for system preference changes when mode is 'system'
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { mode } = useThemeStore.getState();
    if (mode === 'system') {
      applyTheme('system');
    }
  });
}
