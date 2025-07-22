const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./User');
const jwt = require('jsonwebtoken');
const Message = require('./Message');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      process.env.FRONTEND_URL, // Your Railway frontend URL
    ].filter(Boolean); // Remove undefined values
    
    // Allow local network IPs (192.168.*)
    if (/^http:\/\/192\.168\./.test(origin)) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('API is running');
});

app.post('/register', async (req, res) => {
  const { fullName, phone, password } = req.body;
  if (!fullName || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, phone, password: hashedPassword });
    await user.save();
    // Return user object
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        profilePhoto: user.profilePhoto || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Phone number does not exist' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password does not match' });
    }
    const token = jwt.sign({ userId: user._id, phone: user.phone }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        profilePhoto: user.profilePhoto || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const { userId } = req.query;
    const users = await User.find(userId ? { _id: { $ne: userId } } : {});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      profilePhoto: user.profilePhoto || '',
      about: user.about || "Moon 🌙 Is beautiful isn't it ?"
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
    if (req.body.about !== undefined) user.about = req.body.about;
    // Add more fields here if needed (e.g., phone)
    await user.save();
    res.json({ _id: user._id, fullName: user.fullName, phone: user.phone, profilePhoto: user.profilePhoto || '', about: user.about });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Attempting to delete user:', userId);
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    // Delete profile photo from disk if exists
    if (user.profilePhoto) {
      let photoFilename = user.profilePhoto;
      console.log('User profilePhoto value:', photoFilename);
      // If the profilePhoto is a URL, extract the filename
      if (photoFilename.startsWith('http')) {
        try {
          const urlParts = photoFilename.split('/');
          photoFilename = urlParts[urlParts.length - 1];
        } catch (e) {}
      }
      const photoPath = path.join(__dirname, 'uploads', photoFilename);
      console.log('Computed photoPath:', photoPath);
      console.log('File exists before deletion:', fs.existsSync(photoPath));
      if (fs.existsSync(photoPath)) {
        try {
          fs.unlinkSync(photoPath);
          console.log('Deleted profile photo:', photoPath);
        } catch (err) {
          console.error('Failed to delete profile photo:', photoPath, err);
        }
      } else {
        console.log('Profile photo file not found:', photoPath);
      }
    }
    await Message.deleteMany({ $or: [ { senderId: userId }, { receiverId: userId } ] });
    res.json({ message: 'User, their messages, and profile photo deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/users', async (req, res) => {
  try {
    // Delete all users
    await User.deleteMany({});
    // Delete all messages
    await Message.deleteMany({});
    res.json({ message: 'All users and their messages deleted successfully' });
  } catch (err) {
    console.error('Error deleting all users:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/messages', async (req, res) => {
  const { userId, otherUserId } = req.query;
  if (!userId || !otherUserId) {
    return res.status(400).json({ message: 'userId and otherUserId are required' });
  }
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/messages', async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ message: 'senderId, receiverId, and text are required' });
  }
  try {
    const message = new Message({ senderId, receiverId, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/test-delete-route', (req, res) => {
  res.send('DELETE route file is running!');
});

app.get('/users/phone/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      profilePhoto: user.profilePhoto || '',
      about: user.about || 'Available'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/users/:id/contacts', async (req, res) => {
  try {
    const userId = req.params.id;
    const { contactId } = req.body;
    if (!contactId) return res.status(400).json({ message: 'contactId is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.contacts.includes(contactId)) {
      return res.status(400).json({ message: 'User already in contacts' });
    }
    user.contacts.push(contactId);
    await user.save();
    res.json({ message: 'Contact added successfully', contacts: user.contacts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/users/:id/contacts', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('contacts', '_id fullName phone profilePhoto about');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.contacts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Serve uploads statically
app.use('/uploads', express.static('uploads'));

// Upload and update profile photo
app.post('/users/:id/profile-photo', upload.single('photo'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Delete old photo if exists
    if (user.profilePhoto) {
      const oldPath = path.join(__dirname, 'uploads', user.profilePhoto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // Save new photo filename
    user.profilePhoto = req.file.filename;
    await user.save();
    res.json({ message: 'Profile photo updated', profilePhoto: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/users/:id/profile-photo', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.profilePhoto) {
      const photoPath = path.join(__dirname, 'uploads', user.profilePhoto);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      user.profilePhoto = '';
      await user.save();
    }
    res.json({ message: 'Profile photo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all chat users (contacts + messaged users, excluding admin)
app.get('/users/:id/chats', async (req, res) => {
  try {
    const userId = req.params.id;
    // Find the user and their contacts
    const user = await User.findById(userId).populate('contacts', '_id fullName phone profilePhoto about');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find all users who have exchanged messages with this user
    const sentMessages = await Message.find({ senderId: userId }).distinct('receiverId');
    const receivedMessages = await Message.find({ receiverId: userId }).distinct('senderId');
    const messagedUserIds = Array.from(new Set([...sentMessages, ...receivedMessages]));

    // Combine contacts and messaged users
    const contactIds = user.contacts.map(c => c._id.toString());
    const allUserIds = Array.from(new Set([...contactIds, ...messagedUserIds]));
    // Remove self
    const filteredUserIds = allUserIds.filter(id => id !== userId);

    // Fetch user details, exclude admin (phone === 'admin' or set a specific phone)
    // For now, let's assume admin phone is 'admin' (change as needed)
    const users = await User.find({ _id: { $in: filteredUserIds }, phone: { $ne: 'admin' } }, '_id fullName phone profilePhoto about');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- Socket.IO integration ---
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev/mobile testing
    methods: ['GET', 'POST']
  }
});

const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Listen for user identification
  socket.on('identify', (userId) => {
    userSocketMap[userId] = socket.id;
  });

  socket.on('send-message', async (data) => {
    try {
      const message = new Message({ senderId: data.senderId, receiverId: data.receiverId, text: data.text });
      const saved = await message.save();
      
      // Only emit the message once when it's newly created
      if (userSocketMap[data.senderId]) {
        io.to(userSocketMap[data.senderId]).emit('receive-message', saved);
      }
      if (userSocketMap[data.receiverId]) {
        io.to(userSocketMap[data.receiverId]).emit('receive-message', saved);
      }
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from userSocketMap
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT} and on your local network.`);
}); 