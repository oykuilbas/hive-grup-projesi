
import { useState } from 'react';
import { api } from '../api';

export default function TaskForm({ childId, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    development_area: '',
    due_date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSaving(true);

    try {
      const task = await api.post(
        `/children/${childId}/tasks`,
        {
          title: form.title.trim(),
          description: form.description.trim() || null,
          development_area: form.development_area.trim() || null,
          due_date: form.due_date || null
        }
      );

      setSuccess('Task created successfully.');
      setForm({
        title: '',
        description: '',
        development_area: '',
        due_date: ''
      });
      onCreated?.(task);
    } catch (err) {
      setError(err.message || 'Could not create task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2>Create Task</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <label htmlFor="task-area">Development Area</label>
        <input
          id="task-area"
          name="development_area"
          value={form.development_area}
          onChange={handleChange}
        />

        <label htmlFor="task-due-date">Due Date</label>
        <input
          id="task-due-date"
          name="due_date"
          type="date"
          value={form.due_date}
          onChange={handleChange}
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create Task'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
    </section>
  );
}
