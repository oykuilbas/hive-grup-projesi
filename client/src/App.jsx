import { useEffect, useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ask the backend for the tasks stored in the database.
    fetch('/api/tasks')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setTasks(data))
      .catch(() => setError('Could not load tasks. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <h1>Hive</h1>
      <h2>Tasks</h2>

      {loading && <p>Loading tasks...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p>No tasks yet. Run "npm run seed" in the server folder.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.title} – {task.status}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;