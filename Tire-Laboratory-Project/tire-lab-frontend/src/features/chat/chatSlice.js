import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApiService } from '../../services/chatApi';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApiService.getConversations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await chatApiService.getMessages(conversationId, page);
      return { conversationId, messages: response.data, page };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (otherUserId, { rejectWithValue }) => {
    try {
      const response = await chatApiService.createConversation(otherUserId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create conversation');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (messageIds, { rejectWithValue }) => {
    try {
      const response = await chatApiService.markAsRead(messageIds);
      return { messageIds, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to mark messages as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApiService.getUnreadCount();
      return response.data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch unread count');
    }
  }
);

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {}, // { conversationId: [messages] }
  onlineUsers: {},
  typingUsers: {}, // { conversationId: [userIds] }
  unreadCount: 0,
  loading: {
    conversations: false,
    messages: false,
    sending: false
  },
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    
    addMessage: (state, action) => {
  const { conversationId, message } = action.payload;
  if (!state.messages[conversationId]) {
    state.messages[conversationId] = [];
  }
  state.messages[conversationId].push(message);
  
  // Update last message in conversation list
  const conversation = state.conversations.find(c => c.id === conversationId);
  if (conversation) {
    // Handle file messages differently in conversation preview
    if (message.message_type === 'image') {
      conversation.last_message = '📷 Image';
    } else if (message.message_type === 'file') {
      conversation.last_message = '📄 File';
    } else {
      conversation.last_message = message.message;
    }
    conversation.last_message_time = message.created_at;
    conversation.last_message_sender_id = message.sender_id;
    conversation.last_message_type = message.message_type;
  }
},

updateMessageId: (state, action) => {
    const { conversationId, tempId, realMessage } = action.payload;
    const messages = state.messages[conversationId];
    
    if (messages) {
      const index = messages.findIndex(m => m.id === tempId);
      if (index !== -1) {
        // Replace temp message with real one
        messages[index] = realMessage;
      }
    }
  },

receiveMessage: (state, action) => {
  const message = action.payload;
  const conversationId = message.conversation_id;
  
  if (!state.messages[conversationId]) {
    state.messages[conversationId] = [];
  }
  
  // Avoid duplicates by checking message ID
  const exists = state.messages[conversationId].find(m => m.id === message.id);
  if (exists) {
    console.log('Duplicate message detected, skipping');
    return; // Exit early
  }
  
  // Add message (only if it doesn't exist)
  state.messages[conversationId].push(message);
  
  // Update conversation
  const conversation = state.conversations.find(c => c.id === conversationId);
  if (conversation) {
    if (message.message_type === 'image') {
      conversation.last_message = '📷 Image';
    } else if (message.message_type === 'file') {
      conversation.last_message = '📄 File';
    } else {
      conversation.last_message = message.message;
    }
    conversation.last_message_time = message.created_at;
    conversation.last_message_sender_id = message.sender_id;
    conversation.last_message_type = message.message_type;
    
    if (state.activeConversation !== conversationId) {
      conversation.unread_count = (conversation.unread_count || 0) + 1;
      state.unreadCount += 1;
    }
  }
  
  state.conversations.sort((a, b) => 
    new Date(b.last_message_time) - new Date(a.last_message_time)
  );
},

    updateMessageStatus: (state, action) => {
      const { conversationId, messageId, status } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    
    markConversationAsRead: (state, action) => {
      const conversationId = action.payload;
      const messages = state.messages[conversationId];
      
      if (messages) {
        messages.forEach(message => {
          if (!message.is_read) {
            message.is_read = true;
          }
        });
      }
      
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation && conversation.unread_count > 0) {
        state.unreadCount -= conversation.unread_count;
        conversation.unread_count = 0;
      }
    },
    
    setUserOnlineStatus: (state, action) => {
      const { userId, status } = action.payload;
      state.onlineUsers[userId] = status;
    },
    
    setUserTyping: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== userId
        );
      }
    },

    clearMessages: (state, action) => {
      const conversationId = action.payload;
      if (conversationId) {
        delete state.messages[conversationId];
      } else {
        state.messages = {};
      }
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error = action.payload;
      });
    
    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        const { conversationId, messages, page } = action.payload;
        
        if (page === 1) {
          state.messages[conversationId] = messages;
        } else {
          // Prepend older messages
          state.messages[conversationId] = [
            ...messages,
            ...(state.messages[conversationId] || [])
          ];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error = action.payload;
      });
    
    // Create conversation
    builder
      .addCase(createConversation.pending, (state) => {
        state.loading.conversations = true;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.activeConversation = action.payload.conversationId;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error = action.payload;
      });
    
    // Mark as read
    builder
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { messageIds } = action.payload;
        
        // Update messages
        Object.keys(state.messages).forEach(conversationId => {
          state.messages[conversationId].forEach(message => {
            if (messageIds.includes(message.id)) {
              message.is_read = true;
            }
          });
        });
      });
    
    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  }
});

export const {
  setActiveConversation,
  addMessage,
  receiveMessage,
  updateMessageStatus,
  markConversationAsRead,
  setUserOnlineStatus,
  setUserTyping,
  clearMessages,
  updateMessageId,
  clearError,           
} = chatSlice.actions;

export default chatSlice.reducer;