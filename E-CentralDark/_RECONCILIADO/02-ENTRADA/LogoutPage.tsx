
import React from 'react';

interface LogoutPageProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutPage: React.FC<LogoutPageProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onCancel}
      ></div>

      {/* Confirmation Modal */}
      <div className="relative w-full max-w-[420px] bg-surface-dark border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transform transition-all animate-in zoom-in-95 fade-in duration-300">
        {/* Subtle Close Button */}
        <div className="flex justify-end p-4 pb-0">
          <button 
            onClick={onCancel}
            className="text-text-secondary hover:text-white transition-colors rounded-full p-1 hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center px-8 pb-10 pt-2 text-center">
          {/* Icon Visual */}
          <div className="mb-6 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-center size-20 rounded-full bg-gradient-to-b from-[#28392e] to-[#1a2c20] border border-white/10 shadow-inner">
              <span className="material-symbols-outlined text-[32px] text-primary fill">
                logout
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Signing out?
          </h2>
          
          <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-[300px]">
            Are you sure you want to log out? Your session will end and you'll be redirected to the login page.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={onConfirm}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-green-400 active:scale-[0.98] transition-all text-background-dark text-base font-bold leading-normal tracking-wide shadow-[0_0_15px_rgba(19,236,91,0.2)]"
            >
              <span>Yes, Log Out</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            
            <button 
              onClick={onCancel}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-transparent border border-white/10 hover:bg-white/5 hover:text-white text-text-secondary text-sm font-semibold leading-normal transition-all active:scale-[0.98]"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/20 py-3 px-6 border-t border-white/5 flex items-center justify-center gap-2">
          <div className="size-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">NexChat Secure</span>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
