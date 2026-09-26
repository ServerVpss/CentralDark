# COMANDO - Messenger.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\components\Messenger.tsx
**SHA:** ce5ecc2d2047698b
**Timestamp:** 2026-08-26T19:33:40.276310
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import { useState, useCallback, FC, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import NavigationRail, { NavTab } from './NavigationRail';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import EmptyState from './EmptyState';
import CallScreen from './CallScreen';
import CallHistory from './CallHistory';
import StatusPage from './StatusPage';
import SettingsSidebar from './SettingsSidebar';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import ChatSettings from './ChatSettings';
import HelpSettings from './HelpSettings';
import StorageSettings from './StorageSettings';
import ProfileSettings from './ProfileSettings';
import LogoutPage from './LogoutPage';
import { INITIAL_CHATS, ME, MOCK_CALLS, MOCK_STATUS } from '../constants';
import { Chat, Message } from '../types';

const Messenger: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId } = useParams<{ chatId: string }>();

  // Derive active tab from path
  const getActiveTab = (): NavTab => {
    const path = location.pathname;
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/calls')) return 'call';
    if (path.includes('/status')) return 'status';
    if (path.includes('/groups')) return 'groups';
    return 'chat';
  };

  const activeTab = getActiveTab();
  const selectedChatId = chatId || null;

  const [currentView, setCurrentView] = useState<'app' | 'auth'>('app'); // Local view state mainly for logout
  const [isCalling, setIsCalling] = useState(false);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [settingsSection, setSettingsSection] = useState('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [globalBackground, setGlobalBackground] = useState<string | undefined>(undefined);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  // Sync unread count clear
  useEffect(() => {
    if (selectedChatId) {
      setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, unreadCount: 0 } : c));
    }
  }, [selectedChatId]);

  const handleEditMessage = useCallback((chatId: string, messageId: string, text: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? { ...m, text, isEdited: true } : m)
        };
      }
      return c;
    }));
  }, []);

  const handleDeleteMessage = useCallback((chatId: string, messageId: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? { ...m, isDeleted: true, text: '' } : m)
        };
      }
      return c;
    }));
  }, []);

  const handleReactMessage = useCallback((chatId: string, messageId: string, emoji: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId) {
              const reactions = { ...(m.reactions || {}) };
              if (!reactions[emoji]) reactions[emoji] = [];
              if (reactions[emoji].includes('me')) {
                reactions[emoji] = reactions[emoji].filter((id: string) => id !== 'me');
                if (reactions[emoji].length === 0) delete reactions[emoji];
              } else {
                reactions[emoji].push('me');
              }
              return { ...m, reactions };
            }
            return m;
          })
        };
      }
      return c;
    }));
  }, []);

  const handleSendPoll = useCallback((chatId: string, pollData: any) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const newMessage: Message = {
          id: Date.now().toString(),
          senderId: 'me',
          senderName: ME.name,
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          type: 'poll',
          pollData
        };
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: "You: Created a poll",
          lastMessageTime: newMessage.timestamp
        };
      }
      return c;
    }));
  }, []);

  const handleVotePoll = useCallback((chatId: string, messageId: string, optionId: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && m.pollData) {
              const multiple = m.pollData.multipleAnswers;
              const options = m.pollData.options.map(opt => {
                const hasVoted = opt.votes.includes('me');
                if (opt.id === optionId) {
                  ret
```