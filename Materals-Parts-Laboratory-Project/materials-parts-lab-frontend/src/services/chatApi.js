import { chatApi } from "./api.js";

export const chatApiService = {
  // Get all conversations
  getConversations: () => chatApi.get("/conversations"),

  // Create or get conversation
  createConversation: (otherUserId) =>
    chatApi.post("/conversations", { otherUserId }),

  // Get messages for a conversation
  getMessages: (conversationId, page = 1, limit = 50) =>
    chatApi.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    }),

  // Mark messages as read
  markAsRead: (messageIds) =>
    chatApi.post("/messages/mark-read", { messageIds }),

  // Get unread count
  getUnreadCount: () => chatApi.get("/messages/unread-count"),

  // Delete message
  deleteMessage: (messageId) => chatApi.delete(`/messages/${messageId}`),

  // Search messages
  searchMessages: (conversationId, query) =>
    chatApi.get(`/conversations/${conversationId}/search`, {
      params: { q: query },
    }),

  // Upload file
  uploadFile: (formData) =>
    chatApi.post("/messages/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};
