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
      const apiBase = getApiBase();
      console.log('Connecting to Socket.IO server at:', apiBase);

      const newSocket = io(apiBase, {
        path: '/socket.io/',
        transports: ['polling', 'websocket'],
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        reconnectionAttempts: MAX_RETRIES,
        reconnectionDelay: 1000 * Math.min(retryCount + 1, 5), // Exponential backoff up to 5 seconds
        timeout: 20000,
        autoConnect: true,
        forceNew: true,
        withCredentials: true,
        extraHeaders: {
          'Access-Control-Allow-Credentials': 'true'
        }
      });

      // Debug listeners
      newSocket.io.on("packet", ({ type, data }) => {
        console.log('Socket packet:', type, data);
      });

      newSocket.io.on("reconnect_attempt", (attempt) => {
        console.log('Socket reconnection attempt:', attempt);
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
        setConnected(true);
        setRetryCount(0);
        
        // Identify user if available
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
          console.log('Identifying user:', user._id);
          newSocket.emit('identify', user._id);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error.message);
        setConnected(false);
        
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          console.log(`Retrying connection (${retryCount + 1}/${MAX_RETRIES})...`);
          
          // Try to reconnect with polling if websocket fails
          if (newSocket.io.opts.transports.includes('websocket')) {
            console.log('Falling back to polling transport');
            newSocket.io.opts.transports = ['polling'];
            newSocket.connect(); // Force reconnect with new transport
          }
        } else {
          console.log('Max retries reached, stopping reconnection attempts');
          newSocket.close();
        }
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Handle ping/pong
      newSocket.on('ping', () => {
        console.log('Socket ping');
      });

      newSocket.on('pong', (latency) => {
        console.log('Socket pong, latency:', latency, 'ms');
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

  // Provide both socket and connection status
  const value = {
    socket,
    connected,
    retryCount,
    maxRetries: MAX_RETRIES
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 