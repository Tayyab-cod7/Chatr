import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const API_URL = getApiBase();

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
      .catch(console.error);
  }, [userId, API_URL]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 w-full">
      {/* Header */}
      <div className="flex items-center px-2 sm:px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-md rounded-b-2xl w-full max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="mr-2 text-gray-700 hover:bg-gray-200 rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-xl font-bold">Profile</div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center px-4 sm:px-6 py-8 animate-fade-in w-full">
        {user.profilePhoto ? (
          <img
            src={`${API_URL}/uploads/${user.profilePhoto}`}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow"
          />
        ) : (
          <div 
            style={{ background: stringToColor(user.fullName || '') }}
            className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-gray-600 border-4 border-blue-200 shadow"
          >
            {getInitials(user.fullName)}
          </div>
        )}
      </div>

      {/* Info Sections */}
      <div className="flex flex-col gap-6 p-4 sm:p-8 w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl mt-4 animate-fade-in">
        {/* Name Section */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Name</div>
          <div className="text-black text-lg">{user.fullName}</div>
        </div>

        {/* Phone Section */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Phone</div>
          <div className="text-black text-lg">{user.phone}</div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">About</div>
          <div className="text-black text-lg">{user.about || 'Available'}</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 