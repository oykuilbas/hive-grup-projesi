import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { ROLE_HOME } from './auth/roles';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ParentHome from './pages/ParentHome';
import SpecialistHome from './pages/SpecialistHome';
import ChildHome from './pages/ChildHome';
import LinkedSpecialistsPage from './pages/LinkedSpecialistsPage';
import MyChildrenPage from './pages/MyChildrenPage';

// Every page except login is inside <Layout> and protected by role.
// To add a page, add a <Route> in the right role's group, for example:
//   <Route path="/parent/specialists" element={<ProtectedRoute roles={['parent']}>...} />
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route
          path="/parent"
          element={<ProtectedRoute roles={['parent']}><ParentHome /></ProtectedRoute>}
        />
        <Route
          path="/specialist"
          element={<ProtectedRoute roles={['specialist']}><SpecialistHome /></ProtectedRoute>}
        />
        <Route
          path="/parent/children/:childId/specialists"
          element={<ProtectedRoute roles={['parent']}><LinkedSpecialistsPage /></ProtectedRoute>}
        />
        <Route
          path="/specialist/children"
          element={<ProtectedRoute roles={['specialist']}><MyChildrenPage /></ProtectedRoute>}
        />
        <Route
          path="/child"
          element={<ProtectedRoute roles={['child']}><ChildHome /></ProtectedRoute>}
        />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

// A logged-in user who opens /login goes to their own home page.
function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p className="page-message">Loading...</p>;
  }
  return user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <LoginPage />;
}

// "/" and unknown addresses: home page of the role, or login.
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p className="page-message">Loading...</p>;
  }
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />;
}

export default App;
