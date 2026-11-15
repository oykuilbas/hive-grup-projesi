
import { useEffect, useState } from 'react';
import { api } from '../api';

function AssignedTasks({ childId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api.get(`/children/${childId}/tasks`)
      .then((data) => {
        if (active) setTasks(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [childId]);

  return (
    <div className="card">
      <h3>Assigned Tasks</h3>

      {loading && <p>Loading tasks...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p>No tasks assigned yet.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong>
              {task.description && <p>{task.description}</p>}
              {task.development_area && (
                <p>Area: {task.development_area}</p>
              )}
              {task.due_date && <p>Due: {task.due_date}</p>}
              <p>Status: {task.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AssignedTasks;
