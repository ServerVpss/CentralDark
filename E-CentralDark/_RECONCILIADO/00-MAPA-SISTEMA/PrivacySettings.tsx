
import React from 'react';

interface PrivacySettingsProps {
  onClose: () => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onClose }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-background-dark">
      <div className="max-w-[800px] mx-auto w-full pb-20">
        {/* Breadcrumbs & Heading */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-6">
            <span>Settings</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-white">Privacy</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight">Privacy</h1>
            <p className="text-text-secondary text-base font-normal leading-normal max-w-xl">
              Control who sees your info and how you interact. Adjust settings to manage your digital footprint.
            </p>
          </div>
        </div>

        {/* Visibility Section */}
        <section className="mb-8">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-6 pb-3 pt-2 opacity-90">Visibility</h3>
          <div className="flex flex-col gap-1 px-4">
            {['Last seen & online', 'Profile photo', 'About', 'Status'].map((item, i) => (
              <button key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-dark hover:bg-surface-hover transition-all group w-full text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-white text-base font-medium">{item}</span>
                  <span className="text-text-secondary text-sm">{['Nobody', 'My contacts', 'Everyone', 'My contacts except...'][i]}</span>
                </div>
                <span className="material-symbols-outlined text-[#567261] group-hover:text-primary transition-colors">chevron_right</span>
              </button>
            ))}
          </div>
        </section>

        {/* Messaging Section */}
        <section className="mb-8">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-6 pb-3 pt-2 opacity-90">Messaging</h3>
          <div className="flex flex-col gap-1 px-4">
            <button className="flex items-center justify-between p-4 rounded-xl bg-surface-dark hover:bg-surface-hover transition-all group w-full text-left">
              <div className="flex flex-col gap-1">
                <span className="text-white text-base font-medium">Default message timer</span>
                <span className="text-text-secondary text-sm">Start new chats with disappearing messages set to your timer.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">Off</span>
                <span className="material-symbols-outlined text-[#567261] group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            </button>
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-dark hover:bg-surface-hover transition-all w-full mt-1">
              <div className="flex flex-col gap-1 pr-8">
                <span className="text-white text-base font-medium">Read receipts</span>
                <span className="text-text-secondary text-sm">If turned off, you won't send or receive Read Receipts. Read receipts are always sent for group chats.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="mb-12">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-6 pb-3 pt-2 opacity-90">Security</h3>
          <div className="flex flex-col gap-1 px-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-dark hover:bg-surface-hover transition-all w-full">
              <div className="flex flex-col gap-1 pr-8">
                <span className="text-white text-base font-medium">App Lock</span>
                <span className="text-text-secondary text-sm">Require fingerprint or face ID to unlock NexChat.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="flex justify-center items-center gap-2 px-8 opacity-60 mt-8 mb-4">
          <span className="material-symbols-outlined text-text-secondary text-[16px]">lock</span>
          <p className="text-text-secondary text-xs text-center">Your personal messages and calls are end-to-end encrypted.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
