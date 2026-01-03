import pool from '../db.js';

// Get all conversations for a user
export async function getUserConversations(userId) {
  const result = await pool.query(`
    SELECT DISTINCT 
      c.id,
      c.created_at,
      c.updated_at,
      CASE 
        WHEN cp1.user_id = $1 THEN cp2.user_id
        ELSE cp1.user_id
      END as other_user_id,
      CASE 
        WHEN cp1.user_id = $1 THEN u2.name
        ELSE u1.name
      END as other_user_name,
      CASE 
        WHEN cp1.user_id = $1 THEN u2.image
        ELSE u1.image
      END as other_user_image,
      m.message as last_message,
      m.message_type as last_message_type,
      m.created_at as last_message_time,
      m.sender_id as last_message_sender_id,
      COUNT(CASE WHEN m2.is_read = false AND m2.receiver_id = $1 THEN 1 END) as unread_count
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp1.user_id != cp2.user_id
    JOIN users u1 ON cp1.user_id = u1.id
    JOIN users u2 ON cp2.user_id = u2.id
    LEFT JOIN LATERAL (
      SELECT message, message_type, created_at, sender_id
      FROM messages 
      WHERE conversation_id = c.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) m ON true
    LEFT JOIN messages m2 ON c.id = m2.conversation_id
    WHERE cp1.user_id = $1 OR cp2.user_id = $1
    GROUP BY c.id, cp1.user_id, cp2.user_id, u1.name, u2.name, u1.image, u2.image, 
             m.message, m.message_type, m.created_at, m.sender_id
    ORDER BY m.created_at DESC NULLS LAST
  `, [userId]);
  
  // Format the last_message for file types
  const conversations = result.rows.map(conv => {
    if (conv.last_message_type === 'image') {
      return {
        ...conv,
        last_message: '📷 Image'
      };
    } else if (conv.last_message_type === 'file') {
      return {
        ...conv,
        last_message: '📄 File'
      };
    }
    return conv;
  });
  
  return conversations;
}
// Get messages for a conversation with pagination
export async function getConversationMessages(conversationId, userId, limit = 50, offset = 0) {
  const result = await pool.query(`
    SELECT 
      m.id,
      m.conversation_id,
      m.sender_id,
      m.receiver_id,
      m.message,
      m.message_type,
      m.is_read,
      m.created_at,
      m.updated_at,
      u.name as sender_name,
      u.image as sender_image
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.conversation_id = $1 
      AND cp.user_id = $2
    ORDER BY m.created_at DESC
    LIMIT $3 OFFSET $4
  `, [conversationId, userId, limit, offset]);
  
  // Parse file messages
  const messages = result.rows.map(msg => {
    if (msg.message_type === 'image' || msg.message_type === 'file') {
      return {
        ...msg,
        message: JSON.parse(msg.message)
      };
    }
    return msg;
  });
  
  return messages.reverse(); // Return in chronological order
}

// Check if conversation exists between two users
export async function findConversationBetweenUsers(userId1, userId2) {
  const result = await pool.query(`
    SELECT c.id 
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = $1
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = $2
    LIMIT 1
  `, [userId1, userId2]);
  
  return result.rows[0];
}

// Create a new conversation
export async function createConversation() {
  const result = await pool.query(`
    INSERT INTO conversations (created_at, updated_at)
    VALUES (NOW(), NOW())
    RETURNING id, created_at, updated_at
  `);
  
  return result.rows[0];
}

// Add participants to conversation
export async function addConversationParticipants(conversationId, userId1, userId2) {
  const result = await pool.query(`
    INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
    VALUES 
      ($1, $2, NOW()),
      ($1, $3, NOW())
    RETURNING *
  `, [conversationId, userId1, userId2]);
  
  return result.rows;
}

// Save a new message
export async function saveMessage(conversationId, senderId, receiverId, message, messageType = 'text') {
  const result = await pool.query(`
    INSERT INTO messages (conversation_id, sender_id, receiver_id, message, message_type, is_read, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW())
    RETURNING *
  `, [conversationId, senderId, receiverId, message, messageType]);
  
  return result.rows[0];
}

// Mark messages as read
export async function markMessagesAsRead(messageIds, userId) {
  const result = await pool.query(`
    UPDATE messages
    SET is_read = true, updated_at = NOW()
    WHERE id = ANY($1::int[]) 
      AND receiver_id = $2
      AND is_read = false
    RETURNING id, conversation_id
  `, [messageIds, userId]);
  
  return result.rows;
}

// Get unread message count for a user
export async function getUnreadMessageCount(userId) {
  const result = await pool.query(`
    SELECT COUNT(*) as unread_count
    FROM messages
    WHERE receiver_id = $1 AND is_read = false
  `, [userId]);
  
  return parseInt(result.rows[0].unread_count);
}

// Get conversation by ID and verify user access
export async function getConversationById(conversationId, userId) {
  const result = await pool.query(`
    SELECT c.*
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE c.id = $1 AND cp.user_id = $2
    LIMIT 1
  `, [conversationId, userId]);
  
  return result.rows[0];
}

// Delete a message (soft delete - mark as deleted)
export async function deleteMessage(messageId, userId) {
  const result = await pool.query(`
    UPDATE messages
    SET message = '[Message deleted]', updated_at = NOW()
    WHERE id = $1 AND sender_id = $2
    RETURNING *
  `, [messageId, userId]);
  
  return result.rows[0];
}

// Search messages in a conversation
export async function searchMessagesInConversation(conversationId, userId, searchTerm) {
  const result = await pool.query(`
    SELECT 
      m.*,
      u.name as sender_name,
      u.image as sender_image
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.conversation_id = $1 
      AND cp.user_id = $2
      AND m.message ILIKE $3
    ORDER BY m.created_at DESC
    LIMIT 50
  `, [conversationId, userId, `%${searchTerm}%`]);
  
  return result.rows;
}