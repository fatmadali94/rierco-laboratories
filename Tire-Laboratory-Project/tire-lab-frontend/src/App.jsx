import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HashLoader } from "react-spinners";
import { verifyExistingToken } from "./features/authentication/authThunk";
import Homepage from "./pages/Homepage";
import DepositoryPage from "./pages/DepositoryPage";
import ReceptoryPage from "./pages/ReceptoryPage";
import NewEntriesPage from "./pages/NewEntriesPage";
import LaboratoryPage from "./pages/LaboratoryPage";
import Showcase from "./pages/showcase";
import Showcase2 from "./pages/Showcase2";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import RetrievalFormPage from "./pages/RetrievalFormPage";
import ChatContainer from "./components/chat/ChatContainer";
import AuthCallback from "./pages/AuthCallback";

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
      {/* Root redirects to auth-callback */}
      <Route path="/" element={<Navigate to="/auth-callback" replace />} />

      {/* Auth callback route */}
      <Route path="/auth-callback" element={<AuthCallback />} />
      <Route
        path="/Homepage"
        element={
          <PrivateRoute>
            <Homepage />
          </PrivateRoute>
        }
      />
      <Route
        path="/انبار"
        element={
          <PrivateRoute>
            <DepositoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/پذیرش"
        element={
          <PrivateRoute>
            <ReceptoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/ورودی_جدید"
        element={
          <PrivateRoute>
            <NewEntriesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/مرکز_آزمون"
        element={
          <PrivateRoute>
            <LaboratoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/retrieval_form"
        element={
          <PrivateRoute>
            <RetrievalFormPage />
          </PrivateRoute>
        }
      />
      <Route path="/chat" element={<ChatContainer />} />
    </Routes>
  );
}

export default App;
