
import { Chat, User, CallLog, StatusUpdate } from './types';

export const ME: User = {
  id: 'me',
  name: 'Jane Doe',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2y47Gz3fJ3LyR7ExYBL3CArqa4C64Ry76219G-ApVBJRUrJSo8f77jA_kMt-Hn2cyO-a5YXmSj8YHZ9sD0U04SGOI-fpY6xYEKKtrP5Fk9hR67liD7TVy4L0qV3sWaFiTMnGy10QiQMU_gVXO5nSK-s4zbsaBjGSIsr7mrDugRkV8SnP0yDZU1H9P03AOYcRbPfLGDAPkrUf6DPJZxGTM8qjn3vlRBUZ_oI2WVs1Eu575rGcYEgrgMgKI3oSlRGbJTay0slEe8nfV',
  status: 'online',
  phone: '+1 (555) 123-4567',
  bio: "Available for calls and meetings. Don't hesitate to reach out!"
};

export const MOCK_CALLS: CallLog[] = [
  { id: 'c1', user: { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice', status: 'online' }, type: 'video', direction: 'incoming', timestamp: 'Today, 11:20 AM', duration: '12:04' },
  { id: 'c2', user: { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob', status: 'offline' }, type: 'audio', direction: 'missed', timestamp: 'Yesterday, 8:45 PM' },
  { id: 'c3', user: { id: 'u4', name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah', status: 'online' }, type: 'video', direction: 'outgoing', timestamp: 'Oct 24, 2:15 PM', duration: '05:30' },
];

export const MOCK_STATUS: StatusUpdate[] = [
  { id: 's1', user: { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice', status: 'online' }, time: '10 mins ago', image: 'https://picsum.photos/seed/s1/400/700', isViewed: false },
  { id: 's2', user: { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob', status: 'offline' }, time: '2 hours ago', image: 'https://picsum.photos/seed/s2/400/700', isViewed: true },
  { id: 's3', user: { id: 'u4', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah', status: 'online' }, time: '4 hours ago', image: 'https://picsum.photos/seed/s3/400/700', isViewed: false },
  { id: 's4', user: { id: 'u5', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie', status: 'offline' }, time: '5 hours ago', image: 'https://picsum.photos/seed/s4/400/700', isViewed: false },
  { id: 's5', user: { id: 'u6', name: 'Emma', avatar: 'https://i.pravatar.cc/150?u=emma', status: 'online' }, time: '6 hours ago', image: 'https://picsum.photos/seed/s5/400/700', isViewed: true },
];

export const AI_USER: User = {
  id: 'ai-assistant',
  name: 'NexChat AI',
  avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
  status: 'online',
  bio: 'Your personal AI assistant. Ask me anything!',
  isVerified: true
};

export const INITIAL_AI_CHAT: Chat = {
  id: 'ai-chat',
  user: AI_USER,
  lastMessage: 'Hello! I am your AI assistant. How can I help you today?',
  lastMessageTime: 'Now',
  unreadCount: 0,
  type: 'individual',
  messages: [
    {
      id: 'ai-m1',
      senderId: 'ai-assistant',
      senderName: 'NexChat AI',
      text: 'Hello! I am your NexChat AI assistant. I can help you with writing, planning, or just answering your questions. What’s on your mind?',
      timestamp: 'Now',
      status: 'read',
      type: 'text'
    }
  ]
};

export const INITIAL_CHATS: Chat[] = [
  INITIAL_AI_CHAT,
  {
    id: 'group-1',
    user: {
      id: 'g1',
      name: 'Dev Team Alpha 🚀',
      avatar: 'https://picsum.photos/seed/g1/200/200',
      status: 'online',
    },
    lastMessage: "You: I'll update it by EOD.",
    lastMessageTime: '10:42 AM',
    unreadCount: 3,
    isPinned: true,
    type: 'group',
    groupMembers: [
      ME,
      { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice', status: 'online' },
      { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob', status: 'online', lastSeen: '2m ago' },
      { id: 'u3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie', status: 'offline', lastSeen: '1h ago' }
    ],
    sharedMedia: [
      'https://picsum.photos/seed/m1/200/200',
      'https://picsum.photos/seed/m2/200/200',
      'https://picsum.photos/seed/m3/200/200',
      'https://picsum.photos/seed/m4/200/200',
      'https://picsum.photos/seed/m5/200/200',
      'https://picsum.photos/seed/m6/200/200'
    ],
    messages: [
      { id: 'm1', senderId: 'u1', senderName: 'Alice', text: "Here are the new designs for the dashboard. Let me know what you think! 🎨", timestamp: '10:30 AM', status: 'read', type: 'text' },
      { id: 'm2', senderId: 'u2', senderName: 'Bob', text: "Looks great! @Alice can we change the primary color to green? 🌱", timestamp: '10:32 AM', status: 'read', type: 'text' },
      { id: 'm3', senderId: 'me', senderName: 'Jane Doe', text: "I agree with Bob. The green fits our new branding better.", timestamp: '10:35 AM', status: 'read', type: 'text' },
      { id: 'm4', senderId: 'me', senderName: 'Jane Doe', text: "I'll update it by EOD.", timestamp: '10:42 AM', status: 'sent', type: 'text' },
    ],
  },
  {
    id: 'ind-1',
    user: {
      id: 'u4',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      status: 'online',
      isVerified: true
    },
    lastMessage: "That sounds like a great plan! 🚀",
    lastMessageTime: '10:30 AM',
    unreadCount: 0,
    type: 'individual',
    sharedMedia: [
      'https://picsum.photos/seed/s1/200/200',
      'https://picsum.photos/seed/s2/200/200'
    ],
    messages: [
      { id: 'im1', senderId: 'u4', text: "Hey! Are we still on for the review?", timestamp: '09:00 AM', status: 'read', type: 'text' },
      { id: 'im1.5', senderId: 'u4', text: "", timestamp: '09:02 AM', status: 'read', type: 'audio' },
      { id: 'im2', senderId: 'me', text: "Yes, definitely!", timestamp: '09:15 AM', status: 'read', type: 'text' },
      { id: 'im2.5', senderId: 'me', text: "Check this out: https://dribbble.com/premium-messenger", timestamp: '09:16 AM', status: 'read', type: 'text' },
      { id: 'im3', senderId: 'u4', text: "That sounds like a great plan! 🚀", timestamp: '10:30 AM', status: 'read', type: 'text' },
    ],
  },
  {
    id: 'chan-1',
    user: {
      id: 'c1',
      name: 'Tech World News 🌍',
      avatar: 'https://picsum.photos/seed/c1/200/200',
      status: 'online',
    },
    lastMessage: "New React 19 features released today!",
    lastMessageTime: '08:15 AM',
    unreadCount: 12,
    type: 'channel',
    subscriberCount: '15.4K',
    messages: [
      { id: 'cm1', senderId: 'c1', senderName: 'Tech Admin', text: "New React 19 features released today! Check out how to use the 'use' hook effectively in your projects.", timestamp: '08:15 AM', status: 'read', type: 'text' },
    ],
  }
];
