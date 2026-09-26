
import React, { useState } from 'react';
import { Chat, StatusUpdate } from '../types';
import { MOCK_STATUS } from '../constants';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUser: { name: string; avatar: string; status: string };
  onSettingsClick: () => void;
  onAiClick: () => void;
}

const ChatItem: React.FC<{ chat: Chat; isActive: boolean; onSelectChat: (id: string) => void }> = ({ chat, isActive, onSelectChat }) => {
  const isChannel = chat.type === 'channel';
  const isGroup = chat.type === 'group';

  return (
    <div
      onClick={() => onSelectChat(chat.id)}
      className={`chat-item ${isActive ? 'active' : ''} ${isChannel ? 'is-channel' : ''}`}
    >
      <div className="avatar-wrapper">
        <img src={chat.user.avatar} alt={chat.user.name} className={`${chat.user.isBlocked ? 'grayscale opacity-50' : ''}`} />
        {chat.user.status === 'online' && !chat.user.isBlocked && !isChannel && (
          <div className="status-indicator"></div>
        )}
        {isChannel && (
          <div className="type-badge">
            <span className="material-symbols-outlined fill">campaign</span>
          </div>
        )}
      </div>
      <div className="chat-info">
        <div className="chat-name-row">
          <h4 className="flex items-center gap-1">
            {chat.user.name}
            {chat.user.isVerified && <span className="material-symbols-outlined text-sky-400 text-[14px] fill">verified</span>}
          </h4>
          <span>{chat.lastMessageTime}</span>
        </div>
        <div className="chat-message-row">
          <p>
            {chat.isMuted && <span className="material-symbols-outlined text-[14px] inline align-middle mr-1">notifications_off</span>}
            {isChannel ? <span className="text-primary font-bold">Channel • </span> : isGroup ? <span className="text-primary font-bold">Group • </span> : ''}
            {chat.lastMessage}
          </p>
          {chat.unreadCount > 0 && !isActive && !chat.isMuted && (
            <div className="unread-badge">{chat.unreadCount}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelectChat, currentUser, onSettingsClick, onAiClick }) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups' | 'channels'>('all');
  const [search, setSearch] = useState('');

  const filtered = chats.filter(c => {
    if (search && !c.user.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'unread' && c.unreadCount === 0) return false;
    if (filter === 'groups' && c.type !== 'group') return false;
    if (filter === 'channels' && c.type !== 'channel') return false;
    return true;
  });

  return (
    <aside className="chat-list-container">
      <div className="list-header">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Messages</h2>
          <button onClick={onSettingsClick} className="text-text-secondary hover:text-white transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        <div className="search-wrapper">
          <span className="material-symbols-outlined">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent border-0 ring-0 focus:ring-0 focus:border-0 shadow-none outline-none focus:outline-none"
          />
        </div>

        <div className="status-bar mt-6">
          <div className="status-item add-status">
            <div className="status-ring">
              <span className="material-symbols-outlined">add</span>
            </div>
            <span>My Status</span>
          </div>
          {MOCK_STATUS.map(status => (
            <div key={status.id} className="status-item">
              <div className={`status-ring ${status.isViewed ? 'viewed' : ''}`}>
                <img src={status.user.avatar} alt={status.user.name} />
              </div>
              <span>{status.user.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto mt-4 pb-2 no-scrollbar">
          {(['all', 'unread', 'groups', 'channels'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-1.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-primary text-background-dark' : 'bg-white/10 text-text-secondary hover:text-white'}`}
            >
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f === 'groups' ? 'Groups' : 'Channels'}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onAiClick} className="ai-assistant-btn">
        <div className="ai-icon">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div className="ai-info">
          <h4>Ask AI</h4>
          <p>Powered by NexChat</p>
        </div>
        <span className="material-symbols-outlined ai-sparkle">stars</span>
      </button>

      <div className="chat-scroll-area">
        {filtered.map(chat => (
          <ChatItem key={chat.id} chat={chat} isActive={selectedChatId === chat.id} onSelectChat={onSelectChat} />
        ))}
      </div>

      <div className="new-message-btn-wrapper">
        <button>
          <span className="material-symbols-outlined fill text-[20px]">add</span>
          <span>New Message</span>
        </button>
      </div>
    </aside>
  );
};

export default ChatList;
