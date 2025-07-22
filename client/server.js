const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Enable CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 