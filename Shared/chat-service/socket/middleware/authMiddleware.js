import jwt from 'jsonwebtoken';
import pool from '../../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const authMiddleware = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('Socket decoded token:', decoded);
    
    // Attach user info to socket
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;

    // Optionally fetch user details from database
    try {
      const result = await pool.query(
        'SELECT id, name, email, image FROM users WHERE id = $1',
        [socket.userId]
      );
      
      if (result.rows.length > 0) {
        socket.userName = result.rows[0].name;
        socket.userImage = result.rows[0].image;
      }
    } catch (dbError) {
      console.error('Error fetching user details for socket:', dbError);
    }

    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

export default authMiddleware;