import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, currentUserId }) => {
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const activeConversation = useSelector(
    (state) => state.chat.activeConversation
  );

  const isTyping = typingUsers[activeConversation]?.length > 0;

  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.created_at);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="p-6 space-y-4">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center justify-center my-6">
            <div className="px-4 py-1 bg-gray-800/50 rounded-full border border-gray-700">
              <span className="text-xs text-gray-400">
                {formatDateHeader(date)}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            {msgs.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                showAvatar={
                  index === 0 || msgs[index - 1].sender_id !== message.sender_id
                }
              />
            ))}
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span>typing...</span>
        </div>
      )}
    </div>
  );
};

export default MessageList;
