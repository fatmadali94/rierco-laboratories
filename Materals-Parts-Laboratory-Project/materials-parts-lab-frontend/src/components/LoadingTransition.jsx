import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";

const LoadingTransition = ({
  messages = [
    "در حال بررسی اطلاعات...",
    "بررسی سطح دسترسی...",
    "آماده‌سازی محیط کاربری...",
  ],
  duration = 2000, // Duration for each message in ms
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");

  useEffect(() => {
    if (currentIndex >= messages.length) {
      // All messages shown, trigger completion
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
      return;
    }

    // Fade in
    setFadeState("fade-in");

    const fadeOutTimer = setTimeout(() => {
      setFadeState("fade-out");
    }, duration - 600);

    const nextMessageTimer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextMessageTimer);
    };
  }, [currentIndex, messages.length, duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <HashLoader color="#5271ff" size={70} />

        <div className="h-16 flex items-center justify-center">
          {currentIndex < messages.length && (
            <p
              className={`text-white text-2xl font-medium transition-opacity duration-600 ${
                fadeState === "fade-in" ? "opacity-100" : "opacity-0"
              }`}
            >
              {messages[currentIndex]}
            </p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-600 ${
                index === currentIndex
                  ? "bg-blue-500 w-8"
                  : index < currentIndex
                    ? "bg-blue-500/50"
                    : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingTransition;
