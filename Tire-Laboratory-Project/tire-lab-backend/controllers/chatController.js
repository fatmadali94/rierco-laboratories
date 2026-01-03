import * as chatModel from '../models/chatModel.js';
import cloudinary from '../utils/cloudinary.js';


// Get all conversations for the logged-in user
export async function getAllConversations(req, res) {
  try {
    const userId = req.user.id; // This comes from verifyToken middleware
    console.log('Fetching conversations for user:', userId); // Debug log
    
    const conversations = await chatModel.getUserConversations(userId);
    res.status(200).json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Error fetching conversations', error: err.message });
  }
}

// Get messages for a specific conversation
export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Fetching messages for conversation:', conversationId, 'user:', userId); // Debug

    // Verify user has access to this conversation
    const conversation = await chatModel.getConversationById(conversationId, userId);
    if (!conversation) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    const messages = await chatModel.getConversationMessages(
      conversationId, 
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
}

// Create or get a conversation with another user
export async function createOrGetConversation(req, res) {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user.id;

    console.log('Creating conversation between:', currentUserId, 'and', otherUserId); // Debug

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    const existingConversation = await chatModel.findConversationBetweenUsers(
      currentUserId, 
      otherUserId
    );

    if (existingConversation) {
      return res.status(200).json({ 
        conversationId: existingConversation.id,
        isNew: false 
      });
    }

    // Create new conversation
    const newConversation = await chatModel.createConversation();
    await chatModel.addConversationParticipants(
      newConversation.id, 
      currentUserId, 
      otherUserId
    );

    res.status(201).json({ 
      conversationId: newConversation.id,
      isNew: true,
      conversation: newConversation
    });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Error creating conversation', error: err.message });
  }
}

// Mark messages as read
export async function markAsRead(req, res) {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'Message IDs array is required' });
    }

    const updatedMessages = await chatModel.markMessagesAsRead(messageIds, userId);
    
    res.status(200).json({ 
      success: true,
      updatedCount: updatedMessages.length,
      messages: updatedMessages
    });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ message: 'Error marking messages as read', error: err.message });
  }
}

// Get unread message count
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const unreadCount = await chatModel.getUnreadMessageCount(userId);
    
    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ message: 'Error fetching unread count', error: err.message });
  }
}

// Delete a message
export async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const deletedMessage = await chatModel.deleteMessage(messageId, userId);

    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Message deleted successfully',
      deletedMessage 
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Error deleting message', error: err.message });
  }
}

// Search messages
export async function searchMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Verify user has access to this conversation
    const conversation = await chatModel.getConversationById(conversationId, userId);
    if (!conversation) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    const messages = await chatModel.searchMessagesInConversation(
      conversationId, 
      userId, 
      q.trim()
    );
    
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error searching messages:', err);
    res.status(500).json({ message: 'Error searching messages', error: err.message });
  }
}


export async function uploadChatFile(req, res) {
  try {
    const { conversationId, receiverId } = req.body;
    const senderId = req.user.id;

    console.log('File upload request:', { conversationId, receiverId, senderId });

    // Validate
    if (!conversationId || !receiverId) {
      return res.status(400).json({ message: 'Conversation ID and receiver ID are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Verify user has access to this conversation
    const conversation = await chatModel.getConversationById(conversationId, senderId);
    if (!conversation) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Determine file type
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    
    // Upload to Cloudinary
    const uploadOptions = {
      folder: 'tire-lab/chat-files',
      resource_type: 'auto', // Handles images, PDFs, etc.
      // Add original filename to public_id
      public_id: `${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
    };

    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    console.log('Cloudinary upload successful:', result.secure_url);

    // Create message data
    const messageData = {
      url: result.secure_url,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      cloudinaryId: result.public_id, // Save for potential deletion later
    };

    // Save message to database
    const savedMessage = await chatModel.saveMessage(
      conversationId,
      senderId,
      receiverId,
      JSON.stringify(messageData), // Store file data as JSON string
      fileType // 'image' or 'file'
    );

    // Parse the message back to object for response
    const responseMessage = {
      ...savedMessage,
      message: JSON.parse(savedMessage.message),
    };

    res.status(201).json({
      success: true,
      message: responseMessage,
    });

  } catch (err) {
    console.error('Error uploading chat file:', err);
    res.status(500).json({ message: 'Error uploading file', error: err.message });
  }
}