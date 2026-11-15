
import { useState } from 'react';
import { api } from '../api';

export default function EventForm({ childId, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    event_date: '',
    start_time: '',
    end_time: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.end_time <= form.start_time) {
      setError('End time must be after start time.');
      return;
    }

    setSaving(true);
    try {
      const event = await api.post(
        `/children/${childId}/events`,
        form
      );
      setForm({
        title: '',
        event_date: '',
        start_time: '',
        end_time: '',
      });
      onCreated?.(event);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Event</h2>

      <input
        aria-label="Event title"
        placeholder="Event title"
        value={form.title}
        onChange={e => setForm({
          ...form, title: e.target.value
        })}
        required
      />

      <input
        aria-label="Event date"
        type="date"
        value={form.event_date}
        onChange={e => setForm({
          ...form, event_date: e.target.value
        })}
        required
      />

      <input
        aria-label="Start time"
        type="time"
        value={form.start_time}
        onChange={e => setForm({
          ...form, start_time: e.target.value
        })}
        required
      />

      <input
        aria-label="End time"
        type="time"
        value={form.end_time}
        onChange={e => setForm({
          ...form, end_time: e.target.value
        })}
        required
      />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Add Event'}
      </button>
    </form>
  );
}
