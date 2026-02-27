import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * API key hai to /orders pe bhejo — bina logout ke login page pe back nahi ja sakte.
 */
export default function GuestOnlyRoute({ children }) {
  const apiKey = useSelector((state) => state.user.userData?.apiKey || '');

  if (apiKey) {
    return <Navigate to="/orders" replace />;
  }
  return children;
}
