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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    const connectSocket = () => {
      const apiBase = getApiBase().replace('/api', ''); // Remove /api for Socket.IO
      console.log('Connecting to Socket.IO server at:', apiBase);

      const newSocket = io(apiBase, {
        transports: ['polling', 'websocket'],
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        reconnectionAttempts: MAX_RETRIES,
        reconnectionDelay: 1000 * Math.min(retryCount + 1, 5), // Exponential backoff up to 5 seconds
        timeout: 20000,
        autoConnect: true,
        forceNew: true,
        path: '/socket.io'
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setConnected(true);
        setRetryCount(0);
        
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
        setConnected(false);
        
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          console.log(`Retrying connection (${retryCount + 1}/${MAX_RETRIES})...`);
          
          // Try to reconnect with polling if websocket fails
          if (newSocket.io.opts.transports.includes('websocket')) {
            console.log('Falling back to polling transport');
            newSocket.io.opts.transports = ['polling'];
          }
        } else {
          console.log('Max retries reached, stopping reconnection attempts');
          newSocket.close();
        }
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          console.log('Cleaning up socket connection');
          newSocket.removeAllListeners();
          newSocket.close();
        }
      };
    };

    const cleanup = connectSocket();
    return cleanup;
  }, [retryCount]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}; 