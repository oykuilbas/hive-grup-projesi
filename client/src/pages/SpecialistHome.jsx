import { useAuth } from '../auth/AuthContext';

// Specialist home. The list of linked children and the child profile pages
// are added by the module tasks.
function SpecialistHome() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Specialist dashboard</p>
    </section>
  );
}

export default SpecialistHome;
