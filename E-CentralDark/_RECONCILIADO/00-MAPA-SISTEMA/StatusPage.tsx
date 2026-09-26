
import React, { useState, useEffect } from 'react';
import { StatusUpdate, User } from '../types';

interface StatusPageProps {
  statuses: StatusUpdate[];
  me: User;
  onBack?: () => void;
}

const StatusPage: React.FC<StatusPageProps> = ({ statuses, me, onBack }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'recent' | 'archive'>('recent');
  const activeStatus = statuses[activeIndex];

  const handleNext = () => {
    if (activeIndex < statuses.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      onBack?.();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, statuses.length]);

  return (
    <div className="flex h-screen w-full bg-[#0a0f0d] overflow-hidden">
      {/* Left Sidebar: Status List (Visible on Desktop) */}
      <div className="hidden md:flex flex-col w-[400px] bg-dark-surface border-r border-white/5 z-20">
        <header className="h-[72px] px-6 flex items-center justify-between bg-dark-glass border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="action-btn">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">Status</h1>
          </div>
          <button className="action-btn">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Tabs */}
          <div className="flex px-6 pt-4 mb-2 gap-4">
            <button
              onClick={() => setActiveTab('recent')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'recent' ? 'text-primary border-primary' : 'text-dark-text-muted border-transparent'}`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'archive' ? 'text-primary border-primary' : 'text-dark-text-muted border-transparent'}`}
            >
              Archive
            </button>
          </div>

          {activeTab === 'recent' ? (
            <>
              {/* My Status */}
              <div className="flex items-center p-4 px-6 gap-4 hover:bg-white/5 cursor-pointer transition-all border-l-4 border-transparent">
                <div className="relative">
                  <img src={me.avatar} className="size-14 rounded-full object-cover border-2 border-primary p-0.5" alt="me" />
                  <div className="absolute bottom-0 right-0 size-5 bg-primary rounded-full border-2 border-dark-surface flex items-center justify-center text-dark-bg">
                    <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold">My Status</p>
                  <p className="text-xs text-dark-text-muted uppercase font-bold tracking-tight">Tap to add update</p>
                </div>
              </div>

              <div className="px-6 py-4">
                <h6 className="text-[11px] font-bold text-primary uppercase tracking-[2px]">Recent updates</h6>
              </div>

              {statuses.map((status, index) => (
                <div
                  key={status.id}
                  onClick={() => setActiveIndex(index)}
                  className={`flex items-center p-4 px-6 gap-4 cursor-pointer transition-all border-l-4 ${activeIndex === index ? 'bg-primary/5 border-primary' : 'hover:bg-white/5 border-transparent'}`}
                >
                  <div className={`p-0.5 rounded-full border-2 ${status.isViewed ? 'border-white/10' : 'border-primary'}`}>
                    <img src={status.user.avatar} className="size-12 rounded-full object-cover" alt="user" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{status.user.name}</p>
                    <p className="text-xs text-dark-text-muted uppercase font-bold tracking-tight">{status.time}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[9/16] rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5 shadow-lg">
                    <img src={`https://picsum.photos/seed/arch-${i}/400/800`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="arch" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-3 left-3">
                      <p className="text-[10px] font-bold text-white/80">May {10 + i}, 2025</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewing Stage */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-3xl"></div>
          <img src={activeStatus.image} className="w-full h-full object-cover opacity-40" alt="blur" />
        </div>

        <div className="absolute top-8 right-8 z-50">
          <button onClick={onBack} className="size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="relative w-full max-w-[500px] h-full sm:h-[90vh] sm:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] z-20 flex flex-col group/status">
          <img src={activeStatus.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/status:scale-105" alt="status-content" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90"></div>

          <div className="p-4 px-6 flex gap-1.5 w-full z-30">
            {statuses.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-[5000ms] ease-linear ${i < activeIndex ? 'w-full' : i === activeIndex ? 'w-full' : 'w-0'}`}
                  style={i === activeIndex ? { animation: 'status-progress 5s linear forwards' } : {}}
                ></div>
              </div>
            ))}
          </div>

          <div className="relative z-30 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-0.5 rounded-full border-2 border-primary">
                <img src={activeStatus.user.avatar} className="size-12 rounded-full object-cover" alt="avatar" />
              </div>
              <div className="flex flex-col text-white">
                <span className="font-extrabold text-lg tracking-tight">{activeStatus.user.name}</span>
                <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">{activeStatus.time}</span>
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-pointer" onClick={handlePrev}></div>
          <div className="absolute inset-y-0 right-0 w-1/4 z-40 cursor-pointer" onClick={handleNext}></div>

          <div className="mt-auto relative z-30 p-8 pt-12">
            <p className="text-white text-xl font-bold text-center mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {activeIndex % 2 === 0 ? "Enjoying the golden hour! 🌅✨" : "Design session in progress... 💻🚀"}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 relative group">
                <input
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all text-sm"
                  placeholder={`Reply to ${activeStatus.user.name.split(' ')[0]}...`}
                  type="text"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-primary">
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </button>
              </div>
              <button className="size-14 bg-primary hover:bg-green-400 text-black rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-primary/40 transform hover:-translate-y-1">
                <span className="material-symbols-outlined fill ml-1">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
