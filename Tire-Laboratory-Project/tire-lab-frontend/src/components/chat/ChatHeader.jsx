import { useSelector, useDispatch } from "react-redux";
import { setActiveConversation } from "../../features/chat/chatSlice";
import { FiArrowLeft, FiMoreVertical, FiCircle } from "react-icons/fi";

const ChatHeader = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversation, onlineUsers } = useSelector(
    (state) => state.chat
  );

  const conversation = conversations.find((c) => c.id === activeConversation);
  const isOnline = conversation
    ? onlineUsers[conversation.other_user_id] === "online"
    : false;

  const handleBack = () => {
    dispatch(setActiveConversation(null));
  };

  if (!conversation) return null;

  return (
    <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back Button (Mobile) */}
          <button
            onClick={handleBack}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
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

          {/* User Info */}
          <div>
            <h3 className="font-semibold text-gray-200">
              {conversation.other_user_name}
            </h3>
            <p className="text-sm text-gray-400 flex items-center">
              {isOnline ? (
                <>
                  <FiCircle className="w-2 h-2 mr-1 fill-green-500 text-green-500" />
                  Online
                </>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
