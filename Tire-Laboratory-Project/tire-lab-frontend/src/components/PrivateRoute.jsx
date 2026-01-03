import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import LoadingTransition from "./LoadingTransition";

const AUTH_PORTAL_URL =
  import.meta.env.VITE_AUTH_PORTAL_URL || "http://localhost:3004";

const PrivateRoute = ({ children, requiredPermission }) => {
  const { token, user, initialized } = useSelector((s) => s.auth);
  const CURRENT_SYSTEM = import.meta.env.VITE_CURRENT_SYSTEM;
  const hasRedirected = useRef(false);
  const [showAccessCheck, setShowAccessCheck] = useState(false);

  console.log("=== PrivateRoute RENDER ===");
  console.log("initialized:", initialized);
  console.log("token:", token ? "EXISTS" : "MISSING");
  console.log("user:", user);

  // Wait until initialized
  if (!initialized) {
    console.log("PrivateRoute: Not initialized yet, showing loader");
    return (
      <LoadingTransition messages={["در حال بارگذاری..."]} duration={1000} />
    );
  }

  // No token - redirect to auth portal
  if (!token) {
    console.log("PrivateRoute: No token, redirecting to auth portal");
    window.location.href = AUTH_PORTAL_URL;
    return null;
  }

  // Check if user has ANY permissions at all
  const hasAnyPermissions =
    user?.permissions &&
    Object.keys(user.permissions).length > 0 &&
    Object.values(user.permissions).some((perms) => perms && perms.length > 0);

  console.log("PrivateRoute: hasAnyPermissions =", hasAnyPermissions);
  console.log("PrivateRoute: user.permissions =", user?.permissions);

  // Handle no permissions case
  useEffect(() => {
    if (!hasAnyPermissions && !hasRedirected.current) {
      hasRedirected.current = true;
      setShowAccessCheck(true);

      console.log("PrivateRoute: No permissions detected!");

      // Redirect after loading transition completes
      setTimeout(() => {
        console.log(
          "PrivateRoute: Redirecting to",
          `${AUTH_PORTAL_URL}/?error=no_permissions`
        );
        window.location.href = `${AUTH_PORTAL_URL}/?error=no_permissions`;
      }, 2500); // Wait for loading transition to show
    }
  }, [hasAnyPermissions]);

  // Show loading while checking permissions
  if (!hasAnyPermissions || showAccessCheck) {
    console.log("PrivateRoute: Showing access check loader");
    return (
      <LoadingTransition
        messages={["بررسی سطح دسترسی...", "در حال انتقال به صفحه اصلی..."]}
        duration={1200}
      />
    );
  }

  // Check system access
  const userHasSystemAccess = user?.allowedSystems?.includes(CURRENT_SYSTEM);
  console.log("PrivateRoute: userHasSystemAccess =", userHasSystemAccess);

  if (!userHasSystemAccess) {
    console.log("PrivateRoute: User does not have system access");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-4">دسترسی محدود</h1>
          <p className="text-gray-400 mb-6">شما به این سیستم دسترسی ندارید</p>
          <button
            onClick={() => (window.location.href = AUTH_PORTAL_URL)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  // Check specific permission if required
  if (requiredPermission) {
    const systemPermissions = user?.permissions?.[CURRENT_SYSTEM] || [];
    console.log(
      "PrivateRoute: Checking specific permission:",
      requiredPermission
    );

    if (!systemPermissions.includes(requiredPermission)) {
      console.log("PrivateRoute: User does not have required permission");
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
            <h1 className="text-2xl font-bold text-white mb-4">
              دسترسی غیرمجاز
            </h1>
            <p className="text-gray-400 mb-6">شما به این بخش دسترسی ندارید</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              بازگشت
            </button>
          </div>
        </div>
      );
    }
  }

  console.log("PrivateRoute: All checks passed, rendering children");
  return children;
};

export default PrivateRoute;
