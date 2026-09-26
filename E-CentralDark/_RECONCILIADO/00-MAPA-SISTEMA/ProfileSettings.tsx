
import React, { useState } from 'react';
import { User } from '../types';
import { useThemeStore } from '../store/themeStore';

interface ProfileSettingsProps {
  user: User;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onClose }) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState('alex_doe99');
  const [bio, setBio] = useState("Hey there! I am using NexChat. 🚀");
  const [readReceipts, setReadReceipts] = useState(true);
  const { primaryColor, setPrimaryColor, mode, setMode } = useThemeStore();

  const THEME_COLORS = [
    { name: 'Emerald', hex: '#13ec5b' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Cyan', hex: '#06b6d4' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto scroll-smooth">
      <div className="max-w-5xl mx-auto w-full pb-24">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-md border-b border-white/5 px-6 lg:px-10 py-5 flex items-center justify-between transition-colors">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
              <span>Settings</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-white">Profile</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Profile Settings</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="hidden sm:flex items-center justify-center px-4 py-2 rounded-lg border border-white/5 text-slate-300 hover:bg-white/5 text-sm font-bold transition-colors">
              Cancel
            </button>
            <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#052e16] px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        </header>

        <div className="px-6 lg:px-10 py-8 space-y-8 animate-fade-in">
          {/* Profile Photo Card */}
          <div className="group bg-surface-dark rounded-2xl p-6 sm:p-8 border border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative">
                <div className="size-36 rounded-full bg-cover bg-center ring-4 ring-white/5 shadow-xl" style={{ backgroundImage: `url(${user.avatar})` }}></div>
                <button className="absolute bottom-1 right-1 size-10 flex items-center justify-center bg-primary text-background-dark rounded-full shadow-lg hover:scale-110 hover:bg-[#34fc75] transition-all border-2 border-background-dark">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-xl font-bold text-white">Profile Photo</h3>
                <p className="text-text-secondary text-sm max-w-md mx-auto sm:mx-0">Upload a new avatar. Larger images will be resized automatically. Maximum upload size is 5 MB.</p>
                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors">Upload New</button>
                  <button className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout for Forms and Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2 bg-surface-dark rounded-2xl p-6 sm:p-8 border border-white/5 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-white/5 pb-4 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-slate-300 group-focus-within:text-primary transition-colors">Display Name</label>
                  <div className="relative">
                    <input className="w-full h-12 bg-[#111a14] border border-[#3b5443] rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <span className="absolute right-4 top-3.5 text-text-secondary material-symbols-outlined text-[18px]">edit</span>
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-slate-300 group-focus-within:text-primary transition-colors">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-text-secondary text-base font-medium">@</span>
                    <input className="w-full h-12 bg-[#111a14] border border-[#3b5443] rounded-xl pl-8 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="space-y-2 group">
                <label className="text-sm font-bold text-slate-300 group-focus-within:text-primary transition-colors">About</label>
                <textarea className="w-full h-28 bg-[#111a14] border border-[#3b5443] rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none font-normal leading-relaxed" value={bio} onChange={(e) => setBio(e.target.value)} />
                <p className="text-xs text-right text-text-secondary">{bio.length}/140 characters</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Email Address</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-3.5 text-text-secondary material-symbols-outlined text-[20px]">mail</span>
                    <input className="w-full h-12 bg-black/20 border border-transparent rounded-xl pl-11 pr-4 text-text-secondary cursor-not-allowed font-medium" disabled type="email" value={user.phone ? "alex.doe@example.com" : ""} />
                  </div>
                  <button className="px-5 py-2 border border-[#3b5443] hover:bg-white/5 rounded-xl text-sm font-bold text-white transition-colors whitespace-nowrap">
                    Update Email
                  </button>
                </div>
                <p className="text-xs text-slate-500 pt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-green-500 fill">check_circle</span>
                  Verified
                </p>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-sm font-bold text-slate-300">Theme Mode</label>
                <div className="flex bg-black/20 p-1 rounded-xl">
                  <button
                    onClick={() => setMode('light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'light' ? 'bg-surface-dark text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">light_mode</span>
                    Light
                  </button>
                  <button
                    onClick={() => setMode('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'dark' ? 'bg-surface-dark text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                    Dark
                  </button>
                  <button
                    onClick={() => setMode('system')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'system' ? 'bg-surface-dark text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">computer</span>
                    System
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                <label className="text-sm font-bold text-slate-300">Theme Color</label>
                <div className="flex flex-wrap gap-4">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => setPrimaryColor(color.hex)}
                      className="group relative size-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2"
                      style={{
                        backgroundColor: color.hex,
                        borderColor: primaryColor === color.hex ? 'white' : 'transparent',
                        boxShadow: primaryColor === color.hex ? `0 0 15px ${color.hex}60` : 'none'
                      }}
                      title={color.name}
                    >
                      {primaryColor === color.hex && (
                        <span className="material-symbols-outlined text-white text-[18px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Privacy & Storage */}
            <div className="flex flex-col gap-6">
              {/* Privacy */}
              <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 shadow-sm">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shield</span>
                  Privacy
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex gap-3 items-center">
                      <div className="size-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Last Seen</p>
                        <p className="text-xs text-text-secondary">Everyone</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                  <div className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="flex gap-3 items-center">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">done_all</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-white">Read Receipts</p>
                        <p className="text-xs text-text-secondary">Show when you read messages</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <input type="checkbox" className="sr-only peer" checked={readReceipts} onChange={(e) => setReadReceipts(e.target.checked)} />
                      <div className="w-10 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex gap-3 items-center">
                      <div className="size-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">block</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Blocked</p>
                        <p className="text-xs text-text-secondary">12 contacts</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">cloud</span>
                  Storage
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-end">
                    <div className="flex flex-col">
                      <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Used</span>
                      <span className="text-white font-bold text-lg">1.2 GB</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Total</span>
                      <span className="text-white font-medium text-sm">5.0 GB</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: "24%" }}></div>
                    <div className="bg-blue-500 h-full" style={{ width: "15%" }}></div>
                    <div className="bg-purple-500 h-full" style={{ width: "8%" }}></div>
                  </div>
                  <div className="flex gap-3 mt-1 text-[11px] font-bold text-text-secondary">
                    <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-primary"></div> Media</div>
                    <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-blue-500"></div> Docs</div>
                    <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-purple-500"></div> Other</div>
                  </div>
                  <button className="w-full mt-2 py-2 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    MANAGE STORAGE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 border-t border-white/5 pt-8">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-red-400 font-bold text-lg">Delete Account</h4>
                <p className="text-red-400/70 text-sm mt-1">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button className="bg-transparent border border-red-500/50 text-red-400 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-500/10 transition-colors whitespace-nowrap">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
