
import React from 'react';
import { User } from '../types';

interface MessageReadHUDProps {
    readers: User[];
    onClose: () => void;
}

const MessageReadHUD: React.FC<MessageReadHUDProps> = ({ readers, onClose }) => {
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Content */}
            <div className="relative w-full max-w-[380px] bg-dark-surface rounded-3xl border border-white/5 shadow-2xl overflow-hidden animate-slide-up">
                <header className="px-6 py-5 border-bottom flex items-center justify-between">
                    <h3 className="text-lg font-bold">Message Info</h3>
                    <button onClick={onClose} className="action-btn text-dark-text-muted hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>

                <div className="p-2 max-h-[400px] overflow-y-auto">
                    <div className="px-4 py-3 flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[20px]">done_all</span>
                            <span className="text-sm font-bold uppercase tracking-wider">Read by</span>
                        </div>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
                            {readers.length} Members
                        </span>
                    </div>

                    <div className="space-y-1">
                        {readers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 px-4 hover:bg-white/5 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={user.avatar} className="size-11 rounded-full object-cover border border-white/10" alt={user.name} />
                                        {user.status === 'online' && (
                                            <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-dark-surface"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{user.name}</h4>
                                        <p className="text-[10px] text-dark-text-muted uppercase font-bold tracking-tight">Today, 10:45 AM</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">check_circle</span>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="p-4 bg-dark-bg/40 text-center">
                    <p className="text-[10px] text-dark-text-muted flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        End-to-end encrypted info
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default MessageReadHUD;
