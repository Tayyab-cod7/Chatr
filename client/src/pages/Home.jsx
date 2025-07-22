import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import getApiBase from '../apiBase';

const Home = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const API_URL = getApiBase();

  const fetchUsers = useCallback(async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}/chats`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [currentUser, navigate, API_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <button
            onClick={() => navigate('/contacts')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow"
          >
            New Chat
          </button>
        </div>
        <div className="space-y-4">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => navigate(`/chat/${user._id}`)}
              className="w-full flex items-center gap-4 p-4 bg-white/80 backdrop-blur-lg rounded-xl hover:bg-blue-50 transition shadow-md"
            >
              {user.profilePhoto ? (
                <img
                  src={`${API_URL}/uploads/${user.profilePhoto}`}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 border-2 border-blue-200">
                  {user.fullName.charAt(0)}
                </div>
              )}
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                <p className="text-sm text-gray-500">{user.about || 'Available'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 