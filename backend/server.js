const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const labRoutes = require('./routes/labs');
const userRoutes = require('./routes/users');
const institutionRoutes = require('./routes/institutions');
const resourceRoutes = require('./routes/resources');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = require('http').createServer(app);

// CORS configuration - Move up to fix ReferenceError in Socket.io init
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2
].filter(Boolean);

const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// In-memory store for active sessions
const activeSessions = new Map();
// Map socket.id -> { courseId, user } for cleanup on disconnect
const socketUserMap = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join_session', ({ courseId, user }) => {
    socket.join(courseId);
    socketUserMap.set(socket.id, { courseId, user });
    console.log(`👤 User ${user.name} (${user.role}) joined session: ${courseId}`);

    // Get or create session
    if (!activeSessions.has(courseId)) {
      activeSessions.set(courseId, {
        courseId,
        teacherId: null,
        teacherName: null,
        startedAt: new Date(),
        participants: [],
        labState: null
      });
    }

    const session = activeSessions.get(courseId);

    // Set teacher info
    if (user.role === 'teacher') {
      session.teacherId = user._id;
      session.teacherName = user.name;
    }

    // Add participant (avoid duplicates by socket id)
    session.participants = session.participants.filter(p => p.socketId !== socket.id);
    session.participants.push({
      socketId: socket.id,
      _id: user._id,
      name: user.name,
      role: user.role,
      joinedAt: new Date()
    });

    // Broadcast updated participant list to everyone in the room
    io.to(courseId).emit('participants_updated', session.participants);
    // Broadcast session list globally (for dashboard discovery)
    io.emit('sessions_updated', Array.from(activeSessions.values()));

    // Send current lab state to the new joiner if one exists
    if (session.labState) {
      socket.emit('lab_state_updated', session.labState);
    }

    // Inform if there is an active screen share
    if (session.screenSharerSocketId) {
      socket.emit('screen_share_started', { teacherSocketId: session.screenSharerSocketId });
    }
  });

  socket.on('lab_sync', ({ courseId, labState }) => {
    // Store the lab state so new joiners get it
    const session = activeSessions.get(courseId);
    if (session) {
      session.labState = labState;
    }
    // Broadcast to ALL in room (including sender for confirmation)
    io.to(courseId).emit('lab_state_updated', labState);
  });

  socket.on('raise_hand', ({ courseId, user }) => {
    socket.to(courseId).emit('student_raised_hand', user);
  });

  socket.on('lower_hand', ({ courseId, userId }) => {
    socket.to(courseId).emit('student_lowered_hand', userId);
  });

  // WebRTC signaling for screen sharing
  socket.on('webrtc_offer', ({ courseId, offer, targetSocketId }) => {
    io.to(targetSocketId).emit('webrtc_offer', { offer, fromSocketId: socket.id });
  });

  socket.on('webrtc_answer', ({ courseId, answer, targetSocketId }) => {
    io.to(targetSocketId).emit('webrtc_answer', { answer, fromSocketId: socket.id });
  });

  socket.on('webrtc_ice_candidate', ({ courseId, candidate, targetSocketId }) => {
    io.to(targetSocketId).emit('webrtc_ice_candidate', { candidate, fromSocketId: socket.id });
  });

  // Teacher starts screen sharing — notify all students
  socket.on('screen_share_started', ({ courseId }) => {
    const session = activeSessions.get(courseId);
    if (session) {
      session.screenSharerSocketId = socket.id;
    }
    socket.to(courseId).emit('screen_share_started', { teacherSocketId: socket.id });
  });

  // Teacher stops screen sharing
  socket.on('screen_share_stopped', ({ courseId }) => {
    const session = activeSessions.get(courseId);
    if (session) {
      session.screenSharerSocketId = null;
    }
    socket.to(courseId).emit('screen_share_stopped');
  });

  socket.on('end_session', ({ courseId }) => {
    activeSessions.delete(courseId);
    io.to(courseId).emit('session_ended');
    io.emit('sessions_updated', Array.from(activeSessions.values()));
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    const userData = socketUserMap.get(socket.id);
    if (userData) {
      const { courseId } = userData;
      const session = activeSessions.get(courseId);
      if (session) {
        // Clear screen sharer if they are the one leaving
        if (session.screenSharerSocketId === socket.id) {
          session.screenSharerSocketId = null;
          socket.to(courseId).emit('screen_share_stopped');
        }

        session.participants = session.participants.filter(p => p.socketId !== socket.id);
        io.to(courseId).emit('participants_updated', session.participants);

        // If no participants left, remove session
        if (session.participants.length === 0) {
          activeSessions.delete(courseId);
        }
        io.emit('sessions_updated', Array.from(activeSessions.values()));
      }
      socketUserMap.delete(socket.id);
    }
  });
});

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isVercelPreview = /\.vercel\.app$/.test(origin);

    if (isExplicitlyAllowed || isVercelPreview) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-lab-lms';
if (mongoUri && mongoUri.trim() !== '') {
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
      console.warn('⚠️ MongoDB connection failed - running in frontend-only mode');
      console.warn('To enable full functionality, install MongoDB or set MONGODB_URI environment variable');
    });
} else {
  console.log('ℹ️ MongoDB connection disabled - running in frontend-only mode');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/users', userRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/resources', resourceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Virtual Lab LMS API is running',
    timestamp: new Date().toISOString()
  });
});

// Live sessions endpoint
app.get('/api/live-sessions', (req, res) => {
  res.json(Array.from(activeSessions.values()));
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Virtual Lab LMS API ready at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
