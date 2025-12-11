import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage,
  getAssignedContacts,
} from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Get assigned contacts (advisor/mentor for students, assigned students for advisors/mentors)
router.get("/contacts", getAssignedContacts);

// Get all conversations for the authenticated user
router.get("/conversations", getConversations);

// Get messages between authenticated user and another user
router.get("/messages/:otherUserId", getMessages);

// Send a message
router.post("/send", sendMessage);

// Mark messages as read
router.put("/read/:senderId", markAsRead);

// Get unread message count
router.get("/unread", getUnreadCount);

// Delete a message
router.delete("/message/:messageId", deleteMessage);

export default router;

