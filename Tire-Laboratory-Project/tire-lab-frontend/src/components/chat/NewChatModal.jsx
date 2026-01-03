import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  createConversation,
  fetchConversations,
  setActiveConversation,
} from "../../features/chat/chatSlice";
import { FiX, FiSearch, FiUser } from "react-icons/fi";
import axios from "axios";
import { authApi } from "../../services/api";

const NewChatModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  console.log(users);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);

      try {
        console.log("Searching users with query:", searchQuery);

        // Use authApi to fetch from Auth Service (port 3005)
        const response = await authApi.get(`/users/search?q=${searchQuery}`);

        console.log("Users found:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error.response || error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleStartChat = async (userId) => {
    try {
      const result = await dispatch(createConversation(userId)).unwrap();

      // Refresh conversations list
      await dispatch(fetchConversations());

      // Set active conversation
      dispatch(setActiveConversation(result.conversationId));

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl shadow-cyan-500/20 border border-gray-800 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            New Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-800">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <FiUser className="w-12 h-12 text-gray-700 mb-3" />
              <p className="text-gray-500">
                {searchQuery.length < 2
                  ? "Type at least 2 characters to search"
                  : "No users found"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartChat(user.id)}
                  className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold bg-gradient-to-br from-purple-500 to-pink-500 text-white flex-shrink-0">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-200 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="text-cyan-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
