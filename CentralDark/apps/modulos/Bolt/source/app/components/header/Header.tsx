import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';

function LogoCentralDarkAI() {
  return (
    <a
      href="/"
      className="flex items-center gap-2 select-none"
      style={{ textDecoration: 'none' }}
      aria-label="CentralDark AI — início"
    >
      {/* Ícone CD */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#b72422" />
        <rect width="32" height="32" rx="8" fill="url(#cdGlow)" />
        {/* Letra C */}
        <path
          d="M10 16c0-3.3 2.7-6 6-6 1.6 0 3 .6 4.1 1.6"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20.1 20.4C19 21.4 17.6 22 16 22c-3.3 0-6-2.7-6-6"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Letra D */}
        <path
          d="M22 11h-3v10h3c2.8 0 4.5-1.8 4.5-5s-1.7-5-4.5-5z"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <radialGradient id="cdGlow" cx="30%" cy="20%" r="70%">
            <stop offset="0" stopColor="#ff8a73" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ff8a73" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Texto */}
      <span
        style={{
          fontFamily: '"Geist", "Inter", ui-sans-serif, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: '15px',
          letterSpacing: '-0.02em',
          color: 'var(--bolt-elements-textPrimary)',
          lineHeight: 1,
        }}
      >
        CentralDark{' '}
        <span
          style={{
            color: 'hsl(152 65% 32%)',
            fontWeight: 800,
          }}
        >
          AI
        </span>
      </span>
    </a>
  );
}

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center px-4 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-3 z-logo">
        <div className="i-ph:sidebar-simple-duotone text-xl text-bolt-elements-textSecondary cursor-pointer" />
        <LogoCentralDarkAI />
      </div>

      {chat.started ? (
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <div className="flex items-center gap-2">
            <ClientOnly>{() => <ThemeSwitch />}</ClientOnly>
            <ClientOnly>
              {() => <HeaderActionButtons chatStarted={chat.started} />}
            </ClientOnly>
          </div>
        </>
      ) : (
        <div className="flex-1 flex justify-end items-center gap-2 pr-1">
          <ClientOnly>{() => <ThemeSwitch />}</ClientOnly>
        </div>
      )}
    </header>
  );
}
