const getApiBase = () => {
  const { protocol, hostname } = window.location;
  const port = process.env.REACT_APP_API_PORT || 3020;
  
  let baseUrl;
  
  // For Railway deployment
  if (hostname.includes('railway.app')) {
    baseUrl = process.env.REACT_APP_API_URL || `${protocol}//${hostname}`;
  }
  // For localhost and local network
  else if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
    baseUrl = `http://${hostname}:${port}`;
  }
  // Default case - use HTTPS for production
  else {
    baseUrl = process.env.REACT_APP_API_URL || `${protocol}//${hostname}`;
  }

  return `${baseUrl}/api`;
};

export default getApiBase; 