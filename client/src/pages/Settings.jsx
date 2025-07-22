import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import getApiBase from '../apiBase';

const Settings = () => {
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const API_URL = getApiBase();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert('Failed to delete account');
      }
    } catch (err) {
      alert('Error deleting account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md shadow-md">
        <button onClick={() => navigate('/chat')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <div className="w-6"></div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="mt-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center w-full p-4 hover:bg-blue-50/50 transition"
          >
            <UserCircleIcon className="w-6 h-6 text-blue-600" />
            <span className="ml-3 font-semibold text-gray-900">Profile</span>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
          </button>

          <div className="border-t border-gray-200" />

          <button
            onClick={handleLogout}
            className="flex items-center w-full p-4 hover:bg-red-50/50 transition text-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="ml-3 font-semibold">Logout</span>
          </button>

          <div className="border-t border-gray-200" />

          <button
            onClick={() => setShowConfirmDelete(true)}
            className="flex items-center w-full p-4 hover:bg-red-50/50 transition text-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="ml-3 font-semibold">Delete Account</span>
          </button>
        </div>

        <div className="mt-8 text-center text-gray-500">
          Version 1.0.0
        </div>

        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Account?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete your account and all your data. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 