import Message from "../models/Message.js";
import User from "../models/User.js";

/**
 * Get all conversations for the authenticated user
 * Returns list of users they've chatted with
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);

    // If user is a student, only show conversations with mentor and advisor
    let allowedPartnerIds = null;
    if (currentUser && currentUser.role === "student") {
      allowedPartnerIds = [];
      if (currentUser.mentor) {
        allowedPartnerIds.push(currentUser.mentor.toString());
      }
      if (currentUser.advisor) {
        allowedPartnerIds.push(currentUser.advisor.toString());
      }
      // If student has no mentor or advisor, return empty conversations
      if (allowedPartnerIds.length === 0) {
        return res.status(200).json({
          success: true,
          conversations: [],
        });
      }
    }

    // Build query for messages
    const messageQuery = {
      $or: [{ sender: userId }, { receiver: userId }],
    };

    // Get all unique conversation partners
    const messages = await Message.find(messageQuery)
      .populate("sender", "fullName email role")
      .populate("receiver", "fullName email role")
      .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const partnerId =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      // Filter for students: only show conversations with mentor/advisor
      if (allowedPartnerIds && !allowedPartnerIds.includes(partnerId)) {
        return;
      }

      if (!conversationsMap.has(partnerId)) {
        const partner =
          msg.sender._id.toString() === userId.toString()
            ? msg.receiver
            : msg.sender;

        // Get unread count
        const unreadCount = messages.filter(
          (m) =>
            m.receiver._id.toString() === userId.toString() &&
            m.sender._id.toString() === partnerId &&
            !m.isRead
        ).length;

        conversationsMap.set(partnerId, {
          partner: {
            _id: partner._id,
            fullName: partner.fullName,
            email: partner.email,
            role: partner.role,
          },
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount,
        });
      }
    });

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

/**
 * Get messages between authenticated user and another user
 */
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate otherUserId
    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "otherUserId is required",
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate user can chat with otherUser based on their role
    const currentUser = await User.findById(userId);
    if (currentUser) {
      if (currentUser.role === "student") {
        // Students can only chat with their mentor or advisor
        const mentorId = currentUser.mentor?.toString();
        const advisorId = currentUser.advisor?.toString();
        const otherUserIdStr = otherUserId.toString();

        if (otherUserIdStr !== mentorId && otherUserIdStr !== advisorId) {
          return res.status(403).json({
            success: false,
            message: "Students can only view messages with their assigned mentor or advisor",
          });
        }
      } else if (currentUser.role === "advisor") {
        // Advisors can only chat with their assigned students
        const assignedStudents = await User.find({ advisor: userId, role: "student" }).select("_id");
        const assignedStudentIds = assignedStudents.map((s) => s._id.toString());
        
        if (!assignedStudentIds.includes(otherUserId.toString())) {
          return res.status(403).json({
            success: false,
            message: "Advisors can only chat with their assigned students",
          });
        }
      } else if (currentUser.role === "peer_mentor") {
        // Mentors can only chat with their assigned students
        const assignedStudents = await User.find({ mentor: userId, role: "student" }).select("_id");
        const assignedStudentIds = assignedStudents.map((s) => s._id.toString());
        
        if (!assignedStudentIds.includes(otherUserId.toString())) {
          return res.status(403).json({
            success: false,
            message: "Mentors can only chat with their assigned students",
          });
        }
      }
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .populate("sender", "fullName email role")
      .populate("receiver", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read where current user is receiver
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      otherUser: {
        _id: otherUser._id,
        fullName: otherUser.fullName,
        email: otherUser.email,
        role: otherUser.role,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

/**
 * Send a message (REST API endpoint)
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId, message } = req.body;

    // Validation
    if (!receiverId || !message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "receiverId and message are required",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Prevent sending message to self
    if (receiverId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send message to yourself",
      });
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
          return res.status(403).json({
            success: false,
            message: "Students can only chat with their assigned mentor or advisor",
          });
        }
      } else if (currentUser.role === "advisor") {
        // Advisors can only chat with their assigned students
        const assignedStudents = await User.find({ advisor: userId, role: "student" }).select("_id");
        const assignedStudentIds = assignedStudents.map((s) => s._id.toString());
        
        if (!assignedStudentIds.includes(receiverId.toString())) {
          return res.status(403).json({
            success: false,
            message: "Advisors can only chat with their assigned students",
          });
        }
      } else if (currentUser.role === "peer_mentor") {
        // Mentors can only chat with their assigned students
        const assignedStudents = await User.find({ mentor: userId, role: "student" }).select("_id");
        const assignedStudentIds = assignedStudents.map((s) => s._id.toString());
        
        if (!assignedStudentIds.includes(receiverId.toString())) {
          return res.status(403).json({
            success: false,
            message: "Mentors can only chat with their assigned students",
          });
        }
      }
    }

    // Create message
    const newMessage = await Message.create({
      sender: userId,
      receiver: receiverId,
      message: message.trim(),
    });

    // Populate sender and receiver
    await newMessage.populate("sender", "fullName email role");
    await newMessage.populate("receiver", "fullName email role");

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.params;

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: "senderId is required",
      });
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

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

/**
 * Delete a message (soft delete or hard delete)
 */
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender or receiver can delete
    if (
      message.sender.toString() !== userId.toString() &&
      message.receiver.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

/**
 * Get assigned contacts for the authenticated user
 * - For students: returns their advisor and mentor
 * - For advisors: returns their assigned students
 * - For mentors: returns their assigned students
 */
export const getAssignedContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId).populate("mentor", "fullName email role").populate("advisor", "fullName email role");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const contacts = [];

    if (currentUser.role === "student") {
      // For students, return advisor and mentor
      if (currentUser.advisor) {
        contacts.push({
          _id: currentUser.advisor._id,
          fullName: currentUser.advisor.fullName,
          email: currentUser.advisor.email,
          role: currentUser.advisor.role,
          relationship: "advisor",
        });
      }
      if (currentUser.mentor) {
        contacts.push({
          _id: currentUser.mentor._id,
          fullName: currentUser.mentor.fullName,
          email: currentUser.mentor.email,
          role: currentUser.mentor.role,
          relationship: "mentor",
        });
      }
    } else if (currentUser.role === "advisor") {
      // For advisors, return assigned students
      const students = await User.find({ advisor: userId, role: "student" })
        .select("fullName email role major classification")
        .populate("mentor", "fullName email role")
        .sort({ fullName: 1 });

      students.forEach((student) => {
        contacts.push({
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          role: student.role,
          relationship: "student",
          major: student.major,
          classification: student.classification,
          mentor: student.mentor ? {
            _id: student.mentor._id,
            fullName: student.mentor.fullName,
            email: student.mentor.email,
          } : null,
        });
      });
    } else if (currentUser.role === "peer_mentor") {
      // For mentors, return assigned students
      const students = await User.find({ mentor: userId, role: "student" })
        .select("fullName email role major classification")
        .populate("advisor", "fullName email role")
        .sort({ fullName: 1 });

      students.forEach((student) => {
        contacts.push({
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          role: student.role,
          relationship: "student",
          major: student.major,
          classification: student.classification,
          advisor: student.advisor ? {
            _id: student.advisor._id,
            fullName: student.advisor.fullName,
            email: student.advisor.email,
          } : null,
        });
      });
    }

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching assigned contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned contacts",
      error: error.message,
    });
  }
};

