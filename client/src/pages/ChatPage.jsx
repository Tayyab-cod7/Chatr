import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import getApiBase from '../apiBase';
import { useSocket } from '../context/SocketContext';
import MessageInput from '../components/MessageInput';

const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png';
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
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const messagesContainerRef = useRef(null);
  const lastFetchedMessageId = useRef(null);
  const justFetched = useRef(false);
  const fetchedIds = useRef(new Set());
  const messageIds = useRef(new Set());

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

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
        // Store all message IDs
        messageIds.current = new Set(msgs.map(m => m._id));
      });
  }, [currentUser, userId]);

  useEffect(() => {
    if (!socket || !currentUser || !userId) return;
    const roomId = [currentUser._id, userId].sort().join(":");
    socket.emit("join-room", roomId);
  }, [socket, currentUser, userId]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data) => {
      // Only add message if we haven't seen its ID before
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
    if (socket && currentUser?._id) {
      socket.emit('identify', currentUser._id);
    }
  }, [socket, currentUser]);

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
      {/* Top Bar */}
      <div className="relative flex items-center justify-center px-4 py-2 bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-md rounded-b-2xl">
        {/* Back Arrow - absolute left */}
        <button onClick={() => navigate(-1)} className="absolute left-2 p-2 text-gray-700 hover:bg-gray-200 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {/* Avatar and Name - centered */}
        {selectedUser && (selectedUser.profilePhoto ? (
          <img src={`${API_URL}/uploads/${selectedUser.profilePhoto}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border mx-2" />
        ) : (
          <div style={{ background: stringToColor(selectedUser.fullName || '') }} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-[#444] border mx-2">
            {getInitials(selectedUser.fullName)}
          </div>
        ))}
        <span className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[60vw] mx-2">{selectedUser ? selectedUser.fullName : ''}</span>
        {/* Three Dots - absolute right */}
        <div className="absolute right-2 flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 relative" onClick={() => setMenuOpen(v => !v)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="6" r="1.5"/>
              <circle cx="12" cy="18" r="1.5"/>
            </svg>
          </button>
          {menuOpen && (
            <div ref={menuRef} className="absolute right-0 top-full mt-1 bg-white z-50">
              <button 
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 whitespace-nowrap text-sm" 
                onClick={() => { setMenuOpen(false); navigate(`/user-profile/${userId}`); }}
              >
                Profile
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Chat Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-2 py-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">No messages yet</div>
        )}
        {/* Group messages by date */}
        {(() => {
          let lastDate = null;
          return messages.map((msg, idx) => {
            const msgDate = new Date(msg.timestamp);
            const showDate = !lastDate || !isSameDay(msgDate, lastDate);
            lastDate = msgDate;
            return (
              <React.Fragment key={idx}>
                {showDate && (
                  <div className="flex justify-center my-2">
                    <span className="bg-white/80 text-gray-500 text-xs px-3 py-1 rounded-full shadow border">{getDateLabel(msgDate)}</span>
                  </div>
                )}
                <div className={`flex ${msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`rounded-2xl px-4 py-2 max-w-xs break-words shadow-sm ${msg.senderId === currentUser?._id ? 'bg-green-100 text-gray-900' : 'bg-white text-gray-900 border'}`}
                    style={{ borderBottomRightRadius: msg.senderId === currentUser?._id ? '0.5rem' : '2rem', borderBottomLeftRadius: msg.senderId !== currentUser?._id ? '0.5rem' : '2rem' }}>
                    <span>{msg.text}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>
      {/* Message Input */}
      <div className="border-t bg-white/90 p-2">
        <MessageInput onSend={handleSend} disabled={!selectedUser} />
      </div>
    </div>
  );
};

export default ChatPage; 