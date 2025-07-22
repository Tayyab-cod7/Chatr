import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import getApiBase from '../apiBase';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = getApiBase();
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      secure: true,
      rejectUnauthorized: false,
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      
      // Identify user if available
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user._id) {
        newSocket.emit('identify', user._id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}; 