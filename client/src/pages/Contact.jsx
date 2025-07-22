import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import getApiBase from '../apiBase';
import { useSocket } from '../context/SocketContext';

const Contact = () => {
  const navigate = useNavigate();
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [addContactStatus, setAddContactStatus] = useState('');
  const API_URL = getApiBase();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [contacts, setContacts] = useState([]);
  const socket = useSocket();

  const fetchContacts = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}/contacts`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (addContactStatus === 'Contact added successfully!') {
      fetchContacts();
    }
    // eslint-disable-next-line
  }, [addContactStatus]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = () => {
      fetchContacts();
    };
    socket.on('receive-message', handleReceive);
    return () => socket.off('receive-message', handleReceive);
  }, [socket]);

  const handleSearch = async () => {
    setSearchError('');
    setSearchResult(null);
    if (!phone) return;
    try {
      const res = await fetch(`${API_URL}/users/phone/${phone}`);
      if (res.ok) {
        const user = await res.json();
        setSearchResult(user);
      } else {
        setSearchError('User does not have an account on Chatr.');
      }
    } catch (err) {
      setSearchError('Error searching for user.');
    }
  };

  const handleAddContact = async () => {
    setAddContactStatus('');
    if (!currentUser || !searchResult) return;
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: searchResult._id })
      });
      const data = await res.json();
      if (res.ok) {
        setAddContactStatus('Contact added successfully!');
      } else {
        setAddContactStatus(data.message || 'Failed to add contact.');
      }
    } catch (err) {
      setAddContactStatus('Error adding contact.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 w-full">
          {/* Header */}
      <div className="flex items-center px-2 sm:px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-md rounded-b-2xl w-full max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="mr-2 text-gray-700 hover:bg-gray-200 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
          <div className="text-lg sm:text-xl font-bold">Select contact</div>
          <div className="text-xs text-gray-500">{contacts.length} contacts</div>
            </div>
            {/* Removed search and three dots icons */}
          </div>
      {/* Main Card */}
      <div className="flex flex-col gap-4 p-4 sm:p-8 w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl mt-8 animate-fade-in">
        {/* Removed 'New group' button as requested */}
        <button className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold shadow-lg hover:scale-105 hover:from-green-500 hover:to-blue-500 transition-all duration-200 w-full" onClick={() => setShowPhoneInput(true)}>
          <UserPlusIcon className="w-8 h-8 text-green-700 bg-white/80 rounded-full p-1 shadow" />
          <span className="font-semibold text-base sm:text-lg">New contact</span>
        </button>
        {showPhoneInput && (
          <div className="flex flex-col gap-2 bg-white/90 p-6 rounded-2xl mt-2 shadow animate-fade-in">
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="border-2 border-blue-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button onClick={handleSearch} className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-green-600 hover:to-blue-600 transition">Search</button>
            {searchError && <div className="text-red-500 text-sm mt-1">{searchError}</div>}
            {searchResult && (
              <div className="flex flex-col items-center gap-2 mt-2 p-4 bg-white/80 rounded-xl shadow-lg animate-fade-in">
                <img src={searchResult.profilePhoto ? `${API_URL}/uploads/${searchResult.profilePhoto}` : 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow" />
                <div className="font-bold text-lg text-blue-700">{searchResult.fullName}</div>
                <div className="text-gray-500">{searchResult.phone}</div>
                <div className="text-gray-500 text-sm">{searchResult.about || 'Available'}</div>
                <button onClick={handleAddContact} className="mt-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 rounded-lg font-semibold shadow hover:from-green-600 hover:to-blue-600 transition">Add to contacts</button>
                {addContactStatus && <div className="text-xs mt-1 text-green-600">{addContactStatus}</div>}
            </div>
            )}
            <button onClick={() => { setShowPhoneInput(false); setPhone(''); setSearchResult(null); setSearchError(''); }} className="text-gray-500 text-xs mt-2 hover:underline">Close</button>
          </div>
        )}
        <div className="border-b my-2 border-blue-200" />
        {contacts.map((user) => (
              <button
                key={user._id}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/80 hover:bg-blue-50 shadow transition-all duration-200 w-full text-left mb-2"
          >
            <img src={user.profilePhoto ? `${API_URL}/uploads/${user.profilePhoto}` : 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow" />
            <div className="flex flex-col items-start">
              <span className="font-semibold text-base sm:text-lg text-blue-900">{user.fullName}</span>
              <span className="text-gray-500 text-sm">{user.about || 'Available'}</span>
            </div>
              </button>
            ))}
          </div>
      <div className="mt-4 text-xs text-blue-500 text-center tracking-wide">Contacts on Chatr</div>
    </div>
  );
};

export default Contact; 