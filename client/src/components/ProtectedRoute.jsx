import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_HOME } from '../auth/roles';

// Wrap a page so that only logged-in users with one of the given roles see it.
//
//   <ProtectedRoute roles={['parent', 'specialist']}>
//     <SomePage />
//   </ProtectedRoute>
//
// Not logged in -> login page. Wrong role -> the user's own home page.
// This only hides screens; the backend still checks every request (FR-M1-06).
function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="page-message">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return children;
}

export default ProtectedRoute;
