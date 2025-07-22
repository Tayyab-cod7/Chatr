const getApiBase = () => {
  const { protocol, hostname } = window.location;
  const port = process.env.REACT_APP_API_PORT || 3020;
  const isProduction = process.env.NODE_ENV === 'production';
  const apiUrl = process.env.REACT_APP_API_URL;
  
  let baseUrl;
  
  // For Railway deployment
  if (hostname.includes('railway.app')) {
    // If REACT_APP_API_URL is set, use it
    if (apiUrl) {
      baseUrl = apiUrl;
      console.log('Using configured API URL:', baseUrl);
    } else {
      // Otherwise, use the same origin but replace the subdomain
      const hostParts = hostname.split('.');
      hostParts[0] = 'divine-nurturing-production'; // Replace frontend subdomain with backend subdomain
      baseUrl = `${protocol}//${hostParts.join('.')}`;
      console.log('Using derived API URL:', baseUrl);
    }
  }
  // For localhost and local network
  else if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
    baseUrl = `http://${hostname}:${port}`;
    console.log('Using local API URL:', baseUrl);
  }
  // Default case - use same origin in production, configured URL otherwise
  else {
    baseUrl = isProduction ? window.location.origin : (apiUrl || `http://localhost:${port}`);
    console.log('Using default API URL:', baseUrl);
  }

  console.log('Final API Base URL:', baseUrl);
  return baseUrl;
};

export default getApiBase; 