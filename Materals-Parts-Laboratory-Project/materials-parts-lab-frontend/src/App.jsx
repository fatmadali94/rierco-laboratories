import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Homepage from "./pages/Homepage";
import AuthCallback from "./pages/AuthCallback";
import PrivateRoute from "./components/PrivateRoute";
import { verifyExistingToken } from "./redux/authentication/authThunk";
import { HashLoader } from "react-spinners";
import ReceptionPage from "./pages/ReceptionPage";
import DataManagement from "./pages/DataManagement";
import LaboratoryPage from "./pages/LaboratoryPage";
import FinancialInvoicesPage from "./pages/FinancialInvoicesPage";
import ChatContainer from "./components/chat/ChatContainer";

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    // Verify existing token on app mount
    dispatch(verifyExistingToken());
  }, [dispatch]);

  // Show loading while verifying token
  if (!initialized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <HashLoader color="#5271ff" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth-callback" replace />} />

      {/* Auth callback route */}
      <Route path="/auth-callback" element={<AuthCallback />} />

      {/* Protected homepage */}
      <Route
        path="/Homepage"
        element={
          <PrivateRoute>
            <Homepage />
          </PrivateRoute>
        }
      />
      <Route
        path="پذیرش"
        element={
          <PrivateRoute>
            <ReceptionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="پایگاه_داده"
        element={
          <PrivateRoute>
            <DataManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="آزمایشگاه_موادوقطعات"
        element={
          <PrivateRoute>
            <LaboratoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="امور_مالی"
        element={
          <PrivateRoute>
            <FinancialInvoicesPage />
          </PrivateRoute>
        }
      />
      <Route path="/chat" element={<ChatContainer />} />

      {/* Catch all - redirect to auth-callback */}
      <Route path="*" element={<Navigate to="/auth-callback" replace />} />
    </Routes>
  );
}

export default App;
