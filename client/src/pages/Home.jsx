import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import getApiBase from '../apiBase';

function Home() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const API_URL = getApiBase();

  const fetchUsers = () => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert('User deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete user');
      }
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome to Chatr!</h2>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition font-semibold"
          >
            Logout
          </button>
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-6">All Registered Users</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {users.map(user => (
            <div
              key={user._id}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow hover:shadow-lg transition flex flex-col gap-2 relative"
            >
              <div className="text-lg font-semibold text-gray-800 mb-2">{user.fullName}</div>
              <div className="text-gray-500"><span className="font-medium text-gray-700">Phone:</span> {user.phone}</div>
              <button
                onClick={() => handleDelete(user._id)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow transition flex items-center justify-center"
                title="Delete user"
                aria-label="Delete user"
              >
                {/* Trash/Basket SVG icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V19a2 2 0 002 2h8a2 2 0 002-2V7.5M4 7.5h16M9.5 7.5V5a2 2 0 012-2h1a2 2 0 012 2v2.5" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home; 