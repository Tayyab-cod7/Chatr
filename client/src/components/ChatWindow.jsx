import React, { useRef, useEffect } from "react";
import MessageInput from "./MessageInput";
import getApiBase from '../apiBase';

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
          </div>
        </div>
      )}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-2 py-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">No messages yet</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'} mb-1`}>
            <div className={`rounded-2xl px-4 py-2 max-w-xs break-words shadow-lg transition-all duration-200 ${msg.senderId === currentUser?._id ? 'bg-gradient-to-br from-green-300 to-blue-200 text-gray-900' : 'bg-white/80 text-gray-900 border border-blue-100'}`}
              style={{ borderBottomRightRadius: msg.senderId === currentUser?._id ? '0.5rem' : '2rem', borderBottomLeftRadius: msg.senderId !== currentUser?._id ? '0.5rem' : '2rem' }}>
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-white/80 backdrop-blur-md p-2 shadow-md">
        <MessageInput onSend={onSend} disabled={!selectedUser} />
      </div>
    </div>
  );
};

export default ChatWindow; 