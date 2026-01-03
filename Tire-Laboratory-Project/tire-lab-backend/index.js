// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// // import { Server } from 'socket.io';
// // import http from 'http';

// // Get directory name in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // dotenv.config();
// if (process.env.NODE_ENV === 'production') {
//   dotenv.config({ path: join(__dirname, '.env.production') });
// } else {
//   dotenv.config({ path: join(__dirname, '.env.development') });
// }

// const app = express();

// // Create HTTP server
// const server = http.createServer(app);

// // Initialize Socket.IO with CORS
// const io = new Server(server, {
//   cors: {
//     origin: [
//       'https://tire.rierco.net',
//       'http://localhost:5173',
//       'http://localhost:8080',
//       'http://194.180.11.232:8080'
//     ],
//     credentials: true,
//     methods: ["GET", "POST"]
//   }
// });

// app.use(cors({
//   origin: [
//     'https://tire.rierco.net',
//     'http://localhost:5173',
//     'http://localhost:8080',
//     'http://194.180.11.232:8080'
//   ],
//   credentials: true
// }));

// app.use(express.json());

// // Make io accessible to your routes
// app.set('io', io);

// import authRoutes from './routes/authRoutes.js'
// import userRoutes from './routes/usersRoutes.js'
// import depositoryRecordsRoutes from './routes/depositoryRecordsRoutes.js'
// import receptoryRecordsRoutes from './routes/receptoryRecordsRoutes.js'
// import laboratoryRecordsRoutes from './routes/laboratoryRecordsRoutes.js'
// import newEntriesRoutes from './routes/newEntriesRoutes.js'
// import dashboardRoutes from './routes/dashboardRoutes.js'
// import countriesRoutes from './routes/tire_data_routes/countriesRoutes.js'
// import sizesRoutes from './routes/tire_data_routes/sizesRoutes.js'
// import customersRoutes from './routes/tire_data_routes/customersRoutes.js'
// import brandsRoutes from './routes/tire_data_routes/brandsRoutes.js'
// import retrievalFormRoutes from './routes/retrievalFormRoutes.js'
// import chatRoutes from './routes/chatRoutes.js'

// app.use('/auth', authRoutes);
// app.use('/users', userRoutes);
// app.use('/depositoryRecords', depositoryRecordsRoutes)
// app.use('/receptoryRecords', receptoryRecordsRoutes)
// app.use('/laboratoryRecords', laboratoryRecordsRoutes)
// app.use('/newEntries', newEntriesRoutes)
// app.use('/dashboard', dashboardRoutes)
// app.use('/countries', countriesRoutes);
// app.use('/brands', brandsRoutes);
// app.use('/sizes', sizesRoutes);
// app.use('/customers', customersRoutes);
// app.use('/retrievalForm', retrievalFormRoutes);
// app.use('/chat', chatRoutes);

// // // Debug log to see all registered routes
// // console.log('✅ Registered routes:');
// // console.log('   - /auth');
// // console.log('   - /users');
// // console.log('   - /chat'); // This is the correct path
// // console.log('   - /depositoryRecords');
// // console.log('   - /receptoryRecords');
// // console.log('   - /laboratoryRecords');
// // console.log('   - /newEntries');
// // console.log('   - /dashboard');
// // console.log('   - /countries');
// // console.log('   - /brands');
// // console.log('   - /sizes');
// // console.log('   - /customers');
// // console.log('   - /retrievalForm');

// import initializeSocketHandlers from './socket/socketHandlers.js';
// initializeSocketHandlers(io);

// const PORT = process.env.PORT || 5050;
// server.listen(PORT, () => console.log(`Server is running on port ${PORT}`)); // ✅ Also fixed template literal syntax

// export default server;
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dotenv.config();
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: join(__dirname, ".env.production") });
} else {
  dotenv.config({ path: join(__dirname, ".env.development") });
}

import depositoryRecordsRoutes from "./routes/depositoryRecordsRoutes.js";
import receptoryRecordsRoutes from "./routes/receptoryRecordsRoutes.js";
import laboratoryRecordsRoutes from "./routes/laboratoryRecordsRoutes.js";
import newEntriesRoutes from "./routes/newEntriesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import countriesRoutes from "./routes/tire_data_routes/countriesRoutes.js";
import sizesRoutes from "./routes/tire_data_routes/sizesRoutes.js";
import customersRoutes from "./routes/tire_data_routes/customersRoutes.js";
import brandsRoutes from "./routes/tire_data_routes/brandsRoutes.js";
import retrievalFormRoutes from "./routes/retrievalFormRoutes.js";

const app = express();

// Simple test route
app.get("/test", (req, res) => {
  res.json({ message: "Test route works!", timestamp: new Date() });
});

app.get("/test", (req, res) => {
  res.json({ message: "Root test works!" });
});

app.use(
  cors({
    origin: [
      "https://tire.rierco.net",
      "http://localhost:3000",
      "http://localhost:3004",
      "http://localhost:8080",
      "http://194.180.11.232:8080",
    ],

    credentials: true,
  })
);

app.use(express.json());

app.use("/api/depositoryRecords", depositoryRecordsRoutes);
app.use("/api/receptoryRecords", receptoryRecordsRoutes);
app.use("/api/laboratoryRecords", laboratoryRecordsRoutes);
app.use("/api/newEntries", newEntriesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/sizes", sizesRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/retrievalForm", retrievalFormRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
