
import React from 'react';
import { CallLog } from '../types';

interface CallHistoryProps {
  calls: CallLog[];
}

const CallHistory: React.FC<CallHistoryProps> = ({ calls }) => {
  return (
    <div className="chat-list-container">
      <header className="list-header">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Calls</h2>
          <button className="action-btn text-primary">
            <span className="material-symbols-outlined">add_call</span>
          </button>
        </div>
      </header>

      <div className="chat-scroll-area">
        {calls.map((call) => (
          <div key={call.id} className="chat-item">
            <div className="avatar-wrapper">
              <img src={call.user.avatar} alt="avatar" />
              <div className={`type-badge !bg-transparent border-none ${call.direction === 'missed' ? 'text-red-400' : 'text-primary'}`}>
                <span className="material-symbols-outlined !text-[12px]">
                  {call.direction === 'incoming' ? 'call_received' : call.direction === 'outgoing' ? 'call_made' : 'call_missed'}
                </span>
              </div>
            </div>

            <div className="chat-info">
              <div className="chat-name-row">
                <h4>{call.user.name}</h4>
                <span>{call.timestamp}</span>
              </div>
              <div className="chat-message-row">
                <p>{call.type === 'video' ? 'Video Call' : 'Audio Call'}</p>
                <span className="material-symbols-outlined text-[18px] opacity-40">
                  {call.type === 'video' ? 'videocam' : 'call'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallHistory;
