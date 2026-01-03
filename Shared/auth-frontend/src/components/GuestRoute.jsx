import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const GuestRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);

  // If user is already logged in, redirect to system selector
  if (token) {
    return <Navigate to="/select-system" replace />;
  }

  return children;
};

export default GuestRoute;
