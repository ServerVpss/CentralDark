import { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Documentation from './components/Documentation';
import Messenger from './components/Messenger';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

const App: FC = () => {
  const { primaryColor, mode } = useThemeStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const isDark =
        mode === 'dark' ||
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Login />} />
        <Route path="/docs" element={<Documentation />} />

        {/* Messenger Routes */}
        <Route path="/app" element={<Navigate to="/app/chats" replace />} />
        <Route path="/app/chats" element={<Messenger />} />
        <Route path="/app/chats/:chatId" element={<Messenger />} />
        <Route path="/app/groups" element={<Messenger />} />
        <Route path="/app/groups/:chatId" element={<Messenger />} />
        <Route path="/app/calls" element={<Messenger />} />
        <Route path="/app/status" element={<Messenger />} />
        <Route path="/app/settings" element={<Messenger />} />
      </Routes >
    </BrowserRouter >
  );
};

export default App;
