
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import EventForm from '../components/EventForm';

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday'
];

function getMonday(date) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function formatDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

export default function WeeklySchedulePage() {
  const { childId } = useParams();
  const { user } = useAuth();

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const monday = formatDate(weekStart);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setLoading(true);
      setError('');
      setEvents([]);

      try {
        const data = await api.get(
          `/children/${childId}/events?weekStart=${monday}`
        );
        if (active) {
          setEvents(Array.isArray(data) ? data : data.events ?? []);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEvents();
    return () => { active = false; };
  }, [childId, monday, refresh]);

  function changeWeek(offset) {
    setWeekStart(current => {
      const next = new Date(current);
      next.setDate(next.getDate() + offset * 7);
      return next;
    });
  }

  const sunday = new Date(weekStart);
  sunday.setDate(sunday.getDate() + 6);

  return (
    <main>
      <h1>Weekly Schedule</h1>

      <div>
        <button type="button" onClick={() => changeWeek(-1)}>
          Previous Week
        </button>

        <span> {monday} – {formatDate(sunday)} </span>

        <button type="button" onClick={() => changeWeek(1)}>
          Next Week
        </button>
      </div>

      {loading && <p>Loading events...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && DAYS.map((name, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);
        const dateKey = formatDate(date);

        const dailyEvents = events
          .filter(event => event.event_date === dateKey)
          .sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          );

        return (
          <section key={dateKey}>
            <h2>{name} — {dateKey}</h2>
            {dailyEvents.length === 0 ? (
              <p>No events.</p>
            ) : (
              <ul>
                {dailyEvents.map(event => (
                  <li key={event.id}>
                    {event.start_time} - {event.end_time}
                    {' — '}{event.title}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {['parent', 'specialist'].includes(user?.role) && (
        <EventForm
          childId={childId}
          onCreated={() => setRefresh(value => value + 1)}
        />
      )}
    </main>
  );
}


