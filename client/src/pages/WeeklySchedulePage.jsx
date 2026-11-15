
import { useEffect, useState } from 'react';
import { api } from '../api';
import EventForm from '../components/EventForm';

function WeeklySchedulePage() {
  const childId = window.location.pathname.split('/')[3];
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const monday = new Date();
monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

const weekStart = [
  monday.getFullYear(),
  String(monday.getMonth() + 1).padStart(2, '0'),
  String(monday.getDate()).padStart(2, '0')
].join('-');

const data = await api.get(
  `/children/${childId}/events?weekStart=${weekStart}`
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
  }, [childId]);

  const days = [
    'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe',
    'Cuma', 'Cumartesi', 'Pazar'
  ];

  const start = new Date();
  const day = start.getDay();
  start.setDate(start.getDate() - ((day + 6) % 7));
  start.setHours(0, 0, 0, 0);

  return (
    <main>
      <h1>Haftalık Program</h1>
      {loading && <p>Etkinlikler yükleniyor...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && days.map((name, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const dateKey = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0')
        ].join('-');

        const dailyEvents = events
          .filter(event =>
            String(event.date ?? event.event_date ?? '').slice(0, 10)
              === dateKey
          )
          .sort((a, b) =>
            String(a.start_time ?? '').localeCompare(
              String(b.start_time ?? '')
            )
          );

        return (
          <section key={dateKey}>
            <h2>{name} — {dateKey}</h2>
            {dailyEvents.length === 0 ? (
              <p>Etkinlik yok.</p>
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
            <EventForm
        childId={childId}
        onCreated={() => window.location.reload()}
      />
    </main>
  );
}

export default WeeklySchedulePage;
