const getApiBase = () => {
  const { protocol, hostname } = window.location;
  const port = process.env.REACT_APP_API_PORT || 3020;
  
  // For Railway deployment
  if (hostname.includes('railway.app')) {
    return process.env.REACT_APP_API_URL || `${protocol}//${hostname}`;
  }
  
  // For localhost and local network
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
    return `http://${hostname}:${port}`;
  }
  
  // Default case - use HTTPS for production
  return process.env.REACT_APP_API_URL || `${protocol}//${hostname}`;
};

export default getApiBase; 