import express from 'express';
import * as chatController from '../controllers/chatController.js';
import verifyToken from '../middleware/verifyToken.js';
import upload from '../middleware/multer.js'
const router = express.Router();

// Get all conversations for the logged-in user
router.get('/conversations', verifyToken, chatController.getAllConversations);

// Create or get a conversation with another user
router.post('/conversations', verifyToken, chatController.createOrGetConversation);

// Get messages for a specific conversation with pagination
router.get('/conversations/:conversationId/messages', verifyToken, chatController.getMessages);

// Mark messages as read
router.post('/messages/mark-read', verifyToken, chatController.markAsRead);

// Get unread message count
router.get('/messages/unread-count', verifyToken, chatController.getUnreadCount);

// Delete a message
router.delete('/messages/:messageId', verifyToken, chatController.deleteMessage);

// Search messages in a conversation
router.get('/conversations/:conversationId/search', verifyToken, chatController.searchMessages);

router.post('/messages/upload', verifyToken, upload.single('file'), chatController.uploadChatFile);

export default router;