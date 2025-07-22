import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { useSocket } from "../context/SocketContext";
import { CameraIcon, MagnifyingGlassIcon, EllipsisVerticalIcon, ChatBubbleLeftRightIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import Settings from './Settings.jsx';
import { useNavigate } from 'react-router-dom';
import getApiBase from '../apiBase';

const API_URL = getApiBase();

// Utility functions
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
}

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Chat = () => {
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const chatMenuRef = useRef();
  const lastFetchedMessageId = useRef(null);
  const justFetched = useRef(false);
  const fetchedIds = useRef(new Set());
  const messageIds = useRef(new Set());

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close chat menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) {
        setChatMenuOpen(false);
      }
    };
    if (chatMenuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [chatMenuOpen]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_URL}/users/${currentUser._id}/chats`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;
    fetch(`${API_URL}/messages?userId=${currentUser._id}&otherUserId=${selectedUser._id}`)
      .then((res) => res.json())
      .then(msgs => {
        setMessages(msgs);
        // Store all message IDs
        messageIds.current = new Set(msgs.map(m => m._id));
      })
      .catch(console.error);
  }, [currentUser, selectedUser]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data) => {
      // Only add message if we haven't seen its ID before
      if (data._id && !messageIds.current.has(data._id)) {
        if (
          (data.senderId === currentUser?._id && data.receiverId === selectedUser?._id) ||
          (data.senderId === selectedUser?._id && data.receiverId === currentUser?._id)
        ) {
          messageIds.current.add(data._id);
          setMessages(prev => [...prev, data]);
        }
      }
      // Always refresh chat list on any received message
      if (currentUser) {
        fetch(`${API_URL}/users/${currentUser._id}/chats`)
          .then((res) => res.json())
          .then(setUsers)
          .catch(console.error);
      }
    };
    socket.on("receive-message", handleReceive);
    return () => socket.off("receive-message", handleReceive);
  }, [socket, currentUser, selectedUser]);

  useEffect(() => {
    if (!socket || !selectedUser || !currentUser) return;
    const roomId = [currentUser._id, selectedUser._id].sort().join(":");
    socket.emit("join-room", roomId);
  }, [socket, selectedUser, currentUser]);

  useEffect(() => {
    if (socket && currentUser?._id) {
      socket.emit('identify', currentUser._id);
    }
  }, [socket, currentUser]);

  const handleSend = async (text) => {
    if (!selectedUser || !currentUser) return;
    const msg = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text,
      timestamp: Date.now(),
    };
    socket.emit("send-message", msg);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      {/* Split Navbar - Fixed at top */}
      <div className="flex fixed top-0 left-0 right-0 z-50">
        {/* Left side navbar (Chat box) */}
        <div className="w-full md:w-1/4 flex items-center justify-between px-2 sm:px-4 py-3 bg-white/80 backdrop-blur-md shadow-md border-b rounded-b-2xl">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">Chatr</span>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <EllipsisVerticalIcon className="w-6 h-6 text-gray-700 cursor-pointer" onClick={() => setMenuOpen((v) => !v)} />
              {menuOpen && (
                <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                  <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>Settings</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right side navbar (Chat window) - Only show when chat is selected */}
        {selectedUser && (
          <div className="hidden md:flex flex-1 items-center px-4 py-3 bg-white/80 backdrop-blur-md shadow-md border-b rounded-b-2xl">
            <div className="flex items-center gap-3">
              {selectedUser.profilePhoto ? (
                <img src={`${API_URL}/uploads/${selectedUser.profilePhoto}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
              ) : (
                <div style={{ background: stringToColor(selectedUser.fullName || '') }} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-[#444] border">
                  {getInitials(selectedUser.fullName)}
                </div>
              )}
              <span className="font-bold text-lg">{selectedUser.fullName}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 relative" onClick={() => setChatMenuOpen(v => !v)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="1.5"/>
                  <circle cx="12" cy="6" r="1.5"/>
                  <circle cx="12" cy="18" r="1.5"/>
                </svg>
              </button>
              {chatMenuOpen && (
                <div ref={chatMenuRef} className="absolute right-2 top-full mt-1 bg-white z-50">
                  <button 
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 whitespace-nowrap text-sm" 
                    onClick={() => { setChatMenuOpen(false); navigate(`/user-profile/${selectedUser._id}`); }}
                  >
                    Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-1 mt-[3.25rem] overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 h-full bg-white/70 backdrop-blur-lg md:block shadow-md">
          <Sidebar users={users} onSelectUser={setSelectedUser} selectedUserId={selectedUser?._id} />
        </div>
        {/* Chat window */}
        <div className="hidden md:flex flex-col flex-1 min-w-0">
          {selectedUser ? (
            <>
              <ChatWindow
                messages={messages}
                currentUser={currentUser}
                selectedUser={selectedUser}
                hideTopBar={true}
                onSend={handleSend}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
 