import * as chatModel from "../../../models/chatModel.js";

// socket/handlers/chatHandler.js
const chatHandler = (io, socket) => {
  socket.on("send_message", async (data) => {
    try {
      const {
        conversationId,
        receiverId,
        message,
        messageType = "text",
      } = data;

      // Verify user has access to this conversation
      const conversation = await chatModel.getConversationById(
        conversationId,
        socket.userId
      );
      if (!conversation) {
        return socket.emit("message_error", {
          error: "Access denied to this conversation",
        });
      }

      // Save message to database
      const savedMessage = await chatModel.saveMessage(
        conversationId,
        socket.userId,
        receiverId,
        message,
        messageType
      );

      // Parse message if it's a file type
      const messageData = {
        ...savedMessage,
        sender_name: socket.userName || "Unknown",
        sender_image: socket.userImage || null,
        // Parse the message field if it's a file
        message:
          messageType === "image" || messageType === "file"
            ? JSON.parse(savedMessage.message)
            : savedMessage.message,
      };

      // Emit to receiver's room
      io.to(`user_${receiverId}`).emit("receive_message", messageData);

      // Send confirmation back to sender
      socket.emit("message_sent", messageData);

      console.log(
        `Message sent from ${socket.userId} to ${receiverId} (type: ${messageType})`
      );
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { receiverId, conversationId } = data;
    io.to(`user_${receiverId}`).emit("user_typing", {
      userId: socket.userId,
      conversationId,
    });
  });

  // Stop typing indicator
  socket.on("stop_typing", (data) => {
    const { receiverId, conversationId } = data;
    io.to(`user_${receiverId}`).emit("user_stop_typing", {
      userId: socket.userId,
      conversationId,
    });
  });

  // Mark messages as read
  socket.on("mark_as_read", async (data) => {
    try {
      const { messageIds } = data;

      const updatedMessages = await chatModel.markMessagesAsRead(
        messageIds,
        socket.userId
      );

      // Get unique sender IDs
      const senderIds = [
        ...new Set(updatedMessages.map((msg) => msg.sender_id)),
      ];

      // Notify each sender that messages were read
      updatedMessages.forEach((msg) => {
        io.to(`user_${msg.sender_id}`).emit("messages_read", {
          conversationId: msg.conversation_id,
          messageIds: updatedMessages
            .filter((m) => m.sender_id === msg.sender_id)
            .map((m) => m.id),
          readBy: socket.userId,
        });
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Join a conversation room (for group chats in future)
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });
};

export default chatHandler;
