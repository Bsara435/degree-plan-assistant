import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";

// Store active users: userId -> socketId
const activeUsers = new Map();

/**
 * Authenticate socket connection using JWT token
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
};

/**
 * Setup Socket.IO event handlers
 */
export const setupSocketIO = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.userId;
    const userName = socket.user.fullName || socket.user.email;

    console.log(`✅ User connected: ${userName} (${userId})`);

    // Add user to active users map
    activeUsers.set(userId, socket.id);

    // Emit online status to all clients
    io.emit("userOnline", { userId, isOnline: true });

    // Join user's personal room for direct messaging
    socket.join(`user_${userId}`);

    // Handle sending a message
    socket.on("sendMessage", async (data) => {
      try {
        const { receiverId, message } = data;

        // Validation
        if (!receiverId || !message || message.trim() === "") {
          socket.emit("error", { message: "receiverId and message are required" });
          return;
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          socket.emit("error", { message: "Receiver not found" });
          return;
        }

        // Prevent sending message to self
        if (receiverId === userId) {
          socket.emit("error", { message: "Cannot send message to yourself" });
          return;
        }

        // Validate user can chat with receiver based on their role
        const currentUser = await User.findById(userId);
        if (currentUser) {
          if (currentUser.role === "student") {
            // Students can only chat with their mentor or advisor
            const mentorId = currentUser.mentor?.toString();
            const advisorId = currentUser.advisor?.toString();
            const receiverIdStr = receiverId.toString();

            if (receiverIdStr !== mentorId && receiverIdStr !== advisorId) {
              socket.emit("error", {
                message: "Students can only chat with their assigned mentor or advisor",
              });
              return;
            }
          } else if (currentUser.role === "advisor") {
            // Advisors can only chat with their assigned students
            const assignedStudents = await User.find({ advisor: userId, role: "student" }).select("_id");
            const assignedStudentIds = assignedStudents.map((s) => s._id.toString());
            
            if (!assignedStudentIds.includes(receiverId.toString())) {
              socket.emit("error", {
                message: "Advisors can only chat with their assigned students",
              });
              return;
            }
          } else if (currentUser.role === "peer_mentor") {
            // Mentors can only chat with their assigned students
            const assignedStudents = await User.find({ mentor: userId, role: "student" }).select("_id");
            const assignedStudentIds = assignedStudents.map((s) => s._id.toString());
            
            if (!assignedStudentIds.includes(receiverId.toString())) {
              socket.emit("error", {
                message: "Mentors can only chat with their assigned students",
              });
              return;
            }
          }
        }

        // Create and save message
        const newMessage = await Message.create({
          sender: userId,
          receiver: receiverId,
          message: message.trim(),
        });

        // Populate sender and receiver
        await newMessage.populate("sender", "fullName email role");
        await newMessage.populate("receiver", "fullName email role");

        // Emit to sender (confirmation)
        socket.emit("messageSent", {
          success: true,
          message: newMessage,
        });

        // Emit to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", {
            success: true,
            message: newMessage,
          });
        } else {
          // If receiver is offline, they'll see it when they connect
          // You could also emit to their room for persistence
          io.to(`user_${receiverId}`).emit("newMessage", {
            success: true,
            message: newMessage,
          });
        }
      } catch (error) {
        console.error("Error sending message via socket:", error);
        socket.emit("error", {
          message: "Failed to send message",
          error: error.message,
        });
      }
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      const { receiverId, isTyping } = data;
      if (receiverId) {
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("userTyping", {
            userId,
            userName,
            isTyping,
          });
        }
      }
    });

    // Handle marking messages as read
    socket.on("markAsRead", async (data) => {
      try {
        const { senderId } = data;

        if (!senderId) {
          socket.emit("error", { message: "senderId is required" });
          return;
        }

        const result = await Message.updateMany(
          {
            sender: senderId,
            receiver: userId,
            isRead: false,
          },
          {
            isRead: true,
            readAt: new Date(),
          }
        );

        // Notify sender that messages were read
        const senderSocketId = activeUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", {
            receiverId: userId,
            count: result.modifiedCount,
          });
        }

        socket.emit("markedAsRead", {
          success: true,
          count: result.modifiedCount,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("error", {
          message: "Failed to mark messages as read",
          error: error.message,
        });
      }
    });

    // Handle user going offline
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${userName} (${userId})`);
      activeUsers.delete(userId);
      io.emit("userOffline", { userId, isOnline: false });
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

/**
 * Get active users count
 */
export const getActiveUsersCount = () => {
  return activeUsers.size;
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

