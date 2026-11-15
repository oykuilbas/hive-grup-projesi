
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';

function ChildHome() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      if (!user?.childId) {
        setError('Child profile not found.');
        setLoading(false);
        return;
      }

      try {
        const data = await api.get(
          `/children/${user.childId}/tasks`
        );
        if (active) setTasks(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTasks();
    return () => { active = false; };
  }, [user?.childId]);

  async function completeTask(taskId) {
    setError('');
    setCompletingId(taskId);

    try {
      const updated = await api.patch(
        `/tasks/${taskId}/complete`,
        {}
      );

      setTasks(current =>
        current.map(task =>
          task.id === taskId ? { ...task, ...updated } : task
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <section>
      <h1>Hi, {user.name}</h1>
      <p className="muted">My tasks and schedule</p>

      <div className="card">
        <h2>My Tasks</h2>

        {loading && <p>Loading tasks...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && tasks.length === 0 && !error && (
          <p>No tasks assigned yet.</p>
        )}

        {!loading && tasks.length > 0 && (
          <ul>
            {tasks.map(task => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                {task.description && <p>{task.description}</p>}
                {task.development_area && (
                  <p>Area: {task.development_area}</p>
                )}
                {task.due_date && <p>Due: {task.due_date}</p>}
                <p>Status: {task.status}</p>

                {task.status !== 'Completed' && (
                  <button
                    type="button"
                    disabled={completingId === task.id}
                    onClick={() => completeTask(task.id)}
                  >
                    {completingId === task.id
                      ? 'Completing...'
                      : 'Mark Complete'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ChildHome;
