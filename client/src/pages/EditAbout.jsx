import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import getApiBase from '../apiBase';

const DEFAULT_ABOUTS = [
  "Available",
  "Busy",
  "At school",
  "At the movies",
  "At work",
  "Battery about to die",
  "Can't talk, WhatsApp only",
  "In a meeting",
  "At the gym",
  "Sleeping",
  "Urgent calls only"
];

const EditAbout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [about, setAbout] = useState(user?.about || "Available");
  const [saving, setSaving] = useState(false);
  const API_URL = getApiBase();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about }),
      });
      const updated = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(updated));
        navigate(-1);
      } else {
        alert(updated.message || 'Failed to update about');
      }
    } catch (err) {
      alert('Failed to update about');
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
        <div className="text-xl font-bold">About</div>
      </div>
      {/* Main Card */}
      <div className="flex flex-col gap-6 p-4 sm:p-8 w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl mt-8 animate-fade-in">
      {/* Input */}
        <label className="text-gray-600 text-sm mb-1" htmlFor="about-input">Your about</label>
        <input
          id="about-input"
          type="text"
          maxLength={100}
          value={about}
          onChange={e => setAbout(e.target.value)}
          className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">{about.length}/100</span>
        </div>
        <div className="text-sm text-gray-500 mt-4">People will see this about on your profile.</div>
      {/* Default Abouts */}
      <div>
        <div className="text-xs font-semibold text-gray-500 mb-2">Select About</div>
        <div className="flex flex-col gap-2">
          {DEFAULT_ABOUTS.map((item, idx) => (
            <button
              key={idx}
              className={`text-left px-4 py-2 rounded-lg border transition font-semibold ${about === item ? 'bg-gradient-to-r from-green-200 to-blue-200 border-blue-400 text-blue-900 shadow' : 'bg-gray-50 border-gray-200 hover:bg-blue-50'}`}
              onClick={() => setAbout(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {/* Save Button */}
      <div className="pt-4">
        <button
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 rounded-full text-lg shadow-lg hover:from-green-600 hover:to-blue-600 transition disabled:opacity-60"
          onClick={handleSave}
          disabled={saving || !about.trim()}
        >
          Save
        </button>
      </div>
      </div>
    </div>
  );
};

export default EditAbout; 