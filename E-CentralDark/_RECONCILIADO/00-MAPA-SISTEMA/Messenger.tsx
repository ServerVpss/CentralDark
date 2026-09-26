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
                  return { ...opt, votes: hasVoted ? opt.votes.filter(v => v !== 'me') : [...opt.votes, 'me'] };
                } else if (!multiple && !hasVoted) {
                  return { ...opt, votes: opt.votes.filter(v => v !== 'me') };
                }
                return opt;
              });
              return { ...m, pollData: { ...m.pollData, options } };
            }
            return m;
          })
        };
      }
      return c;
    }));
  }, []);

  const handleSendMessage = useCallback((id: string, text: string, replyTo?: Message, imageUrl?: string, media?: any[]) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === id) {
          const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: ME.name,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            type: imageUrl ? 'image' : media && media.length > 0 ? (media[0].type.startsWith('image') ? 'image' : 'file') : 'text',
            imageUrl: imageUrl || (media && media.length > 0 && media[0].type.startsWith('image') ? media[0].url : undefined),
            replyToId: replyTo?.id,
            replyText: replyTo?.text,
            media: media
          };

          // If it's the AI chat, trigger a mock response
          if (id === 'ai-chat') {
            setTimeout(() => {
              const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                senderId: 'ai-assistant',
                senderName: 'NexChat AI',
                text: getAiMockResponse(text),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'read',
                type: 'text'
              };
              setChats(current => current.map(c => c.id === 'ai-chat' ? {
                ...c,
                messages: [...c.messages, aiResponse],
                lastMessage: aiResponse.text,
                lastMessageTime: aiResponse.timestamp
              } : c));
            }, 1500);
          }

          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: imageUrl || (media && media.length > 0) ? "You: Sent an attachment" : `You: ${text}`,
            lastMessageTime: newMessage.timestamp
          };
        }
        return chat;
      });
      return updatedChats;
    });
  }, []);

  // Simple AI Response Logic
  const getAiMockResponse = (input: string): string => {
    const text = input.toLowerCase();
    if (text.includes('hello') || text.includes('hi')) return "Hello! How can I assist you today? I can help with information, coding, or just a chat.";
    if (text.includes('help')) return "I'm here to help! You can ask me about technologies like React, SCSS, or even about the weather!";
    if (text.includes('weather')) return "I'm an AI, but I'd guess it's a great day for coding! (You might want to check a weather app for real data though 😉)";
    if (text.includes('time')) return `The current time is ${new Date().toLocaleTimeString()}. Time to be productive!`;
    return "That's an interesting topic! Tell me more about it, or ask me something specific.";
  };

  const handleToggleBlock = (id: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === id
        ? { ...chat, user: { ...chat.user, isBlocked: !chat.user.isBlocked } }
        : chat
    ));
  };

  const handleToggleMute = (id: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === id ? { ...chat, isMuted: !chat.isMuted } : chat
    ));
  };

  const handleSetBackground = (id: string | 'global', url: string) => {
    if (id === 'global') {
      setGlobalBackground(url);
    } else {
      setChats(prev => prev.map(chat =>
        chat.id === id ? { ...chat, backgroundUrl: url } : chat
      ));
    }
  };

  const handleTabChange = (tab: NavTab) => {
    switch (tab) {
      case 'chat': navigate('/app/chats'); break;
      case 'groups': navigate('/app/groups'); break;
      case 'call': navigate('/app/calls'); break;
      case 'status': navigate('/app/status'); break;
      case 'settings': navigate('/app/settings'); break;
    }
  };

  const renderSettingsContent = () => {
    const handleClose = () => navigate('/app/chats');
    switch (settingsSection) {
      case 'profile': return <ProfileSettings user={ME} onClose={handleClose} />;
      case 'notifications': return <NotificationSettings onClose={handleClose} />;
      case 'privacy': return <PrivacySettings onClose={handleClose} />;
      case 'chats': return <ChatSettings onClose={handleClose} onSetGlobalBackground={(url) => handleSetBackground('global', url)} currentBackground={globalBackground} />;
      case 'help': return <HelpSettings onClose={handleClose} />;
      case 'storage': return <StorageSettings onClose={handleClose} />;
      default: return <ProfileSettings user={ME} onClose={handleClose} />;
    }
  };

  if (isCalling) {
    return <CallScreen onEndCall={() => setIsCalling(false)} />;
  }

  const isStatusMode = activeTab === 'status';

  return (
    <div className="messenger-container">
      {/* Sidebar Navigation */}
      <NavigationRail activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="messenger-main">
        {!isStatusMode && (
          <div className={`${(selectedChatId || activeTab === 'settings') ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] h-full shrink-0`}>
            {activeTab === 'chat' || activeTab === 'groups' ? (
              <ChatList
                chats={activeTab === 'groups' ? chats.filter(c => c.type === 'group') : chats}
                selectedChatId={selectedChatId}
                onSelectChat={(id) => navigate(`/app/chats/${id}`)}
                currentUser={ME}
                onSettingsClick={() => navigate('/app/settings')}
                onAiClick={() => navigate('/app/chats/ai-chat')}
              />
            ) : activeTab === 'call' ? (
              <CallHistory calls={MOCK_CALLS} />
            ) : activeTab === 'settings' ? (
              <SettingsSidebar
                currentUser={ME}
                activeSection={settingsSection}
                onSectionChange={setSettingsSection}
                onLogoutClick={() => setShowLogoutConfirm(true)}
              />
            ) : null}
          </div>
        )}

        <div className={`flex-1 flex flex-col min-w-0 ${(activeTab !== 'chat' && activeTab !== 'groups' && activeTab !== 'call') || selectedChatId ? 'flex' : 'hidden md:flex'}`}>
          {isStatusMode ? (
            <StatusPage statuses={MOCK_STATUS} me={ME} onBack={() => navigate('/app/chats')} />
          ) : activeTab === 'settings' ? (
            renderSettingsContent()
          ) : selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              globalBackground={globalBackground}
              onSendMessage={handleSendMessage}
              onSendPoll={handleSendPoll}
              onVotePoll={handleVotePoll}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onReactMessage={handleReactMessage}
              onCall={() => setIsCalling(true)}
              onBack={() => navigate('/app/chats')}
              onToggleBlock={() => handleToggleBlock(selectedChat.id)}
              onToggleMute={() => handleToggleMute(selectedChat.id)}
              onSetBackground={(url) => handleSetBackground(selectedChat.id, url)}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {!selectedChatId && (
        <div className="mobile-nav">
          {[
            { id: 'chat', label: 'Chats', icon: 'chat_bubble' },
            { id: 'groups', label: 'Groups', icon: 'groups' },
            { id: 'call', label: 'Calls', icon: 'call' },
            { id: 'status', label: 'Status', icon: 'donut_large' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as NavTab)}
              className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <span className={`material-symbols-outlined ${activeTab === item.id ? 'fill' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {showLogoutConfirm && (
        <LogoutPage onConfirm={() => navigate('/auth')} onCancel={() => setShowLogoutConfirm(false)} />
      )}
    </div>
  );
};

export default Messenger;
