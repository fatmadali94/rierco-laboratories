import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyExistingToken } from "./store/authSlice";

// Pages
import LandingPage from "./pages/LandingPage";

const LoginPage = lazyWithDelay(() => import("./pages/LoginPage"), 2000);
const SignupPage = lazyWithDelay(() => import("./pages/SignupPage"), 2000);
import SystemSelector from "./pages/SystemSelector";
import ForgotPassword from "./pages/ForgotPassword";

// Components
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

//AuthLoading
import { lazyWithDelay } from "./utils/lazyWithDelay";
import { AuthPageWrapper } from "./components/AuthLoading";

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((s) => s.auth);
  const [showLoading, setShowLoading] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    dispatch(verifyExistingToken());
  }, [dispatch]);

  // Minimum loading time of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 4000); // 2 seconds minimum

    return () => clearTimeout(timer);
  }, []);

  // Hide loading only when BOTH conditions are met
  useEffect(() => {
    if (initialized && minTimeElapsed) {
      setShowLoading(false);
    }
  }, [initialized, minTimeElapsed]);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Guest Only Routes (redirect if logged in) */}
        <Route element={<AuthPageWrapper />}>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            }
          />
        </Route>
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/select-system"
          element={
            <ProtectedRoute>
              <SystemSelector />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
