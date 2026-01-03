import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  markConversationAsRead,
} from "../../features/chat/chatSlice";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { activeConversation, messages, loading } = useSelector(
    (state) => state.chat
  );
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef(null);

  const activeMessages = messages[activeConversation] || [];

  useEffect(() => {
    if (activeConversation) {
      dispatch(fetchMessages({ conversationId: activeConversation, page: 1 }));
      setPage(1);

      // Mark messages as read after a short delay
      setTimeout(() => {
        dispatch(markConversationAsRead(activeConversation));

        const unreadMessages = activeMessages
          .filter((msg) => !msg.is_read && msg.receiver_id === currentUserId)
          .map((msg) => msg.id);

        if (unreadMessages.length > 0) {
          // Mark as read via API
          import("../../features/chat/chatSlice").then(
            ({ markMessagesAsRead }) => {
              dispatch(markMessagesAsRead(unreadMessages));
            }
          );
        }
      }, 500);
    }
  }, [activeConversation, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMoreMessages = () => {
    if (!loading.messages) {
      const nextPage = page + 1;
      dispatch(
        fetchMessages({ conversationId: activeConversation, page: nextPage })
      );
      setPage(nextPage);
    }
  };

  const currentUserId = useSelector((state) => state.auth.user?.id); // Adjust based on your auth state

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {loading.messages && page === 1 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            {activeMessages.length > 50 && (
              <div className="text-center py-4">
                <button
                  onClick={loadMoreMessages}
                  disabled={loading.messages}
                  className="px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 disabled:text-gray-600 transition-colors"
                >
                  {loading.messages ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}
            <MessageList
              messages={activeMessages}
              currentUserId={currentUserId}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
