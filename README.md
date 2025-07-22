# Chatr - Real-time Chat Application

## Deployment Guide for Railway

This guide will help you deploy the Chatr application on Railway properly.

### Prerequisites

- A Railway account
- Git installed on your local machine

### Deployment Steps

1. **Push your code to a GitHub repository**

2. **Create a new project on Railway**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" and select "Deploy from GitHub repo"
   - Select your repository

3. **Configure environment variables**
   - In your Railway project, go to the "Variables" tab
   - Add the following environment variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secret key for JWT token generation
     - `NODE_ENV`: Set to `production`
     - `PORT`: Railway will set this automatically

4. **Deploy the application**
   - Railway will automatically deploy your application based on the Procfile
   - The Procfile should contain:
     ```
     backend: cd server && npm start
     frontend: cd client && npm run build && npm start
     ```

### Troubleshooting

#### Socket.IO Connection Issues

If you're experiencing Socket.IO connection issues:

1. Make sure your CORS settings in the server are properly configured to accept connections from your frontend domain.

2. Check that the Socket.IO client is connecting to the correct server URL.

#### API Endpoint 404 Errors

If you're getting 404 errors when trying to access API endpoints:

1. Ensure that the API routes in the server match the routes being called from the client.

2. The server routes should be `/register` and `/login` (not `/api/register` and `/api/login`).

### Monitoring

- Use Railway's logs to monitor your application for any errors
- Check both frontend and backend logs for issues

### Scaling

- Railway automatically scales your application based on usage
- You can adjust the scaling settings in the Railway dashboard

## Local Development

### Server

```bash
cd server
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```