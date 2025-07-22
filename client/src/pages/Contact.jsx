import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon } from '@heroicons/react/24/solid';
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

  const fetchContacts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}/contacts`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  }, [currentUser, API_URL]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (addContactStatus === 'Contact added successfully!') {
      fetchContacts();
    }
  }, [addContactStatus, fetchContacts]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = () => {
      fetchContacts();
    };
    socket.on('receive-message', handleReceive);
    return () => socket.off('receive-message', handleReceive);
  }, [socket, fetchContacts]);

  const handleSearch = async () => {
    if (!phone.trim()) {
      setSearchError('Please enter a phone number');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/search?phone=${phone}`);
      const data = await res.json();
      if (res.ok) {
        if (data._id === currentUser._id) {
          setSearchError("That's your own phone number!");
          setSearchResult(null);
        } else {
          setSearchResult(data);
          setSearchError('');
        }
      } else {
        setSearchError(data.message || 'User not found');
        setSearchResult(null);
      }
    } catch (err) {
      setSearchError('Error searching for user');
      setSearchResult(null);
    }
  };

  const handleAddContact = async () => {
    if (!searchResult) return;
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactId: searchResult._id }),
      });
      if (res.ok) {
        setAddContactStatus('Contact added successfully!');
        setSearchResult(null);
        setPhone('');
        setShowPhoneInput(false);
        setTimeout(() => setAddContactStatus(''), 3000);
      } else {
        const data = await res.json();
        setAddContactStatus(data.message || 'Error adding contact');
      }
    } catch (err) {
      setAddContactStatus('Error adding contact');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 w-full">
      <div className="flex items-center justify-between w-full px-4 py-3 bg-white/80 backdrop-blur-md shadow-md">
        <button onClick={() => navigate('/chat')} className="text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-8 w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl mt-8 animate-fade-in">
        <button
          onClick={() => setShowPhoneInput(!showPhoneInput)}
          className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition shadow-md"
        >
          <UserPlusIcon className="w-6 h-6" />
          <span className="font-semibold">New Contact</span>
        </button>

        {showPhoneInput && (
          <div className="p-4 bg-white/80 rounded-xl shadow-md">
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow"
              >
                Search
              </button>
            </div>
            {searchError && <p className="mt-2 text-red-500">{searchError}</p>}
            {searchResult && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {searchResult.profilePhoto ? (
                    <img
                      src={`${API_URL}/uploads/${searchResult.profilePhoto}`}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                      {searchResult.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold">{searchResult.fullName}</span>
                </div>
                <button
                  onClick={handleAddContact}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}

        {addContactStatus && (
          <div className={`p-4 rounded-lg ${addContactStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {addContactStatus}
          </div>
        )}

        <div className="border-b my-2 border-blue-200" />

        {contacts.map((user) => (
          <button
            key={user._id}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/80 hover:bg-blue-50 shadow transition-all duration-200 w-full text-left mb-2"
            onClick={() => navigate(`/chat/${user._id}`)}
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
            <span className="font-bold text-lg text-blue-900">{user.fullName}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Contact; 