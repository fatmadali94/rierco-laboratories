import {
  FiCheck,
  FiCheckCircle,
  FiDownload,
  FiFile,
  FiImage,
} from "react-icons/fi";
import { useState } from "react";

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  console.log("MessageBubble received:", {
    type: message.message_type,
    message: message.message,
    messageType: typeof message.message,
  });
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse file data if message type is image or file
  const isFile =
    message.message_type === "image" || message.message_type === "file";

  // Check if message is already parsed (object) or needs parsing (string)
  let fileData = null;
  if (isFile) {
    if (typeof message.message === "string") {
      try {
        fileData = JSON.parse(message.message);
      } catch (e) {
        console.error("Failed to parse file message:", e);
      }
    } else if (typeof message.message === "object") {
      fileData = message.message;
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(fileData.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileData.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div
      className={`flex items-end space-x-2 ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? "" : "invisible"}`}
        >
          {showAvatar && (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
              {message.sender_name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`rounded-2xl ${
            isOwn
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm shadow-lg shadow-cyan-500/20"
              : "bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700"
          }`}
        >
          {/* Text Message */}
          {message.message_type === "text" && (
            <div className="px-4 py-2">
              <p className="text-sm break-words">{message.message}</p>
            </div>
          )}

          {/* Image Message */}
          {message.message_type === "image" && fileData && (
            <div className="relative group">
              <img
                src={fileData.url}
                alt={fileData.fileName}
                className={`max-w-sm rounded-2xl ${imageLoaded ? "" : "hidden"}`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="w-64 h-48 bg-gray-700 rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
              )}

              {/* Download overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <FiDownload className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>

              {/* File name below image */}
              <div className="px-3 py-2">
                <p className="text-xs opacity-75 truncate">
                  {fileData.fileName}
                </p>
              </div>
            </div>
          )}

          {/* PDF/File Message */}
          {message.message_type === "file" && fileData && (
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-lg ${
                    isOwn ? "bg-white/20" : "bg-gray-700"
                  }`}
                >
                  <FiFile className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileData.fileName}
                  </p>
                  <p className="text-xs opacity-75">
                    {(fileData.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className={`p-2 rounded-lg transition-colors ${
                    isOwn ? "hover:bg-white/20" : "hover:bg-gray-700"
                  }`}
                  title="Download"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Time and Status */}
        <div
          className={`flex items-center space-x-1 mt-1 px-2 ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
        >
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>

          {isOwn && (
            <div className="text-cyan-400">
              {message.is_read ? (
                <FiCheckCircle className="w-3 h-3" />
              ) : (
                <FiCheck className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
