import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import getApiBase from '../apiBase';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const API_URL = getApiBase();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md shadow-md">
        <button onClick={() => navigate('/settings')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <div className="w-6"></div>
      </div>

      {user && (
        <div className="max-w-lg mx-auto p-4">
          <div className="mt-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <div className="flex flex-col items-center">
              {user.profilePhoto ? (
                <img
                  src={`${API_URL}/uploads/${user.profilePhoto}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-blue-200 shadow-lg">
                  {user.fullName.charAt(0)}
                </div>
              )}
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center p-4 bg-white/80 rounded-xl shadow">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">{user.fullName}</p>
                </div>
                <button
                  onClick={() => navigate('/edit-name')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/80 rounded-xl shadow">
                <div>
                  <p className="text-sm text-gray-500">About</p>
                  <p className="font-semibold text-gray-900">{user.about || 'Available'}</p>
                </div>
                <button
                  onClick={() => navigate('/edit-about')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-white/80 rounded-xl shadow">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 