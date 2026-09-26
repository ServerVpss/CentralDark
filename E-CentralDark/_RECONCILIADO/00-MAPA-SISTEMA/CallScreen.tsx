
import React from 'react';
import { User } from '../types';

interface CallScreenProps {
  user?: User;
  type: 'audio' | 'video';
  onEndCall: () => void;
}

const VideoCallView: React.FC<CallScreenProps> = ({ user, onEndCall }) => {
  return (
    <div className="video-call-fullscreen">
      {/* Remote User Full Screen */}
      <div className="remote-video">
        <img src={user?.avatar || "https://picsum.photos/seed/user-1/800/600"} alt="active-user" />
      </div>

      {/* Top Gradient Overlay for Header */}
      <div className="call-overlay-top">
        <header className="video-call-header">
          <div className="encryption-badge">
            <span className="material-symbols-outlined">lock</span>
            <span>End-to-end Encrypted</span>
            <div className="divider" />
            <span className="font-mono time">12:45</span>
          </div>
          <div className="header-actions">
            <button className="icon-btn"><span className="material-symbols-outlined">person_add</span></button>
            <button className="icon-btn"><span className="material-symbols-outlined">grid_view</span></button>
          </div>
        </header>
      </div>

      {/* Floating Picture-in-Picture (Local User) */}
      <div className="local-video-pip">
        <div className="local-video-content">ME</div>
        <div className="user-label">You</div>
      </div>

      {/* Floating Controls Dock */}
      <div className="call-overlay-bottom">
        <div className="controls-dock">
          <button className="dock-btn">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button className="dock-btn active">
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <button className="dock-btn">
            <span className="material-symbols-outlined">present_to_all</span>
          </button>
          <button className="dock-btn">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          <button onClick={onEndCall} className="dock-btn end-call">
            <span className="material-symbols-outlined">call_end</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const VoiceCallView: React.FC<CallScreenProps> = ({ user, onEndCall }) => {
  return (
    <div className="voice-call-immersive">
      {/* Abstract Background for Voice */}
      <div className="voice-bg-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="noise-overlay"></div>
      </div>

      <header className="voice-header">
        <button className="back-btn"><span className="material-symbols-outlined">expand_more</span></button>
        <div className="encryption-badge">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>End-to-end Encrypted</span>
        </div>
        <button className="icon-btn"><span className="material-symbols-outlined">person_add</span></button>
      </header>

      <div className="voice-center-stage">
        <div className="avatar-wrapper">
          <div className="sonic-waves">
            <span></span><span></span><span></span>
          </div>
          <div className="avatar-container">
            <img src={user?.avatar || "https://picsum.photos/seed/user-1/800/600"} alt="caller" />
          </div>
        </div>
        <div className="caller-details">
          <h2>{user?.name || "Sarah Jones"}</h2>
          <p className="call-status">02:45 &bull; Voice Calling</p>
        </div>
      </div>

      <div className="voice-controls-area">
        <div className="action-buttons-grid">
          <button className="action-btn">
            <span className="material-symbols-outlined">volume_up</span>
            <span className="btn-label">Speaker</span>
          </button>
          <button className="action-btn">
            <span className="material-symbols-outlined">videocam_off</span>
            <span className="btn-label">Video</span>
          </button>
          <button className="action-btn active-mic">
            <span className="material-symbols-outlined">mic_off</span>
            <span className="btn-label">Mute</span>
          </button>
        </div>

        <div className="end-call-wrapper">
          <button onClick={onEndCall} className="swipe-end-call">
            <span className="material-symbols-outlined">call_end</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CallScreen: React.FC<CallScreenProps> = (props) => {
  return props.type === 'video' ? <VideoCallView {...props} /> : <VoiceCallView {...props} />;
};

export default CallScreen;
