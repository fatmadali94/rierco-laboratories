import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../services/socket';
import {
  receiveMessage,
  updateMessageStatus,
  setUserOnlineStatus,
  setUserTyping
} from '../redux/chat/chatSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const activeConversation = useSelector(state => state.chat.activeConversation);
  
  useEffect(() => {
    // Get token from your auth state or localStorage
    const token = localStorage.getItem('token'); // Adjust based on your auth setup
    
    if (!token) return;
    
    // Connect to socket
    const socket = socketService.connect(token);
    
    // Listen for incoming messages
    socket.on('receive_message', (message) => {
      dispatch(receiveMessage(message));
    });
    
    // Listen for message sent confirmation
    socket.on('message_sent', (message) => {
      dispatch(updateMessageStatus({
        conversationId: message.conversation_id,
        messageId: message.id,
        status: 'sent'
      }));
    });
    
    // Listen for user status changes
    socket.on('user_status', ({ userId, status }) => {
      dispatch(setUserOnlineStatus({ userId, status }));
    });
    
    // Listen for typing indicators
    socket.on('user_typing', ({ userId, conversationId }) => {
      dispatch(setUserTyping({ conversationId, userId, isTyping: true }));
    });
    
    socket.on('user_stop_typing', ({ userId, conversationId }) => {
      dispatch(setUserTyping({ conversationId, userId, isTyping: false }));
    });
    
    // Listen for read receipts
    socket.on('messages_read', ({ conversationId, messageIds }) => {
      messageIds.forEach(messageId => {
        dispatch(updateMessageStatus({
          conversationId,
          messageId,
          status: 'read'
        }));
      });
    });
    
    // Emit user online status
    socket.emit('user_online');
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);
  
  return socketService;
};