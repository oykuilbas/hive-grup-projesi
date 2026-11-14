import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABEL } from '../auth/roles';

// Top bar shown on every page after login, with the user's name, role and
// a logout button (FR-M1-07).
function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header className="top-bar">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true" />
          <span>Child Development Platform</span>
        </div>
        <div className="top-bar-user">
          <span>
            {user.name} · {ROLE_LABEL[user.role]}
          </span>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
