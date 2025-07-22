import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import getApiBase from '../apiBase';
import { useSocket } from '../context/SocketContext';
import MessageInput from '../components/MessageInput';

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
}
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
function getDateLabel(date) {
  const now = new Date();
  const d = new Date(date);
  if (isSameDay(now, d)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(yesterday, d)) return 'Yesterday';
  return d.toLocaleDateString();
}

const API_URL = getApiBase();

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const messagesContainerRef = useRef(null);
  const messageIds = useRef(new Set());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/users/${userId}`)
      .then(res => res.json())
      .then(setSelectedUser);
  }, [userId]);

  useEffect(() => {
    if (!currentUser || !userId) return;
    fetch(`${API_URL}/messages?userId=${currentUser._id}&otherUserId=${userId}`)
      .then(res => res.json())
      .then(msgs => {
        setMessages(msgs);
        messageIds.current = new Set(msgs.map(m => m._id));
      });
  }, [currentUser, userId]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data) => {
      if (data._id && !messageIds.current.has(data._id)) {
        if (
          (data.senderId === currentUser?._id && data.receiverId === userId) ||
          (data.senderId === userId && data.receiverId === currentUser?._id)
        ) {
          messageIds.current.add(data._id);
          setMessages(prev => [...prev, data]);
        }
      }
    };
    socket.on('receive-message', handleReceive);
    return () => socket.off('receive-message', handleReceive);
  }, [socket, currentUser, userId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text) => {
    if (!selectedUser || !currentUser) return;
    const msg = {
      senderId: currentUser._id,
      receiverId: userId,
      text,
      timestamp: Date.now(),
    };
    socket.emit('send-message', msg);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <div className="relative flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-md rounded-b-2xl">
        <button
          onClick={() => navigate('/chat')}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {selectedUser && (
          <div className="flex items-center gap-3 flex-1 min-w-0 ml-2">
            {selectedUser.profilePhoto ? (
              <img
                src={`${API_URL}/uploads/${selectedUser.profilePhoto}`}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div
                style={{ background: stringToColor(selectedUser.fullName || '') }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-[#444] border"
              >
                {getInitials(selectedUser.fullName)}
              </div>
            )}
            <span className="font-bold text-lg truncate">{selectedUser.fullName}</span>
          </div>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -mr-2 text-gray-600 hover:text-gray-900"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`/user-profile/${userId}`);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-2 py-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">No messages yet</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'} mb-1`}>
            <div
              className={`rounded-2xl px-4 py-2 max-w-xs break-words shadow-lg transition-all duration-200 ${
                msg.senderId === currentUser?._id
                  ? 'bg-gradient-to-br from-green-300 to-blue-200 text-gray-900'
                  : 'bg-white/80 text-gray-900 border border-blue-100'
              }`}
              style={{
                borderBottomRightRadius: msg.senderId === currentUser?._id ? '0.5rem' : '2rem',
                borderBottomLeftRadius: msg.senderId !== currentUser?._id ? '0.5rem' : '2rem',
              }}
            >
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-white/90 p-2">
        <MessageInput onSend={handleSend} disabled={!selectedUser} />
      </div>
    </div>
  );
};

export default ChatPage; 