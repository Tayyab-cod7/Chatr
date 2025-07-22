const getApiBase = () => {
  const { protocol, hostname } = window.location;
  const port = process.env.REACT_APP_API_PORT || 3020;
  
  // For Railway deployment
  if (hostname.includes('railway.app')) {
    return `${protocol}//${hostname}`;
  }
  
  // For localhost and local network
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
    return `http://${hostname}:${port}`;
  }
  
  // Default case
  return `${protocol}//${hostname}:${port}`;
};

export default getApiBase; 