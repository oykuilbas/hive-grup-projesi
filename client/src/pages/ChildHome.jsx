import { useAuth } from '../auth/AuthContext';

// Child home. The child sees only their own tasks and schedule; those parts
// are added by the module tasks.
function ChildHome() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Hi, {user.name}</h1>
      <p className="muted">My tasks and schedule</p>
    </section>
  );
}

export default ChildHome;
