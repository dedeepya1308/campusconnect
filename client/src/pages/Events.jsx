import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

export default function Events() {
  const [events, setEvents] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: ''
  });

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get('/events', { params: filters })
        .then((r) => setEvents(r.data))
        .catch((err) => console.error(err));
    }, 200);

    return () => clearTimeout(t);
  }, [filters]);

  if (!events) return <Loader />;

  return (
    <>
      <h1 className="mb-5 text-3xl font-bold">
        Discover events
      </h1>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <div key={e.id} className="border p-4 rounded">
            <h2 className="font-bold">{e.title}</h2>
            <p>{e.description}</p>
            <p>{e.date}</p>
            <p>{e.location}</p>
          </div>
        ))}
      </div>
    </>
  );
}