import { atom } from 'nanostores';
import { logStore } from './logs';

export type Theme = 'dark' | 'light' | 'emerald';

export const kTheme = 'bolt_theme';

export function themeIsDark() {
  return themeStore.get() === 'dark';
}

export const DEFAULT_THEME: Theme = 'light';

export const themeStore = atom<Theme>(initStore());

function initStore() {
  if (!import.meta.env.SSR) {
    const persistedTheme = localStorage.getItem(kTheme) as Theme | undefined;
    const themeAttribute = document.querySelector('html')?.getAttribute('data-theme');

    return persistedTheme ?? (themeAttribute as Theme) ?? DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

export function cycleTheme() {
  const themes: Theme[] = ['dark', 'light', 'emerald'];
  const currentTheme = themeStore.get();
  const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];

  themeStore.set(nextTheme);
  localStorage.setItem(kTheme, nextTheme);
  document.querySelector('html')?.setAttribute('data-theme', nextTheme);

  try {
    const userProfile = localStorage.getItem('bolt_user_profile');

    if (userProfile) {
      const profile = JSON.parse(userProfile);
      profile.theme = nextTheme;
      localStorage.setItem('bolt_user_profile', JSON.stringify(profile));
    }
  } catch {
    // silencioso
  }

  logStore.logSystem(`Tema alterado para ${nextTheme}`);
}

// mantido para compatibilidade com código legado que chama toggleTheme
export function toggleTheme() {
  cycleTheme();
}
