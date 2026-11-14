import { useAuth } from '../auth/AuthContext';

// Parent home. The weekly dashboard (schedule, tasks, entries, statistics,
// AI summary) and the linked specialists page are added by the module tasks.
function ParentHome() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Parent dashboard</p>
    </section>
  );
}

export default ParentHome;
