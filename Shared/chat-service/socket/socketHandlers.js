import chatHandler from '../socket/middleware/handlers/chatHandler.js';
import authMiddleware from './middleware/authMiddleware.js'; // ✅ Import from socket/middleware

const initializeSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(authMiddleware);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle user online status
    socket.on('user_online', () => {
      socket.broadcast.emit('user_status', {
        userId: socket.userId,
        status: 'online'
      });
    });

    // Chat handlers
    chatHandler(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      socket.broadcast.emit('user_status', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  console.log('Socket.IO handlers initialized');
};

export default initializeSocketHandlers;