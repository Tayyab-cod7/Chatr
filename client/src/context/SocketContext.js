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
      transports: ['polling', 'websocket'],
      secure: true,
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
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
      // Try to reconnect with polling if websocket fails
      if (newSocket.io.opts.transports.includes('websocket')) {
        console.log('Falling back to polling transport');
        newSocket.io.opts.transports = ['polling'];
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}; 