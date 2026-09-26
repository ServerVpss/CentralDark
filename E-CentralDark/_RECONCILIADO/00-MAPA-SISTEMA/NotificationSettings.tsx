
import React from 'react';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-background-dark">
      <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col px-4 py-8 md:px-10">
        {/* Breadcrumbs & Heading */}
        <div className="mb-8 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <span>Settings</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-white">Notifications</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Notifications</h1>
          <p className="text-base font-normal text-text-secondary">Customize sounds, vibration, and pop-ups for your chats.</p>
        </div>

        {/* Action Panel: Desktop Permissions */}
        <div className="mb-8 rounded-xl border border-[#3b5443] bg-surface-dark p-5 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-full bg-background-dark p-3 text-primary md:block">
                <span className="material-symbols-outlined">laptop_mac</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-bold text-white">Turn on desktop notifications</p>
                <p className="text-sm text-text-secondary">Get notified of new messages even when the app is not in focus.</p>
              </div>
            </div>
            <button className="flex h-10 min-w-[100px] cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-background-dark transition-transform hover:scale-105 active:scale-95">
              Enable
            </button>
          </div>
        </div>

        {/* Global Section */}
        <div className="mb-6 flex flex-col divide-y divide-white/5 rounded-xl bg-surface-dark">
          <div className="flex min-h-[72px] items-center justify-between px-6 py-4">
            <div className="flex flex-col justify-center gap-1">
              <p className="text-base font-medium text-white">Conversation tones</p>
              <p className="text-sm text-text-secondary">Play sounds for incoming and outgoing messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Messages Section */}
        <div className="mb-2 px-2 pt-4">
          <h2 className="text-lg font-bold text-primary">Messages</h2>
        </div>
        <div className="mb-6 flex flex-col divide-y divide-white/5 rounded-xl bg-surface-dark">
          <button className="group flex min-h-[72px] items-center justify-between px-6 py-4 transition-colors hover:bg-white/5 text-left w-full">
            <div className="flex flex-col justify-center gap-1">
              <p className="text-base font-medium text-white">Notification tone</p>
              <p className="text-sm text-text-secondary">Default (Spaceline)</p>
            </div>
            <div className="flex items-center gap-3 text-text-secondary group-hover:text-white">
              <span className="text-sm font-medium">Spaceline</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </button>
          <button className="group flex min-h-[72px] items-center justify-between px-6 py-4 transition-colors hover:bg-white/5 text-left w-full">
            <div className="flex flex-col justify-center gap-1">
              <p className="text-base font-medium text-white">Vibrate</p>
              <p className="text-sm text-text-secondary">Default</p>
            </div>
            <div className="flex items-center gap-3 text-text-secondary group-hover:text-white">
              <span className="text-sm font-medium">Default</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </button>
          <div className="flex min-h-[72px] items-center justify-between px-6 py-4">
            <div className="flex flex-col justify-center gap-1">
              <p className="text-base font-medium text-white">High priority notifications</p>
              <p className="text-sm text-text-secondary">Show previews of notifications at the top of the screen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mb-12 flex justify-center pb-8">
          <button className="text-sm font-medium text-text-secondary transition-colors hover:text-white hover:underline">
            Reset notification settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
