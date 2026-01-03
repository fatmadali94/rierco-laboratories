import { useSelector } from "react-redux";
import { FiCircle } from "react-icons/fi";

const ConversationItem = ({ conversation, onClick }) => {
  const activeConversation = useSelector(
    (state) => state.chat.activeConversation
  );
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const currentUserId = useSelector((state) => state.auth.user?.id);

  const isActive = activeConversation === conversation.id;
  const isOnline = onlineUsers[conversation.other_user_id] === "online";
  const hasUnread = conversation.unread_count > 0;
  const isLastMessageFromOther =
    conversation.last_message_sender_id !== currentUserId;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (diff < 604800000) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format last message preview
  const formatLastMessage = (lastMessage, messageType) => {
    if (!lastMessage) return "No messages yet";

    // If it's a file message, show a preview instead of the object
    if (messageType === "image") {
      return "📷 Image";
    }

    if (messageType === "file") {
      return "📄 File";
    }

    // For text messages, just return the text
    return lastMessage;
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
        isActive
          ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500"
          : "bg-gray-900 border-transparent hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
              isActive
                ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {conversation.other_user_image ? (
              <img
                src={conversation.other_user_image}
                alt={conversation.other_user_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              conversation.other_user_name?.charAt(0).toUpperCase()
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg shadow-green-500/50"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`font-semibold truncate ${
                isActive ? "text-cyan-400" : "text-gray-200"
              }`}
            >
              {conversation.other_user_name}
            </h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(conversation.last_message_time)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-sm truncate ${
                hasUnread && isLastMessageFromOther
                  ? "text-cyan-400 font-medium"
                  : "text-gray-400"
              }`}
            >
              {formatLastMessage(
                conversation.last_message,
                conversation.last_message_type
              )}
            </p>

            {hasUnread && isLastMessageFromOther && (
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full flex-shrink-0 shadow-lg shadow-cyan-500/50">
                {conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
