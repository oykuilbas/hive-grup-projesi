import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import TaskForm from '../components/TaskForm';

// Parent home. The weekly dashboard is added by later module tasks.
function ParentHome() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/children')
      .then((data) => { if (active) setChildren(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section>
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Parent dashboard</p>
      <div className="card">
        <h2>Your children</h2>
        {loading && <p>Loading children...</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {!loading && !error && children.length === 0 && <p>No children are assigned to your account.</p>}
        {!loading && !error && children.length > 0 && <ul>{children.map((child) =>
          <li key={child.id}>{child.name} — <Link to={`/parent/children/${child.id}/specialists`}>Linked specialists</Link></li>
        )}</ul>}
        {!loading && !error && children.map((child) => (
  <div key={`task-form-${child.id}`}>
    <h3>{child.name}</h3>
    <TaskForm childId={child.id} />
  </div>
))}
      </div>
    </section>
  );
}

export default ParentHome;
