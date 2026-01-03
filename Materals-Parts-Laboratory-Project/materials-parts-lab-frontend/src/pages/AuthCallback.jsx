// pages/AuthCallback.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthFromCallback } from "../redux/authentication/authThunk.js";
import LoadingTransition from "../components/LoadingTransition.jsx";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token and verify it
      dispatch(setAuthFromCallback(token))
        .unwrap()
        .then(() => {
          // Don't navigate immediately, let loading animation finish
          setShouldRedirect(true);
        })
        .catch(() => {
          // Invalid token, redirect back to auth
          window.location.href =
            import.meta.env.VITE_AUTH_PORTAL_URL || "http://localhost:3004";
        });
    } else {
      // No token, redirect to auth
      window.location.href =
        import.meta.env.VITE_AUTH_PORTAL_URL || "http://localhost:3004";
    }
  }, [searchParams, dispatch]);

  const handleLoadingComplete = () => {
    if (shouldRedirect) {
      navigate("/Homepage");
    }
  };

  return (
    <LoadingTransition
      messages={[
        "در حال بررسی اطلاعات...",
        "احراز هویت...",
        "بارگذاری داده‌ها...",
      ]}
      duration={2000}
      onComplete={handleLoadingComplete}
    />
  );
};

export default AuthCallback;
