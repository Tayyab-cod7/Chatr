const getApiBase = () => {
  const { protocol, hostname } = window.location;
  const port = process.env.REACT_APP_API_PORT || 3020;
  const isProduction = process.env.NODE_ENV === 'production';
  
  let baseUrl;
  
  // For Railway deployment
  if (hostname.includes('railway.app')) {
    baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
  }
  // For localhost and local network
  else if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
    baseUrl = `http://${hostname}:${port}`;
  }
  // Default case - use same origin in production, configured URL otherwise
  else {
    baseUrl = isProduction ? window.location.origin : process.env.REACT_APP_API_URL;
  }

  console.log('API Base URL:', `${baseUrl}/api`);
  return `${baseUrl}/api`;
};

export default getApiBase; 