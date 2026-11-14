import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, UNAUTHORIZED_EVENT } from '../api';

// Keeps the logged-in user for the whole app.
// Any component can read it with:  const { user } = useAuth();
// user is null when nobody is logged in, otherwise { id, name, role, childId? }.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we check a token saved from an earlier visit
  const [loading, setLoading] = useState(true);

  // After a page refresh, restore the session from the saved token.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // When any request returns 401 (for example the token expired), log out.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  // Throws an Error with the server's message if the login fails.
  async function login(email, password) {
    const { token } = await api.post('/auth/login', { email, password });
    setToken(token);
    const me = await api.get('/auth/me');
    setUser(me);
    return me;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
