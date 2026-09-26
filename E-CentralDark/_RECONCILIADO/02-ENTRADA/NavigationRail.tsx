
import React from 'react';

export type NavTab = 'chat' | 'groups' | 'call' | 'status' | 'settings';

interface NavigationRailProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const NavButton: React.FC<{ icon: string; isActive?: boolean; onClick: () => void; label?: string }> = ({ icon, isActive, onClick, label }) => (
  <button
    onClick={onClick}
    className={`nav-item ${isActive ? 'active' : ''}`}
    title={label}
  >
    <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{icon}</span>
  </button>
);

const NavigationRail: React.FC<NavigationRailProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="navigation-rail">
      <div className="flex flex-col items-center gap-8">
        <div className="logo cursor-pointer" onClick={() => onTabChange('chat')}>
          <span className="material-symbols-outlined fill">chat_bubble</span>
        </div>
        <div className="nav-items">
          <NavButton label="Chats" icon="chat" isActive={activeTab === 'chat'} onClick={() => onTabChange('chat')} />
          <NavButton label="Groups" icon="groups" isActive={activeTab === 'groups'} onClick={() => onTabChange('groups')} />
          <NavButton label="Calls" icon="call" isActive={activeTab === 'call'} onClick={() => onTabChange('call')} />
          <NavButton label="Status" icon="donut_large" isActive={activeTab === 'status'} onClick={() => onTabChange('status')} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-6">
        <NavButton label="Settings" icon="settings" isActive={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
        <div className="relative cursor-pointer group px-4">
          <div className="size-10 rounded-full bg-cover bg-center border-2 border-[#111813] outline outline-2 outline-primary/30 group-hover:outline-primary transition-all overflow-hidden">
            <img src="https://picsum.photos/seed/user-me/100/100" alt="Me" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-1 right-5 size-3 bg-primary rounded-full border-2 border-[#111813]"></div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationRail;
