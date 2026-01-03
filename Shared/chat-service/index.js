import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Server } from 'socket.io';
import chatRoutes from './routes/chatRoutes.js'
import http from 'http';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dotenv.config();
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: join(__dirname, '.env.production') });
} else {
  dotenv.config({ path: join(__dirname, '.env') });
}

const app = express();

// Create HTTP server
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:3003",
  "https://tire.rierco.net",
  "https://lab.rierco.net",
];

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
        "http://localhost:3000",
        "http://localhost:3003",
         "https://tire.rierco.net",
         "https://lab.rierco.net",
    ],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Make io accessible to your routes
app.set('io', io);
app.use('/api/chat', chatRoutes); 

import initializeSocketHandlers from './socket/socketHandlers.js';
initializeSocketHandlers(io);

const PORT = process.env.PORT || 3006;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`)); // ✅ Also fixed template literal syntax

export default server;