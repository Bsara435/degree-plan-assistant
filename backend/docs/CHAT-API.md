# Chat API Documentation

## Overview
The chat system provides both REST API endpoints and real-time Socket.IO communication for messaging between users.

## REST API Endpoints

All endpoints require authentication via Bearer token in the Authorization header.

### Base URL
```
/api/chat
```

### 1. Get All Conversations
Get a list of all conversations for the authenticated user.

**Endpoint:** `GET /api/chat/conversations`

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "partner": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "student"
      },
      "lastMessage": "Hello!",
      "lastMessageTime": "2024-01-15T10:30:00.000Z",
      "unreadCount": 2
    }
  ]
}
```

### 2. Get Messages
Get messages between the authenticated user and another user.

**Endpoint:** `GET /api/chat/messages/:otherUserId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "message_id",
      "sender": {
        "_id": "sender_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "student"
      },
      "receiver": {
        "_id": "receiver_id",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "role": "advisor"
      },
      "message": "Hello!",
      "isRead": true,
      "readAt": "2024-01-15T10:35:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "otherUser": {
    "_id": "other_user_id",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "role": "advisor"
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10
  }
}
```

### 3. Send Message
Send a message via REST API.

**Endpoint:** `POST /api/chat/send`

**Request Body:**
```json
{
  "receiverId": "user_id",
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "_id": "message_id",
    "sender": {...},
    "receiver": {...},
    "message": "Hello, how are you?",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Mark Messages as Read
Mark all messages from a specific sender as read.

**Endpoint:** `PUT /api/chat/read/:senderId`

**Response:**
```json
{
  "success": true,
  "message": "Marked 5 messages as read",
  "count": 5
}
```

### 5. Get Unread Count
Get the total number of unread messages for the authenticated user.

**Endpoint:** `GET /api/chat/unread`

**Response:**
```json
{
  "success": true,
  "unreadCount": 10
}
```

### 6. Delete Message
Delete a message (only sender or receiver can delete).

**Endpoint:** `DELETE /api/chat/message/:messageId`

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

## Socket.IO Events

### Connection
Connect to Socket.IO server with authentication token.

**Connection:**
```javascript
const socket = io('http://localhost:4000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Client Events (Emit)

#### 1. Send Message
Send a message in real-time.

**Event:** `sendMessage`

**Data:**
```json
{
  "receiverId": "user_id",
  "message": "Hello!"
}
```

#### 2. Typing Indicator
Notify that user is typing.

**Event:** `typing`

**Data:**
```json
{
  "receiverId": "user_id",
  "isTyping": true
}
```

#### 3. Mark as Read
Mark messages as read in real-time.

**Event:** `markAsRead`

**Data:**
```json
{
  "senderId": "user_id"
}
```

### Server Events (Listen)

#### 1. Message Sent (Confirmation)
Confirmation that your message was sent.

**Event:** `messageSent`

**Data:**
```json
{
  "success": true,
  "message": {
    "_id": "message_id",
    "sender": {...},
    "receiver": {...},
    "message": "Hello!",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. New Message
Receive a new message from another user.

**Event:** `newMessage`

**Data:**
```json
{
  "success": true,
  "message": {
    "_id": "message_id",
    "sender": {...},
    "receiver": {...},
    "message": "Hello!",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. User Typing
Receive typing indicator from another user.

**Event:** `userTyping`

**Data:**
```json
{
  "userId": "user_id",
  "userName": "John Doe",
  "isTyping": true
}
```

#### 4. Messages Read
Notification that your messages were read.

**Event:** `messagesRead`

**Data:**
```json
{
  "receiverId": "user_id",
  "count": 5
}
```

#### 5. Marked as Read (Confirmation)
Confirmation that messages were marked as read.

**Event:** `markedAsRead`

**Data:**
```json
{
  "success": true,
  "count": 5
}
```

#### 6. User Online/Offline
Notification when a user comes online or goes offline.

**Event:** `userOnline` or `userOffline`

**Data:**
```json
{
  "userId": "user_id",
  "isOnline": true
}
```

#### 7. Error
Error notification.

**Event:** `error`

**Data:**
```json
{
  "message": "Error message here"
}
```

## Example Usage

### REST API Example (JavaScript/Fetch)
```javascript
// Get conversations
const response = await fetch('http://localhost:4000/api/chat/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Send message
const sendResponse = await fetch('http://localhost:4000/api/chat/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    receiverId: 'user_id',
    message: 'Hello!'
  })
});
```

### Socket.IO Example (JavaScript)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Listen for new messages
socket.on('newMessage', (data) => {
  console.log('New message:', data.message);
});

// Send a message
socket.emit('sendMessage', {
  receiverId: 'user_id',
  message: 'Hello!'
});

// Typing indicator
socket.emit('typing', {
  receiverId: 'user_id',
  isTyping: true
});

// Mark as read
socket.emit('markAsRead', {
  senderId: 'user_id'
});
```

## Authentication

All REST API endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Socket.IO connections require the token in the auth object:
```javascript
{
  auth: {
    token: '<token>'
  }
}
```

## Error Handling

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (in development)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

