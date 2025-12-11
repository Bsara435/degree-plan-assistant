// server.js

// ---------------------------
// Imports
// ---------------------------
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
//routes imports
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import advisorRoutes from './routes/advisor.routes.js';
import mentorRoutes from './routes/mentor.routes.js';
import degreePlanRoutes from './routes/degreePlan.routes.js';
import chatRoutes from './routes/chat.routes.js';
// Socket.IO handler
import { setupSocketIO } from './utils/socketHandler.js';

// ---------------------------
// Load environment variables
// ---------------------------
dotenv.config();

// ---------------------------
// Create Express app
// ---------------------------
const app = express();

// ---------------------------
// Middleware
// ---------------------------
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
//auth routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api", degreePlanRoutes);
app.use("/api/chat", chatRoutes);


// ---------------------------
// Log environment info
// ---------------------------
console.log("Environment variables loaded successfully.");
console.log(`Running in ${process.env.NODE_ENV || "development"} mode`);
console.log(`Frontend URL: ${process.env.CLIENT_URL || "Not defined"}`);

// ---------------------------
// MongoDB Connection
// ---------------------------
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is missing in your .env file!");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'degree-plan-assistant', // replace with your DB name if needed
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// ---------------------------
// Health check route
// ---------------------------
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend and .env variables are working correctly ✅",
    status: "ok",
    env: {
      NODE_ENV: process.env.NODE_ENV || "development",
      CLIENT_URL: process.env.CLIENT_URL || "undefined",
    },
  });
});

// ---------------------------
// Create HTTP server and Socket.IO
// ---------------------------
const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Setup Socket.IO handlers
setupSocketIO(io);

// ---------------------------
// Start server
// ---------------------------
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO server initialized`);
});
