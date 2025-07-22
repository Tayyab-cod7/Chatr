import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Chat from './pages/Chat.jsx';
import Contact from './pages/Contact.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';
import EditName from './pages/EditName.jsx';
import EditAbout from './pages/EditAbout.jsx';
import ChatPage from './pages/ChatPage.jsx';
import UserProfile from './pages/UserProfile.jsx';
import { LayoutGroup } from 'framer-motion';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <LayoutGroup>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/user-profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/edit-name" element={<ProtectedRoute><EditName /></ProtectedRoute>} />
          <Route path="/edit-about" element={<ProtectedRoute><EditAbout /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/register" />} />
        </Routes>
        <ToastContainer position="top-center" />
      </div>
      </LayoutGroup>
    </Router>
  );
}

export default App;
