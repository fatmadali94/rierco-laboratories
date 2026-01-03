// components/AuthPageWrapper.jsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { HashLoader } from "react-spinners";

const AuthLoader = () => (
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
        <p
          className={
            "text-white text-2xl font-medium transition-opacity duration-600 opacity-100"
          }
        >
          آماده‌سازی صفحه
        </p>
      </div>
      {/* Progress dots */}
      <div className="flex gap-2">
        <div
          className={
            "h-2 rounded-full transition-all duration-600 bg-blue-500 w-8"
          }
        />
      </div>
    </div>
  </div>
);

export const AuthPageWrapper = () => (
  <Suspense fallback={<AuthLoader />}>
    <Outlet />
  </Suspense>
);
