import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import getApiBase from '../apiBase';

function stringToColor(str) {
  // Simple hash to pastel color
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

const Sidebar = ({ users, onSelectUser }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState({});

  const handleImgError = (userId) => {
    setImgError(prev => ({ ...prev, [userId]: true }));
  };

  const handleUserClick = (user) => {
    onSelectUser(user);
    navigate(`/chat/${user._id}`);
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-lg h-full p-4 overflow-y-auto relative shadow-md rounded-2xl">
      <div className="flex flex-col gap-2 w-full">
        {(Array.isArray(users) ? users : []).map(user => (
          <button
            key={user._id}
            className={`flex items-center w-full h-16 gap-4 px-3 rounded-xl hover:bg-blue-100/60 text-left shadow transition-all duration-150`}
            onClick={() => handleUserClick(user)}
            type="button"
          >
            {user.profilePhoto && !imgError[user._id] ? (
              <img
                src={`${API_URL}/uploads/${user.profilePhoto}`}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow"
                onError={() => handleImgError(user._id)}
              />
            ) : (
              <div style={{ background: stringToColor(user.fullName || '') }} className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-[#444] border-2 border-blue-200 shadow" >
                {getInitials(user.fullName)}
              </div>
            )}
            <span className="font-bold text-lg flex-1 min-w-0 truncate text-left text-blue-900">{user.fullName}</span>
          </button>
        ))}
      </div>
      {/* Floating Send Message Button (Desktop: left, Mobile: right) */}
      <div>
        <div className="hidden md:flex fixed left-8 bottom-24 z-50">
          <button
            className="flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500 text-white h-12 w-12 rounded-full shadow-lg focus:outline-none hover:from-green-600 hover:to-blue-600 transition"
            onClick={() => navigate('/contacts')}
            aria-label="Start new chat"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex md:hidden fixed right-6 bottom-20 z-50">
          <button
            className="flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500 text-white h-12 w-12 rounded-full shadow-lg focus:outline-none hover:from-green-600 hover:to-blue-600 transition"
            onClick={() => navigate('/contacts')}
            aria-label="Start new chat"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 