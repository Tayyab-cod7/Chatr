import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import getApiBase from '../apiBase';

const API_URL = getApiBase();

const EditName = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [name, setName] = useState(user?.fullName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem('user', JSON.stringify({ ...user, fullName: updated.fullName }));
        navigate('/settings');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 w-full">
      {/* Header */}
      <div className="flex items-center px-2 sm:px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-md rounded-b-2xl w-full max-w-2xl mx-auto">
        <button onClick={() => navigate('/profile')} className="mr-2 text-gray-700 hover:bg-gray-200 rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-xl font-bold">Name</div>
      </div>
      {/* Main Card */}
      <div className="flex flex-col gap-6 p-4 sm:p-8 w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl mt-8 animate-fade-in">
      {/* Input */}
        <label className="text-gray-600 text-sm mb-1" htmlFor="name-input">Your name</label>
        <div className="relative">
          <input
            id="name-input"
            type="text"
            maxLength={25}
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-10"
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">{name.length}/25</span>
        </div>
        <div className="text-sm text-gray-500 mt-4">People will see this name if you interact with them and they don't have you saved as a contact.</div>
      {/* Save Button */}
      <div className="pt-4">
        <button
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 rounded-full text-lg shadow-lg hover:from-green-600 hover:to-blue-600 transition disabled:opacity-60"
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          Save
        </button>
      </div>
      </div>
    </div>
  );
};

export default EditName; 