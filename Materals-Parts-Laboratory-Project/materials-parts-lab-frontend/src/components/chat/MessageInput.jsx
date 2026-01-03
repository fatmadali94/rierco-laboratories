import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../redux/chat/chatSlice";
import socketService from "../../services/socket";
import { FiSend, FiPaperclip, FiSmile, FiX, FiFile } from "react-icons/fi";
import axios from "axios";

const MessageInput = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { activeConversation, conversations } = useSelector(
    (state) => state.chat
  );
  const currentUserId = useSelector((state) => state.auth.user?.id);

  const conversation = conversations.find((c) => c.id === activeConversation);
  const receiverId = conversation?.other_user_id;

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConversation]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.emit("typing", {
        receiverId,
        conversationId: activeConversation,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emit("stop_typing", {
        receiverId,
        conversationId: activeConversation,
      });
    }, 1000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !activeConversation || !receiverId) return;

    setUploading(true);

    const tempId = `temp_${Date.now()}`;
    const fileType = selectedFile.type.startsWith("image/") ? "image" : "file";

    const tempMessage = {
      id: tempId,
      conversation_id: activeConversation,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message: {
        url: filePreview || "",
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
      },
      message_type: fileType,
      is_read: false,
      created_at: new Date().toISOString(),
      status: "uploading",
    };

    dispatch(
      addMessage({
        conversationId: activeConversation,
        message: tempMessage,
      })
    );

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("conversationId", activeConversation);
      formData.append("receiverId", receiverId);

      const token = localStorage.getItem("token");
      // Use Chat Service URL (port 3006)
      const CHAT_API_URL =
        import.meta.env.VITE_CHAT_API_URL || "http://localhost:3006";

      const response = await axios.post(
        `${CHAT_API_URL}/api/chat/messages/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedMessage = response.data.message;
      const parsedMessage = {
        ...uploadedMessage,
        message:
          typeof uploadedMessage.message === "string"
            ? JSON.parse(uploadedMessage.message)
            : uploadedMessage.message,
      };

      // Update the temp message with real data
      dispatch(
        updateMessageId({
          conversationId: activeConversation,
          tempId: tempId,
          realMessage: parsedMessage,
        })
      );

      handleRemoveFile();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !activeConversation || !receiverId) return;

    const messageData = {
      conversationId: activeConversation,
      receiverId,
      message: message.trim(),
      messageType: "text",
    };

    const tempMessage = {
      id: Date.now(),
      conversation_id: activeConversation,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message: message.trim(),
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      status: "sending",
    };

    dispatch(
      addMessage({
        conversationId: activeConversation,
        message: tempMessage,
      })
    );

    socketService.emit("send_message", messageData);

    setMessage("");
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketService.emit("stop_typing", {
      receiverId,
      conversationId: activeConversation,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                  <FiFile className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSendFile}
            disabled={uploading}
            className="mt-3 w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Uploading...
              </span>
            ) : (
              "Send File"
            )}
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 text-gray-400 hover:text-cyan-400 transition-colors hover:bg-gray-800 rounded-lg disabled:opacity-50"
          title="Attach file"
        >
          <FiPaperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none max-h-32 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
            style={{
              minHeight: "48px",
              maxHeight: "128px",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 128) + "px";
            }}
          />
        </div>

        <button
          type="button"
          className="p-3 text-gray-400 hover:text-cyan-400 transition-colors hover:bg-gray-800 rounded-lg"
          title="Emoji (Coming soon)"
        >
          <FiSmile className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 rounded-lg transition-all duration-200 ${
            message.trim()
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
