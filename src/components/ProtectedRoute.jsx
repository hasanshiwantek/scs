import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * API key nahi hai to / pe bhejo. Logout ke bina back nahi ja sakte.
 */
export default function ProtectedRoute({ children }) {
  const apiKey = useSelector((state) => state.user.userData?.apiKey || '');
  const location = useLocation();

  if (!apiKey) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}
