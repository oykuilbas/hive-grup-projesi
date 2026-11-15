
import { useEffect, useState } from 'react';
import { api } from '../api';
import AssignedTasks from '../components/AssignedTasks';
import './m2.css';

export default function MyChildrenPage() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api.get('/children')
      .then((data) => {
        if (active) setChildren(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <section className="card">
      <h1>My children</h1>

      {loading && <p>Loading children...</p>}

      {error && (
        <p className="form-error" role="alert">{error}</p>
      )}

      {!loading && !error && children.length === 0 && (
        <p>No children are linked to your account yet.</p>
      )}

      {!loading && !error && children.length > 0 && (
        <ul className="m2-list">
          {children.map((child) => (
            <li key={child.id}>
              <h3>{child.name}</h3>
              <AssignedTasks childId={child.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
