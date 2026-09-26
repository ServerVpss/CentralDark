
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <main className="hidden md:flex flex-1 flex-col items-center justify-center bg-surface-dark relative overflow-hidden h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-hover to-background-dark"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 flex flex-col items-center text-center w-full px-6">
        <div className="size-64 md:size-80 mb-12 relative animate-float">
          <div className="absolute inset-0 bg-primary/10 rounded-[40px] blur-2xl animate-pulse"></div>
          <div className="absolute inset-0 bg-surface-hover rounded-3xl border border-white/5 shadow-2xl flex items-center justify-center transform rotate-6 scale-95 opacity-50"></div>
          <div className="absolute inset-0 bg-surface-hover rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center transform -rotate-3 scale-95 opacity-50"></div>
          <div className="absolute inset-0 bg-background-dark rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
            <div className="h-10 bg-surface-hover border-b border-white/5 flex items-center px-4 gap-2">
              <div className="size-2.5 rounded-full bg-red-500/30"></div>
              <div className="size-2.5 rounded-full bg-yellow-500/30"></div>
              <div className="size-2.5 rounded-full bg-green-500/30"></div>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="h-3 w-1/3 bg-white/5 rounded-full"></div>
              <div className="self-end h-10 w-3/4 bg-primary/10 rounded-2xl rounded-tr-none border border-primary/20"></div>
              <div className="h-10 w-2/3 bg-white/5 rounded-2xl rounded-tl-none border border-white/5"></div>
              <div className="self-end h-10 w-1/2 bg-primary/10 rounded-2xl rounded-tr-none border border-primary/20"></div>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 size-20 bg-primary rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(19,236,91,0.3)] transform rotate-12">
            <span className="material-symbols-outlined text-background-dark text-[40px] fill">forum</span>
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Download <span className="text-primary italic">NexChat</span> Desktop
        </h2>
        <p className="text-text-secondary text-xl mb-10 leading-relaxed max-w-2xl">
          Experience seamless messaging with our native desktop app.
          Stay connected across all your devices with end-to-end encryption.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
          <button className="bg-primary text-background-dark px-10 h-14 rounded-2xl font-black hover:scale-105 transition-transform flex items-center gap-3">
            <span className="material-symbols-outlined fill">download</span>
            Download for Windows
          </button>
          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-text-secondary">
            <span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
            <span className="font-bold">Beta v1.0.0</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-text-secondary/40 text-sm font-medium">
        Version 1.0.0
      </div>
    </main>
  );
};

export default EmptyState;
