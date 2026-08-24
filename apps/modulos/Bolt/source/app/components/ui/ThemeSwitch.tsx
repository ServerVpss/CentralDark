import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import { themeStore, cycleTheme, type Theme } from '~/lib/stores/theme';

interface ThemeSwitchProps {
  className?: string;
}

const THEME_CONFIG: Record<Theme, { label: string; next: string; icon: string }> = {
  dark: {
    label: 'Escuro',
    next: 'Branco',
    icon: 'i-ph-moon-stars-duotone',
  },
  light: {
    label: 'Claro',
    next: 'Esmeralda',
    icon: 'i-ph-sun-dim-duotone',
  },
  emerald: {
    label: 'Esmeralda',
    next: 'Operacional',
    icon: 'i-ph-leaf-duotone',
  },
  operational: {
    label: 'Operacional',
    next: 'Forja',
    icon: 'i-ph-broadcast-duotone',
  },
  forge: {
    label: 'Forja',
    next: 'Escuro',
    icon: 'i-ph-fire-duotone',
  },
};

export const ThemeSwitch = memo(({ className }: ThemeSwitchProps) => {
  const theme = useStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  if (!domLoaded) {
    return null;
  }

  const config = THEME_CONFIG[theme] ?? THEME_CONFIG.light;

  return (
    <div className={`flex items-center gap-1 rounded-lg p-0.5 ${className ?? ''}`}
      style={{ background: 'var(--bolt-elements-bg-depth-3, rgba(0,0,0,0.08))' }}
    >
      {(Object.entries(THEME_CONFIG) as [Theme, typeof THEME_CONFIG[Theme]][]).map(([t, cfg]) => {
        const isActive = theme === t;
        const dot =
          t === 'dark'
            ? '#0a0a0a'
            : t === 'light'
              ? '#f5f5f5'
              : t === 'emerald'
                ? 'hsl(152 65% 32%)'
                : t === 'operational'
                  ? '#4fc3ff'
                  : '#c0902b';

        return (
          <button
            key={t}
            type="button"
            onClick={cycleTheme}
            title={`Tema ${cfg.label} — clique para ir para ${config.next}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: isActive ? '4px 10px' : '4px 8px',
              borderRadius: '6px',
              border: isActive ? '1px solid var(--bolt-elements-borderColorActive, #9c7dff)' : '1px solid transparent',
              background: isActive ? 'var(--bolt-elements-bg-depth-1, white)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--bolt-elements-textPrimary)',
              whiteSpace: 'nowrap' as const,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: dot,
                border: t === 'light' ? '1px solid #d4d4d4' : 'none',
                flexShrink: 0,
              }}
            />
            {isActive && <span>{cfg.label}</span>}
          </button>
        );
      })}
    </div>
  );
});
