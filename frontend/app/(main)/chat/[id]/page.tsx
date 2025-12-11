"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { chatAPI, Message } from "../../../../lib/api";
import { useSocket } from "../../../../hooks/useSocket";

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const otherUserId = params.id as string;
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{
    _id: string;
    fullName: string;
    email: string;
    role: string;
  } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    if (otherUserId) {
      fetchMessages();
    }
  }, [otherUserId, router]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: { success: boolean; message: Message }) => {
      if (data.success && data.message) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((msg) => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
        // Mark as read if it's from the other user
        if (data.message.sender._id === otherUserId) {
          socket.emit("markAsRead", { senderId: otherUserId });
        }
        scrollToBottom();
      }
    };

    const handleMessageSent = (data: { success: boolean; message: Message }) => {
      if (data.success && data.message) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
        setSending(false);
        setInputValue("");
        scrollToBottom();
      }
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === otherUserId) {
        setIsTyping(data.isTyping);
      }
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
      setSending(false);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("userTyping", handleUserTyping);
    socket.on("error", handleError);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("userTyping", handleUserTyping);
      socket.off("error", handleError);
    };
  }, [socket, otherUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getMessages(otherUserId);
      if (response.success) {
        setMessages(response.messages);
        setOtherUser(response.otherUser);
        // Mark messages as read
        await chatAPI.markAsRead(otherUserId);
      }
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending || !socket || !isConnected) return;

    const messageText = inputValue.trim();
    setSending(true);
    setError(null);

    try {
      // Send via Socket.IO for real-time
      socket.emit("sendMessage", {
        receiverId: otherUserId,
        message: messageText,
      });

      // Clear typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      socket.emit("typing", { receiverId: otherUserId, isTyping: false });
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to send message");
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Typing indicator
    if (socket && isConnected) {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      socket.emit("typing", { receiverId: otherUserId, isTyping: true });

      const timeout = setTimeout(() => {
        socket.emit("typing", { receiverId: otherUserId, isTyping: false });
      }, 3000);

      setTypingTimeout(timeout);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center bg-[#F4F6FF] px-6 pb-24 pt-10">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--primary-blue)] border-r-transparent"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error && !otherUser) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-[#F4F6FF] px-6 pb-24 pt-10">
        <div className="rounded-3xl bg-red-50 p-5 text-center shadow-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-blue-light)]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentUser = getStoredUser();
  const currentUserId = currentUser?._id;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[var(--dark-navy)] transition hover:bg-gray-200"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {otherUser && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-semibold text-white">
            {(otherUser.fullName || otherUser.email || "U")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-[var(--dark-navy)] truncate">
            {otherUser?.fullName || otherUser?.email || "Chat"}
          </h1>
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-gray-400"}`} />
            <p className="text-xs text-gray-500 truncate">
              {isConnected ? "Online" : "Offline"}
              {isTyping && <span className="ml-1">• Typing...</span>}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender._id === currentUserId;
            const showDate =
              index === 0 ||
              formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="my-6 text-center">
                    <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  {!isOwnMessage && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-semibold text-white">
                      {(message.sender.fullName || message.sender.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`group relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isOwnMessage
                        ? "bg-gradient-to-br from-[var(--primary-blue)] to-[#2F41AA] text-white rounded-br-md"
                        : "bg-white text-[var(--dark-navy)] border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="mb-1 text-xs font-semibold text-gray-700">
                        {message.sender.fullName || message.sender.email}
                      </p>
                    )}
                    <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${
                      isOwnMessage ? "text-white" : "text-gray-800"
                    }`}>
                      {message.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-end gap-1.5">
                      <p
                        className={`text-xs ${
                          isOwnMessage ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                      {isOwnMessage && message.isRead && (
                        <svg
                          className="h-3.5 w-3.5 text-blue-100"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  {isOwnMessage && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-blue)] to-[#2F41AA] text-xs font-semibold text-white">
                      {(currentUser?.fullName || currentUser?.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex items-end gap-2 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-semibold text-white">
              {(otherUser?.fullName || otherUser?.email || "U")[0].toUpperCase()}
            </div>
            <div className="rounded-2xl rounded-bl-md bg-white border border-gray-200 px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="sticky bottom-0 border-t border-gray-200 bg-white p-4 shadow-lg"
      >
        <div className="relative flex items-end gap-2">
          {/* File Upload Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={sending || !isConnected}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              title="Upload file"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // TODO: Implement file upload functionality
                  console.log("File selected:", file.name);
                  // You can add file upload logic here
                }
                // Reset input
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            />
          </div>

          {/* Message Input */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={sending || !isConnected}
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[var(--primary-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-opacity-20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || sending || !isConnected}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-blue)] to-[#2F41AA] text-white transition hover:from-[var(--primary-blue-light)] hover:to-[var(--primary-blue)] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            title="Send message"
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>
        {!isConnected && (
          <p className="mt-2 text-xs text-red-500">Connection lost. Reconnecting...</p>
        )}
      </form>
    </div>
  );
}

