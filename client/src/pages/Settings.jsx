import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import getApiBase from '../apiBase';

const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png';

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 20 } },
  exit: { x: '-100%', opacity: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } },
};

const Settings = () => {
  const navigate = useNavigate();
  const [exiting, setExiting] = React.useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const API_URL = getApiBase();

  // Fetch latest user from backend
  const fetchUser = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser._id) {
      try {
        const res = await fetch(`${API_URL}/users/${storedUser._id}`);
        if (res.ok) {
          const freshUser = await res.json();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          if (freshUser.profilePhoto) {
            setAvatar(`${API_URL}/uploads/${freshUser.profilePhoto}`);
          } else {
            setAvatar(DEFAULT_AVATAR);
          }
        }
      } catch {}
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  // Listen for changes in localStorage (e.g., after editing profile/about)
  useEffect(() => {
    const handleStorage = () => {
      fetchUser();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line
  }, [API_URL]);

  const handleBack = () => {
    setExiting(true);
    setTimeout(() => navigate('/chat'), 350);
  };

  const handleProfilePicClick = () => {
    navigate('/profile');
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <LayoutGroup>
          <motion.div
            className="fixed inset-0 z-50 min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 w-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            {/* Header */}
            <div className="flex items-center px-2 sm:px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-md rounded-b-2xl w-full max-w-2xl mx-auto">
              <button onClick={handleBack} className="mr-2 text-gray-700 hover:bg-gray-200 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="text-xl font-bold">Settings</div>
              {/* Removed search icon */}
            </div>
            {/* Profile */}
            <motion.div
              layoutId="profile-section"
              className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b cursor-pointer bg-white/70 backdrop-blur-lg rounded-2xl shadow animate-fade-in w-full max-w-2xl mx-auto mt-8"
              onClick={handleProfilePicClick}
            >
              <motion.img
                layoutId="profile-avatar"
                src={avatar}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border-4 border-blue-200 shadow"
              />
              <div className="flex-1">
                <div className="text-lg font-bold text-blue-900">{user?.fullName || ''}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1 truncate max-w-[180px]">{user?.about || "Available"}</div>
              </div>
            </motion.div>
            {/* Logout & Delete Account Buttons */}
            <div className="flex flex-col gap-3 px-4 sm:px-6 pt-8 w-full max-w-2xl mx-auto">
              <button
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 rounded-full text-lg shadow-lg hover:from-red-600 hover:to-pink-600 transition"
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
              >
                Logout
              </button>
              <button
                className="w-full bg-gray-200 text-red-600 font-semibold py-3 rounded-full text-lg hover:bg-red-100 border border-red-300 transition"
                onClick={async () => {
                  if (!user) return;
                  if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
                  try {
                    const API_URL = getApiBase();
                    await fetch(`${API_URL}/users/${user._id}`, { method: 'DELETE' });
                    localStorage.clear();
                    navigate('/register');
                  } catch (err) {
                    alert('Failed to delete account');
                  }
                }}
              >
                Delete Account
              </button>
              <div className="text-center text-gray-500 text-sm mt-4">
                Version 1.0.0
              </div>
            </div>
            {/* Settings List */}
            {/* Removed settings/options list as requested */}
          </motion.div>
        </LayoutGroup>
      )}
    </AnimatePresence>
  );
};

export default Settings; 