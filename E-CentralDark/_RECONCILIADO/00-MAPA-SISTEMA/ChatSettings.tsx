
import React, { useRef } from 'react';

interface ChatSettingsProps {
  onClose: () => void;
  onSetGlobalBackground: (url: string) => void;
  currentBackground?: string;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ onClose, onSetGlobalBackground, currentBackground }) => {
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onSetGlobalBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-dark">
      <div className="max-w-[960px] mx-auto px-6 py-10 md:px-12">
        {/* Breadcrumbs & Heading */}
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <span>Settings</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-white">Chats</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Chats</h1>
          <p className="text-text-secondary text-base">Customize your chat experience, wallpaper, and history.</p>
        </div>

        {/* Display Section */}
        <section className="mb-10">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Display</h3>
          <div className="bg-surface-dark rounded-xl p-6 border border-white/5 mb-6">
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium text-slate-300">App Theme</label>
              <div className="grid grid-cols-3 gap-4">
                {['System default', 'Light', 'Dark'].map((theme) => (
                  <label key={theme} className="cursor-pointer group relative">
                    <input className="peer sr-only" name="theme" type="radio" defaultChecked={theme === 'Dark'} />
                    <div className="flex items-center justify-center h-12 rounded-lg border border-white/10 text-slate-300 peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/5 transition-all">
                      <span className="text-sm font-medium">{theme}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-surface-dark rounded-xl p-1 border border-white/5 overflow-hidden">
            <div className="flex flex-col sm:flex-row p-5 gap-6">
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Default Wallpaper</h4>
                  <p className="text-sm text-text-secondary">Choose a background for all chat conversations. Individual chat themes will override this.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => bgInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg transition-all text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">palette</span>
                    Change Wallpaper
                  </button>
                  {currentBackground && (
                    <button 
                      onClick={() => onSetGlobalBackground('')}
                      className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleBackgroundUpload} />
              </div>
              <div className="w-full sm:w-1/3 aspect-video sm:aspect-auto sm:h-32 rounded-lg bg-cover bg-center shadow-inner relative overflow-hidden group cursor-pointer" style={{ backgroundImage: `url(${currentBackground || 'https://picsum.photos/seed/wallpaper/400/300'})` }}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 p-3 flex flex-col justify-end gap-2">
                  <div className="bg-surface-dark/80 self-start p-1.5 px-3 rounded-lg rounded-tl-none text-[8px] text-white w-2/3 backdrop-blur-sm">Hey, nice wallpaper!</div>
                  <div className="bg-primary self-end p-1.5 px-3 rounded-lg rounded-tr-none text-[8px] text-black font-medium w-1/2">I know right? 😎</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Settings Section */}
        <section className="mb-10">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Chat Settings</h3>
          <div className="bg-surface-dark rounded-xl border border-white/5 divide-y divide-white/5">
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gray-500 mt-0.5">keyboard_return</span>
                <div>
                  <p className="text-sm font-medium text-white">Enter is Send</p>
                  <p className="text-xs text-text-secondary mt-0.5">Enter key will send your message</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gray-500 mt-0.5">image</span>
                <div>
                  <p className="text-sm font-medium text-white">Media Visibility</p>
                  <p className="text-xs text-text-secondary mt-0.5">Show newly downloaded media in your gallery</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gray-500 mt-0.5">text_fields</span>
                <div>
                  <p className="text-sm font-medium text-white">Font Size</p>
                  <p className="text-xs text-text-secondary mt-0.5">Adjust text size for messages</p>
                </div>
              </div>
              <select className="bg-[#111813] border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[120px]">
                <option>Small</option>
                <option selected>Medium</option>
                <option>Large</option>
              </select>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mb-20">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Chat History</h3>
          <div className="bg-surface-dark rounded-xl border border-white/5 divide-y divide-white/5">
            <button className="w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center gap-3 group">
              <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors">upload_file</span>
              <span className="text-sm font-medium text-gray-200">Export chat history</span>
            </button>
            <button className="w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center gap-3 group">
              <span className="material-symbols-outlined text-gray-500 group-hover:text-red-400 transition-colors">delete</span>
              <span className="text-sm font-medium text-red-500">Delete all chats</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatSettings;
