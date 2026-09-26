
import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message, User } from '../types';
import MessageReadHUD from './MessageReadHUD';

interface ChatWindowProps {
  chat: Chat;
  globalBackground?: string;
  onSendMessage: (chatId: string, text: string, replyTo?: Message, imageUrl?: string, media?: any[]) => void;
  onSendPoll?: (chatId: string, pollData: any) => void;
  onVotePoll?: (chatId: string, messageId: string, optionId: string) => void;
  onEditMessage?: (chatId: string, messageId: string, text: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string) => void;
  onReactMessage?: (chatId: string, messageId: string, emoji: string) => void;
  onCall: () => void;
  onBack?: () => void;
  onToggleBlock: () => void;
  onToggleMute: () => void;
  onSetBackground: (url: string) => void;
}

const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'
];

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  globalBackground,
  onSendMessage,
  onSendPoll,
  onVotePoll,
  onEditMessage,
  onDeleteMessage,
  onReactMessage,
  onCall,
  onBack,
  onToggleBlock,
  onToggleMute,
  onSetBackground
}) => {
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [pendingMedia, setPendingMedia] = useState<{ url: string, name: string, type: string, file: File, progress: number }[]>([]);
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPinned, setShowPinned] = useState(true);
  const [showReadHUD, setShowReadHUD] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ id: '1', text: '' }, { id: '2', text: '' }]);
  const [pollMultiple, setPollMultiple] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFilesSelected = (files: File[]) => {
    const newMedia = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      file,
      progress: 0
    }));
    setPendingMedia(prev => [...prev, ...newMedia]);

    // Simulate upload progress
    newMedia.forEach((media, index) => {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 20;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
        }
        setPendingMedia(current => current.map(m => m.name === media.name ? { ...m, progress: prog } : m));
      }, 200 + index * 50);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOtherTyping(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (chat.user.isBlocked) return;
    if (pendingMedia.some(m => m.progress < 100)) return; // wait for upload
    if (!inputText.trim() && pendingMedia.length === 0) return;

    if (editingMessage && onEditMessage) {
      onEditMessage(chat.id, editingMessage.id, inputText.trim());
      setEditingMessage(null);
    } else {
      const mediaToSend = pendingMedia.map(m => ({ url: m.url, name: m.name, type: m.type, size: m.file.size }));
      onSendMessage(chat.id, inputText.trim(), replyingTo || undefined, mediaToSend[0]?.url, mediaToSend);
    }
    setInputText('');
    setReplyingTo(null);
    setPendingMedia([]);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onSetBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  // Auto-show info on very wide screens
  useEffect(() => {
    if (window.innerWidth > 1400) {
      setShowInfo(true);
    }
  }, []);

  const isGroup = chat.type === 'group';
  const isChannel = chat.type === 'channel';
  const effectiveBg = chat.backgroundUrl || globalBackground;

  return (
    <div className="chat-window" onDragOver={handleDragOver}>
      <main className="main-chat-area">
        {/* Header */}
        <header className="chat-header">
          <div className="user-info cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
            {onBack && (
              <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="md:hidden action-btn mr-2">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <div className="relative">
              <img src={chat.user.avatar} alt={chat.user.name} />
              {chat.user.status === 'online' && !isGroup && !isChannel && (
                <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-[#0a0f0c]"></div>
              )}
            </div>
            <div className="details">
              <h3>{chat.user.name}</h3>
              <p>{chat.user.status === 'online' ? 'Online' : chat.user.lastSeen || 'Offline'}</p>
            </div>
          </div>
          <div className="header-actions">
            {!isChannel && !chat.user.isBlocked && (
              <>
                <button onClick={onCall} className="action-btn hidden sm:flex">
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button onClick={onCall} className="action-btn hidden sm:flex">
                  <span className="material-symbols-outlined">call</span>
                </button>
              </>
            )}
            <button className="action-btn">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button onClick={() => setShowInfo(!showInfo)} className={`action-btn ${showInfo ? 'text-primary' : ''}`}>
              <span className="material-symbols-outlined">info</span>
            </button>
          </div>
        </header>

        {showPinned && (
          <div className="pinned-message-bar">
            <span className="material-symbols-outlined pin-icon">push_pin</span>
            <div className="pinned-content">
              <h4>Pinned Message</h4>
              <p>Welcome to NexChat! Check our latest features in the Documentation section.</p>
            </div>
            <button onClick={() => setShowPinned(false)} className="close-pinned">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="messages-container"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={effectiveBg ? {
            backgroundImage: `url(${effectiveBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'local'
          } : {}}
        >
          {effectiveBg && <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>}

          {isDragging && (
            <div className="drag-overlay">
              <div className="overlay-content">
                <span className="material-symbols-outlined">upload_file</span>
                <h3>Drop to send images</h3>
                <p>Support PNG, JPG and GIF</p>
              </div>
            </div>
          )}

          <div className="messages-inner relative z-10">
            {chat.messages.map((message) => {
              const isMe = message.senderId === 'me';
              const isAi = message.senderId === 'ai-assistant';
              return (
                <div key={message.id} className={`message-row ${isMe ? 'me' : 'them'} ${isAi ? 'ai' : ''} ${focusedMessageId === message.id ? 'z-50' : 'z-10'}`}>
                  {!isMe && (
                    <img src={message.senderAvatar || chat.user.avatar} className="size-8 rounded-full mt-auto shrink-0 object-cover" alt="avatar" />
                  )}
                  <div className="flex flex-col gap-1 relative">
                    {message.replyText && (
                      <div className="bg-white/5 border-l-2 border-primary/50 px-2 py-1 rounded mb-1 text-[10px] text-text-secondary truncate">
                        {message.replyText}
                      </div>
                    )}

                    <div
                      className={`message-bubble group ${message.isDeleted ? 'opacity-60 italic border border-white/10 bg-transparent' : ''}`}
                      onContextMenu={(e) => { e.preventDefault(); setFocusedMessageId(focusedMessageId === message.id ? null : message.id); }}
                    >
                      {focusedMessageId === message.id && !message.isDeleted && (
                        <div className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} bg-dark-glass backdrop-blur-md border border-white/20 rounded-full px-3 py-2 flex items-center gap-1 shadow-2xl z-[100] min-w-max`}>
                          {['👍', '❤️', '🔥', '😂', '😮', '😢'].map(emoji => (
                            <button key={emoji} className="hover:scale-125 hover:bg-white/10 p-1 rounded transition-all text-lg" onClick={(e) => {
                              e.stopPropagation();
                              if (onReactMessage) onReactMessage(chat.id, message.id, emoji);
                              setFocusedMessageId(null);
                            }}>{emoji}</button>
                          ))}
                          {isMe && (
                            <div className="flex items-center gap-1 border-l border-white/30 pl-2 ml-1">
                              <button className="hover:text-primary hover:bg-white/10 p-1.5 rounded-full transition-all text-xs text-white" onClick={(e) => {
                                e.stopPropagation();
                                setEditingMessage(message);
                                setInputText(message.text);
                                setFocusedMessageId(null);
                              }}><span className="material-symbols-outlined text-[18px]">edit</span></button>
                              <button className="hover:text-danger hover:bg-white/10 p-1.5 rounded-full transition-all text-xs text-white" onClick={(e) => {
                                e.stopPropagation();
                                if (onDeleteMessage) onDeleteMessage(chat.id, message.id);
                                setFocusedMessageId(null);
                              }}><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            </div>
                          )}
                        </div>
                      )}

                      {message.isDeleted ? (
                        <p className="flex items-center gap-2 text-dark-text-muted">
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          This message was deleted
                        </p>
                      ) : (
                        <>
                          {message.type === 'audio' && (
                            <div className="audio-message">
                              <button className="play-btn">
                                <span className="material-symbols-outlined fill">play_arrow</span>
                              </button>
                              <div className="waveform">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => (
                                  <span key={i} className={i < 8 ? 'active' : ''} style={{ height: `${Math.random() * 100}%` }}></span>
                                ))}
                              </div>
                              <span className="duration">0:42</span>
                            </div>
                          )}

                          {message.text && (
                            <>
                              <p>
                                {message.text}
                                {message.isEdited && <span className="text-[10px] opacity-50 ml-2 italic">(edited)</span>}
                              </p>
                              {(message.text.includes('http://') || message.text.includes('https://')) && (
                                <div className="link-preview">
                                  <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" className="preview-image" alt="preview" />
                                  <div className="preview-content">
                                    <p className="site-name">Dribbble.com</p>
                                    <h4 className="title">Premium Messenger Dashboard UI Concept</h4>
                                    <p className="description">Exploration of a dark Template messenger interface with glassmorphism and aurora background effects.</p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {message.type === 'poll' && message.pollData && (
                            <div className="w-full sm:w-[280px] p-2">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary text-xl">poll</span>
                                <h4 className="font-bold text-sm leading-tight text-white">{message.pollData.question}</h4>
                              </div>
                              <p className="text-[10px] text-dark-text-muted mb-3 uppercase tracking-wider font-bold">
                                {message.pollData.multipleAnswers ? 'Select multiple options' : 'Select one option'}
                              </p>
                              <div className="flex flex-col gap-2">
                                {message.pollData.options.map(option => {
                                  const totalVotes = message.pollData!.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                                  const percent = totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100);
                                  const hasVoted = option.votes.includes('me');

                                  return (
                                    <button
                                      key={option.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onVotePoll) onVotePoll(chat.id, message.id, option.id);
                                      }}
                                      className={`relative overflow-hidden text-left p-2.5 rounded-lg border transition-all duration-300 ${hasVoted ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
                                    >
                                      {hasVoted && <div className="absolute top-0 left-0 h-full bg-primary/20 pointer-events-none transition-all duration-700 ease-out" style={{ width: `${percent}%` }}></div>}
                                      {!hasVoted && percent > 0 && <div className="absolute top-0 left-0 h-full bg-white/5 pointer-events-none transition-all duration-700 ease-out" style={{ width: `${percent}%` }}></div>}
                                      <div className="relative z-10 flex justify-between items-center w-full">
                                        <div className="flex items-center gap-2 max-w-[80%]">
                                          <div className={`shrink-0 size-4 border ${message.pollData!.multipleAnswers ? 'rounded' : 'rounded-full'} flex items-center justify-center transition-colors ${hasVoted ? 'border-primary bg-primary' : 'border-white/30'}`}>
                                            {hasVoted && <span className="material-symbols-outlined text-[12px] text-background-dark font-bold">check</span>}
                                          </div>
                                          <span className={`text-sm truncate ${hasVoted ? 'font-bold text-white' : 'text-slate-200'}`}>{option.text}</span>
                                        </div>
                                        {totalVotes > 0 && <span className={`text-xs font-bold shrink-0 ${hasVoted ? 'text-primary' : 'text-dark-text-muted'}`}>{percent}%</span>}
                                      </div>
                                      {option.votes.length > 0 && (
                                        <div className="flex -space-x-1.5 mt-2 relative z-10 px-6">
                                          {option.votes.map((voterId, vi) => (
                                            <div key={vi} className="size-4 rounded-full bg-gray-600 border border-[#0a0f0c] shadow-sm flex items-center justify-center overflow-hidden">
                                              {voterId === 'me' ? <span className="text-[6px] font-bold text-white">Me</span> : <span className="material-symbols-outlined text-[10px] text-white">person</span>}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="mt-3 text-[10px] text-dark-text-muted text-right">
                                {message.pollData.options.reduce((sum, opt) => sum + opt.votes.length, 0)} votes
                              </div>
                            </div>
                          )}

                          {message.media && message.media.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.media.map((m, i) => (
                                m.type.startsWith('image/') ? (
                                  <img key={i} src={m.url} className="rounded-lg max-w-[200px] max-h-[200px] object-cover" alt="media" />
                                ) : (
                                  <div key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg text-sm border border-white/10 w-full max-w-[250px]">
                                    <span className="material-symbols-outlined shadow-md opacity-80 text-xl">insert_drive_file</span>
                                    <div className="truncate text-xs">{m.name}</div>
                                  </div>
                                )
                              ))}
                            </div>
                          )}

                          <span className="message-time mt-1 relative">
                            {message.timestamp}
                            {isMe && (
                              <span
                                onClick={(e) => { e.stopPropagation(); setShowReadHUD(true); }}
                                className={`material-symbols-outlined checkmark-animated text-[12px] ml-1 cursor-pointer ${message.status === 'read' ? 'read' : ''}`}>
                                {message.status === 'read' ? 'done_all' : 'done'}
                              </span>
                            )}
                          </span>

                          {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <div className="flex flex-wrap gap-1 absolute -bottom-3 right-0 justify-end z-10 w-full px-2">
                              {Object.entries(message.reactions).map(([emoji, users]) => (
                                <div key={emoji} className="bg-dark-surface-light border border-white/10 rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-md">
                                  <span>{emoji}</span>
                                  <span className="opacity-80 font-bold">{(users as string[]).length}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {chat.user.status === 'online' && !isOtherTyping && (
              <div className="message-row them">
                <img src={chat.user.avatar} className="size-8 rounded-full mt-auto object-cover" alt="avatar" />
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <footer className="chat-input-area">
          <div className="input-inner">
            {isChannel ? (
              <div className="channel-actions-bar w-full">
                <div className="flex flex-col">
                  <p className="text-sm font-bold">Broadcast Channel</p>
                  <p className="text-xs text-dark-text-muted">Only admins can send messages</p>
                </div>
                <button
                  onClick={onToggleMute}
                  className={`px-8 py-2 rounded-xl font-bold transition-all ${chat.isMuted ? 'bg-white/10 text-white' : 'bg-primary text-background-dark'}`}
                >
                  {chat.isMuted ? 'Unmute' : 'Mute Notifications'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 flex flex-col relative">
                  {editingMessage && (
                    <div className="mb-3 p-2 bg-dark-surface-light rounded-lg border-l-4 border-warning flex justify-between items-center shadow-md">
                      <div className="truncate flex items-center gap-2">
                        <span className="material-symbols-outlined text-warning text-[18px]">edit</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-warning">Editing Message</p>
                          <p className="text-xs text-text-secondary truncate">{editingMessage.text}</p>
                        </div>
                      </div>
                      <button onClick={() => { setEditingMessage(null); setInputText(''); }} className="text-text-secondary hover:text-white ml-2"><span className="material-symbols-outlined text-[18px]">close</span></button>
                    </div>
                  )}
                  {replyingTo && !editingMessage && (
                    <div className="mb-3 p-2 bg-dark-surface-light rounded-lg border-l-4 border-primary flex justify-between items-center shadow-md">
                      <div className="truncate">
                        <p className="text-[10px] font-bold text-primary">Replying to {replyingTo.senderName}</p>
                        <p className="text-xs text-text-secondary truncate">{replyingTo.text}</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="text-text-secondary"><span className="material-symbols-outlined text-[18px]">close</span></button>
                    </div>
                  )}
                  {pendingMedia.length > 0 && !editingMessage && (
                    <div className="mb-3 p-3 bg-dark-surface-light rounded-xl border border-white/5 flex gap-3 overflow-x-auto shadow-md">
                      {pendingMedia.map((media, i) => (
                        <div key={i} className="relative shrink-0 flex flex-col bg-black/40 rounded-lg overflow-hidden border border-white/10 w-[90px] group">
                          {media.type.startsWith('image/') ? (
                            <img src={media.url} className="w-full h-16 object-cover" alt="preview" />
                          ) : (
                            <div className="w-full h-16 flex items-center justify-center bg-white/5">
                              <span className="material-symbols-outlined text-3xl opacity-50">insert_drive_file</span>
                            </div>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setPendingMedia(prev => prev.filter((_, idx) => idx !== i)); }} className="absolute m-1 top-0 right-0 bg-black/60 backdrop-blur-md rounded-full size-6 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                          <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${media.progress}%` }}></div>
                          <p className="text-[9px] p-1 truncate text-center text-white/80">{media.name}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute bottom-16 left-0 bg-dark-surface-light border border-white/10 rounded-2xl p-4 shadow-2xl w-[320px] max-w-[90vw] z-50">
                        <div className="grid grid-cols-8 gap-2 h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {COMMON_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => addEmoji(emoji)} className="text-[22px] hover:bg-white/10 hover:scale-110 rounded transition-all">{emoji}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => fileInputRef.current?.click()} className="action-btn !bg-dark-surface-light border border-white/5 hover:border-white/20" title="Attach Files"><span className="material-symbols-outlined">add</span></button>
                    {(isGroup || isChannel) && (
                      <button onClick={() => setShowPollCreator(true)} className="action-btn !bg-dark-surface-light border border-white/5 hover:border-white/20" title="Create Poll"><span className="material-symbols-outlined text-primary">poll</span></button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileUpload} />

                    <div className="input-wrapper">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined">sentiment_satisfied</span>
                      </button>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                      />
                      <div className="input-actions">
                        <button className="text-text-secondary hover:text-white transition-colors" onClick={() => fileInputRef.current?.click()}><span className="material-symbols-outlined">attach_file</span></button>
                      </div>
                    </div>

                    <button onClick={handleSend} className="send-btn">
                      <span className="material-symbols-outlined fill">{inputText.trim() || pendingMedia.length > 0 || editingMessage ? 'send' : 'mic'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </footer>
      </main>

      {/* Info Sidebar */}
      <aside className={`chat-info-sidebar ${!showInfo ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3>Contact Info</h3>
          <button onClick={() => setShowInfo(false)} className="action-btn"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="sidebar-content">
          <div className="profile-view">
            <img src={chat.user.avatar} alt="profile" />
            <h2 className="flex items-center gap-2 justify-center">
              {chat.user.name}
              {chat.user.isVerified && <span className="material-symbols-outlined text-sky-400 text-[18px] fill">verified</span>}
            </h2>
            <p className="text-dark-text-muted mt-1">{isChannel ? `${chat.subscriberCount || '0'} Subscribers` : isGroup ? `${chat.groupMembers?.length || 0} Members` : chat.user.bio || 'Available'}</p>
          </div>

          <div className="section-title">
            <h4>Media & Files</h4>
            <span>See All</span>
          </div>
          <div className="media-grid">
            {chat.sharedMedia?.map((url, i) => (
              <div key={i} className="media-item">
                <img src={url} alt="shared" />
              </div>
            ))}
          </div>

          {isGroup && chat.groupMembers && (
            <>
              <div className="section-title mt-6">
                <h4>Group Members</h4>
                <span>{chat.groupMembers.length}</span>
              </div>
              <div className="space-y-3">
                {chat.groupMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} className="size-9 rounded-full object-cover" alt={member.name} />
                      <div>
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-[10px] text-primary">{member.status === 'online' ? 'Online' : 'Offline'}</p>
                      </div>
                    </div>
                    {member.id !== 'me' && (
                      <button className="opacity-0 group-hover:opacity-100 action-btn transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {!isChannel && !isGroup && (
            <>
              <div className="section-title">
                <h4>Common Groups</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-surface-dark-light flex items-center justify-center text-primary"><span className="material-symbols-outlined">groups</span></div>
                  <div><p className="text-sm font-bold">Team Alpha</p><p className="text-xs text-text-secondary">42 Members</p></div>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {showReadHUD && (
        <MessageReadHUD
          readers={chat.groupMembers || [chat.user]}
          onClose={() => setShowReadHUD(false)}
        />
      )}

      {showPollCreator && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-background-dark border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
              <h3 className="font-bold text-lg flex items-center gap-2"><span className="material-symbols-outlined text-primary">poll</span> Create Poll</h3>
              <button onClick={() => setShowPollCreator(false)} className="text-dark-text-muted hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Question</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-[#111813] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Options</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2 group">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...pollOptions];
                            newOpts[i].text = e.target.value;
                            setPollOptions(newOpts);
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="w-full bg-[#111813] border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                        />
                        {(i >= 2 || pollOptions.length > 2) && (
                          <button onClick={() => setPollOptions(prev => prev.filter(o => o.id !== opt.id))} className="absolute right-3 top-2.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {pollOptions.length < 10 && (
                  <button
                    onClick={() => setPollOptions(prev => [...prev, { id: Date.now().toString(), text: '' }])}
                    className="text-sm text-primary font-bold flex items-center gap-1 hover:underline mt-2 p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Option
                  </button>
                )}
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only peer" checked={pollMultiple} onChange={(e) => setPollMultiple(e.target.checked)} />
                    <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-300">Allow multiple answers</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
              <button onClick={() => setShowPollCreator(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button
                onClick={() => {
                  const validOptions = pollOptions.filter(o => o.text.trim());
                  if (pollQuestion.trim() && validOptions.length >= 2) {
                    if (onSendPoll) {
                      onSendPoll(chat.id, {
                        question: pollQuestion.trim(),
                        options: validOptions.map(o => ({ id: o.id, text: o.text.trim(), votes: [] })),
                        multipleAnswers: pollMultiple
                      });
                    }
                    setShowPollCreator(false);
                    setPollQuestion('');
                    setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
                  }
                }}
                disabled={!pollQuestion.trim() || pollOptions.filter(o => o.text.trim()).length < 2}
                className="flex-1 py-2.5 rounded-xl bg-primary text-[#052e16] font-bold hover:scale-[1.02] transition-all text-sm disabled:opacity-50 disabled:hover:scale-100"
              >Create Poll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
