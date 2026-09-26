
import React from 'react';
import { User } from '../types';

interface SettingsSidebarProps {
  currentUser: User;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogoutClick?: () => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ currentUser, activeSection, onSectionChange, onLogoutClick }) => {
  const menuItems = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'privacy', label: 'Privacy', icon: 'lock' },
    { id: 'chats', label: 'Chats', icon: 'chat' },
    { id: 'storage', label: 'Storage', icon: 'database' },
    { id: 'help', label: 'Help', icon: 'help' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-background-dark border-r border-white/5">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeSection === item.id 
                ? 'bg-primary/10 text-primary border border-primary/10' 
                : 'text-text-secondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined ${activeSection === item.id ? 'fill' : ''}`}>
              {item.icon}
            </span>
            <span className="font-semibold text-sm">{item.label}</span>
            {activeSection === item.id && (
              <div className="ml-auto size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,91,0.6)]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div 
          onClick={onLogoutClick}
          className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
        >
          <img src={currentUser.avatar} className="size-10 rounded-full border-2 border-white/10 object-cover" alt="User" />
          <div className="flex-1 min-w-0 flex flex-col">
            <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-primary font-medium truncate">Online</p>
          </div>
          <span className="material-symbols-outlined text-text-secondary group-hover:text-red-500 transition-colors text-[20px]">
            logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
