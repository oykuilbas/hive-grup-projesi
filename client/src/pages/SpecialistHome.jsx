import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Specialist home. Child profile pages are added by later module tasks.
function SpecialistHome() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Specialist dashboard</p>
      <Link to="/specialist/children">My children</Link>
    </section>
  );
}

export default SpecialistHome;
