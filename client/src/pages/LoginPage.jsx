import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_HOME } from '../auth/roles';

// M1 – Login with email and password (FR-M1-01, FR-M1-02).
// There is no role selector: the role comes from the account (FR-M1-03).
// After login the user goes to their role's home page (FR-M1-05).
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const me = await login(email, password);
      navigate(ROLE_HOME[me.role], { replace: true });
    } catch (err) {
      setError(
        err.status === 401
          ? 'Wrong email or password. Check your details and try again.'
          : err.message
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="card login-card" onSubmit={handleSubmit} noValidate>
        <div className="brand">
          <span className="brand-logo" aria-hidden="true" />
          <span>Child Development Platform</span>
        </div>

        <h1>Log in</h1>
        <p className="muted">Your role comes from your account.</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </main>
  );
}

export default LoginPage;
