
import React from 'react';

interface StorageSettingsProps {
  onClose: () => void;
}

const StorageSettings: React.FC<StorageSettingsProps> = ({ onClose }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-background-dark">
      <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col px-6 py-8">
        <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-6">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-white">Storage</span>
        </div>
        
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Storage</h1>
          <p className="text-base font-normal text-text-secondary">Manage your device storage and data usage.</p>
        </div>

        <div className="bg-surface-dark rounded-2xl p-8 border border-white/5 shadow-sm space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">cloud</span>
              Storage Usage
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm items-end">
                <div className="flex flex-col">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Used</span>
                  <span className="text-white font-bold text-2xl">1.2 GB</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Total Space</span>
                  <span className="text-white font-medium text-sm">5.0 GB</span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: "24%" }}></div>
                <div className="bg-blue-500 h-full" style={{ width: "15%" }}></div>
                <div className="bg-purple-500 h-full" style={{ width: "8%" }}></div>
              </div>
              <div className="flex gap-6 mt-1 text-xs font-bold text-text-secondary">
                <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-primary"></div> Media (800 MB)</div>
                <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-blue-500"></div> Documents (320 MB)</div>
                <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-purple-500"></div> Other (110 MB)</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <h3 className="text-base font-bold text-white">Data Auto-download</h3>
            <div className="space-y-4">
              {[
                { label: 'When using mobile data', value: 'Photos' },
                { label: 'When connected on Wi-Fi', value: 'All media' },
                { label: 'When roaming', value: 'No media' }
              ].map((item) => (
                <button key={item.label} className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-white/5 transition-colors group text-left">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-text-secondary text-sm">{item.value}</p>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-primary">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <button className="w-full py-4 text-red-500 hover:bg-red-500/10 rounded-xl font-bold transition-colors border border-red-500/20">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageSettings;
