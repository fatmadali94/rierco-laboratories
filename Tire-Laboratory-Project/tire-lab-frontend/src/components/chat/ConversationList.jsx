import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveConversation,
  createConversation,
} from "../../features/chat/chatSlice";
import { FiSearch, FiPlus, FiMessageCircle } from "react-icons/fi";
import ConversationItem from "./ConversationItem";
import NewChatModal from "./NewChatModal";

const ConversationList = () => {
  const dispatch = useDispatch();
  const { conversations, loading, unreadCount } = useSelector(
    (state) => state.chat
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Messages
            </h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Unread Count */}
          {unreadCount > 0 && (
            <div className="mb-3 px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
              <p className="text-sm text-cyan-400">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {loading.conversations ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FiMessageCircle className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => handleSelectConversation(conversation.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
    </>
  );
};

export default ConversationList;
