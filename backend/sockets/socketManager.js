const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

let io;

module.exports = {
  init: (httpServer, app) => {
    io = new Server(httpServer, {
      cors: {
        origin: env.CORS_ORIGINS,
        methods: ['GET', 'POST'],
      },
    });

    // expose io to all routes via req.app.get('io')
    app.set('io', io);

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (token) {
        try {
          const payload = jwt.verify(token, env.JWT_SECRET);
          socket.data.user = payload;
        } catch (err) {
          // Ignore, guest user
        }
      }
      next();
    });

    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);

      // Existing watch-party events
      socket.on('join-room', ({ roomCode, userName }) => {
        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.userName = userName || 'Guest';

        socket.to(roomCode).emit('user-joined', {
          userName: socket.data.userName,
        });
      });

      socket.on('player-action', (payload) => {
        const { roomCode } = payload;
        if (!roomCode) return;
        socket.to(roomCode).emit('player-action', payload);
      });

      socket.on('chat-message', ({ roomCode, userName, message }) => {
        if (!roomCode || !message?.trim()) return;

        io.to(roomCode).emit('chat-message', {
          userName: userName || socket.data.userName || 'Guest',
          message,
          ts: Date.now(),
        });
      });

      // New: Dashboard live analytics room
      socket.on('join-dashboard', () => {
        if (socket.data.user && socket.data.user.role === 'admin') {
          socket.join('admin-dashboard');
        } else {
          socket.emit('error', 'Unauthorized to join admin dashboard');
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
