import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../context/SocketContext';
import getApiBase from '../apiBase';

const API_URL = getApiBase();

const Chat = () => {
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const messageIds = useRef(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

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
        messageIds.current = new Set(msgs.map(m => m._id));
      })
      .catch(console.error);
  }, [currentUser, selectedUser]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data) => {
      if (data._id && !messageIds.current.has(data._id)) {
        if (
          (data.senderId === currentUser?._id && data.receiverId === selectedUser?._id) ||
          (data.senderId === selectedUser?._id && data.receiverId === currentUser?._id)
        ) {
          messageIds.current.add(data._id);
          setMessages(prev => [...prev, data]);
        }
      }
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
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="flex fixed top-0 left-0 right-0 z-50">
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
        {selectedUser && (
          <div className="hidden md:flex flex-1 items-center px-4 py-3 bg-white/80 backdrop-blur-md shadow-md border-b rounded-b-2xl">
            <div className="flex items-center gap-3">
              {selectedUser.profilePhoto ? (
                <img src={`${API_URL}/uploads/${selectedUser.profilePhoto}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 border">
                  {selectedUser.fullName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-lg">{selectedUser.fullName}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 mt-[3.25rem] overflow-hidden">
        <div className="w-full md:w-1/4 h-full bg-white/70 backdrop-blur-lg md:block shadow-md">
          <Sidebar users={users} onSelectUser={setSelectedUser} selectedUserId={selectedUser?._id} />
        </div>
        <div className="hidden md:flex flex-col flex-1 min-w-0">
          {selectedUser ? (
            <ChatWindow
              messages={messages}
              currentUser={currentUser}
              selectedUser={selectedUser}
              hideTopBar={true}
              onSend={handleSend}
            />
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
 