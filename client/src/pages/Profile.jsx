import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { UserIcon, InformationCircleIcon, PhoneIcon, LinkIcon, CameraIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import getApiBase from '../apiBase';

const API_URL = getApiBase();
const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png';

const Profile = () => {
  const navigate = useNavigate();
  const [exiting, setExiting] = React.useState(false);
  const [showPhotoModal, setShowPhotoModal] = React.useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const cameraInputRef = useRef();
  const galleryInputRef = useRef();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('Profile page loaded, user:', storedUser);
    if (!storedUser) {
      navigate('/login');
    } else {
      // Always fetch the latest user profile from the backend
      fetch(`${API_URL}/users/${storedUser._id}`)
        .then(res => res.json())
        .then(freshUser => {
          setUser(freshUser);
          if (freshUser.profilePhoto) {
            setAvatar(`${API_URL}/uploads/${freshUser.profilePhoto}`);
          } else {
            setAvatar(DEFAULT_AVATAR);
          }
          // Update localStorage with the latest user info
          localStorage.setItem('user', JSON.stringify(freshUser));
        });
    }
  }, [navigate]);

  useEffect(() => {
    if (user && user.profilePhoto) {
      const url = `${API_URL}/uploads/${user.profilePhoto}`;
      setAvatar(url);
      console.log('Profile photo URL:', url);
    }
  }, [user]);

  const handleBack = () => {
    setExiting(true);
    setTimeout(() => navigate('/settings'), 350);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    console.log("Selected file:", file);
    console.log("Current user:", user);
    if (file && user) {
      console.log("Uploading photo for user:", user._id);
      const formData = new FormData();
      formData.append('photo', file);
      try {
        const res = await fetch(`${API_URL}/users/${user._id}/profile-photo`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.profilePhoto) {
          const photoUrl = `${API_URL}/uploads/${data.profilePhoto}`;
          setAvatar(photoUrl);
          // Update user in localStorage
          const updatedUser = { ...user, profilePhoto: data.profilePhoto };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        // handle error (optional)
      }
      setShowPhotoModal(false);
    } else {
      console.log("No file or user");
    }
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <LayoutGroup>
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 w-full px-2 sm:px-0"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{ initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }, exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } } }}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 w-full flex items-center px-2 sm:px-6 py-4 border-b bg-white/80 backdrop-blur-md z-10 shadow-md rounded-b-2xl w-full max-w-2xl mx-auto">
              <button onClick={handleBack} className="mr-2 text-gray-700 hover:bg-gray-200 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="text-xl font-bold">Profile</div>
            </div>
            {/* Large Profile Photo with bounce and glow */}
            <motion.img
              layoutId="profile-avatar"
              src={avatar}
              alt="avatar"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-blue-200 shadow-xl mt-24 animate-fade-in mx-auto"
              initial={{ scale: 0.7, boxShadow: '0 0 0 0 rgba(0,0,0,0)', opacity: 0, y: 60 }}
              animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(0,0,0,0)', '0 4px 32px 0 rgba(0,0,0,0.15)', '0 2px 16px 0 rgba(0,0,0,0.10)'], opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
              onError={e => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
            />
            <motion.button
              className="mt-2 text-green-600 font-semibold text-base hover:underline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.3 } }}
              onClick={() => setShowPhotoModal(true)}
            >
              Edit
            </motion.button>
            {/* Info List */}
            <motion.div
              className="flex flex-col gap-6 p-4 sm:p-8 w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl mt-8 animate-fade-in"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4, ease: 'easeOut' } }}
            >
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><UserIcon className="w-5 h-5" /> Name</div>
                <div className="ml-7 text-blue-900 cursor-pointer hover:underline font-semibold" onClick={() => navigate('/edit-name')}>{user?.fullName || ''}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><InformationCircleIcon className="w-5 h-5" /> About</div>
                <div className="ml-7 text-blue-900 cursor-pointer hover:underline font-semibold" onClick={() => navigate('/edit-about')}>{user?.about || "Available"}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-base font-semibold"><PhoneIcon className="w-5 h-5" /> Phone</div>
                <div className="ml-7 text-gray-500">{user?.phone ? user.phone : ''}</div>
              </div>
            </motion.div>
            {/* Photo Edit Modal */}
            <AnimatePresence>
              {showPhotoModal && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowPhotoModal(false)}
                >
                  <motion.div
                    className="w-full max-w-md bg-white rounded-t-2xl p-6 pb-8 shadow-xl"
                    initial={{ y: 100 }}
                    animate={{ y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }}
                    exit={{ y: 100, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setShowPhotoModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold order-1"><span>&times;</span></button>
                      <span className="flex-1 text-lg font-bold text-center order-2">Profile photo</span>
                      <button onClick={async () => {
                        if (user && user.profilePhoto) {
                          await fetch(`${API_URL}/users/${user._id}/profile-photo`, {
                            method: 'DELETE',
                          });
                          setAvatar(DEFAULT_AVATAR);
                          setUser({ ...user, profilePhoto: '' });
                          localStorage.setItem('user', JSON.stringify({ ...user, profilePhoto: '' }));
                          setShowPhotoModal(false);
                        }
                      }} className="order-3 text-red-500 hover:text-red-700 text-2xl font-bold">
                        <TrashIcon className="w-7 h-7" />
                      </button>
                    </div>
                    <div className="flex gap-6 justify-center">
                      <button className="flex flex-col items-center gap-1" onClick={() => cameraInputRef.current.click()}>
                        <CameraIcon className="w-8 h-8 text-green-600" />
                        <span className="text-xs text-gray-700">Camera</span>
                      </button>
                      <button className="flex flex-col items-center gap-1" onClick={() => galleryInputRef.current.click()}>
                        <PhotoIcon className="w-8 h-8 text-green-600" />
                        <span className="text-xs text-gray-700">Gallery</span>
                      </button>
                    </div>
                    {/* Hidden file inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}
    </AnimatePresence>
  );
};

export default Profile; 