import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../redux/chat/chatSlice";
import { useSocket } from "../../hooks/useSocket";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { FiMessageSquare } from "react-icons/fi";

const ChatContainer = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversation } = useSelector(
    (state) => state.chat
  );
  const [isMobileView, setIsMobileView] = useState(false);

  // Initialize socket connection
  useSocket();

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showConversationList = !isMobileView || !activeConversation;
  const showChatWindow = !isMobileView || activeConversation;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Conversation List */}
      {showConversationList && (
        <div
          className={`${
            isMobileView ? "w-full" : "w-96"
          } border-r border-gray-800 bg-gray-900 flex flex-col`}
        >
          <ConversationList />
        </div>
      )}

      {/* Chat Window */}
      {showChatWindow && (
        <div className="flex-1 flex flex-col bg-gray-950">
          {activeConversation ? (
            <ChatWindow />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="w-20 h-20 mx-auto text-cyan-500/30 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-500">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
