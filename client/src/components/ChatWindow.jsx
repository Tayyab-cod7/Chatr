import React, { useRef, useEffect } from "react";
import MessageInput from "./MessageInput";
import getApiBase from '../apiBase';

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

const ChatWindow = ({ messages, currentUser, selectedUser, hideTopBar = false, onSend }) => {
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full bg-white/60 backdrop-blur-lg" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #e0e7ff 100%)' }}>
      {/* Top Bar */}
      {selectedUser && !hideTopBar && (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/90 border-b shadow-sm">
          {selectedUser.profilePhoto ? (
            <img src={`${API_URL}/uploads/${selectedUser.profilePhoto}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
          ) : (
            <div style={{ background: stringToColor(selectedUser.fullName || '') }} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-[#444] border">
              {getInitials(selectedUser.fullName)}
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-base truncate">{selectedUser.fullName}</span>
            {/* Optionally show status/about here */}
          </div>
          {/* Action icons (placeholders) */}
          <button className="p-2 text-gray-500 hover:text-gray-700"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553 2.276A1 1 0 0120 13.118v.764a1 1 0 01-.447.842L15 17v-7z"/><rect width="14" height="14" x="5" y="5" rx="7"/></svg></button>
          <button className="p-2 text-gray-500 hover:text-gray-700"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg></button>
        </div>
      )}
      {/* Chat Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-2 py-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">No messages yet</div>
        )}
        {/* Group messages by date */}
        {messages.map((msg, idx) => {
          const msgDate = new Date(msg.timestamp);
          return (
            <div key={idx} className={`flex ${msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'} mb-1`}>
              <div className={`rounded-2xl px-4 py-2 max-w-xs break-words shadow-lg transition-all duration-200 ${msg.senderId === currentUser?._id ? 'bg-gradient-to-br from-green-300 to-blue-200 text-gray-900' : 'bg-white/80 text-gray-900 border border-blue-100'}`}
                style={{ borderBottomRightRadius: msg.senderId === currentUser?._id ? '0.5rem' : '2rem', borderBottomLeftRadius: msg.senderId !== currentUser?._id ? '0.5rem' : '2rem' }}>
                <span>{msg.text}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Message Input */}
      <div className="border-t bg-white/80 backdrop-blur-md p-2 shadow-md">
        <MessageInput onSend={onSend} disabled={!selectedUser} />
      </div>
    </div>
  );
};

export default ChatWindow; 