import { useEffect, useState } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';
import Loader from '../components/Loader';

const categories = ['All', 'Technology', 'Sports', 'Culture', 'Career', 'General'];

export default function Events() {
  const [events, setEvents] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', upcoming: true });
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setError('');
      api.get('/events', { params: filters }).then((response) => setEvents(response.data)).catch((err) => { setError(err.response?.data?.message || 'Events could not be loaded.'); setEvents([]); });
    }, 200);
    return () => clearTimeout(timer);
  }, [filters]);

  if (!events && !error) return <Loader/>;

  return <section>
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-10 text-white shadow-lg sm:px-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-200">Campus calendar</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Find your next campus moment.</h1>
      <p className="mt-3 max-w-2xl text-indigo-100">Explore workshops, competitions, cultural events, club meetups, and opportunities made for your campus community.</p>
    </div>

    <div className="relative -mt-5 mx-3 rounded-xl bg-white p-5 shadow-lg sm:mx-8">
      <EventFilter filters={filters} setFilters={setFilters}/>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-2">{categories.map((category) => <button key={category} onClick={() => setFilters({ ...filters, category: category === 'All' ? '' : category })} className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${filters.category === (category === 'All' ? '' : category) ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>{category}</button>)}</div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600"><input type="checkbox" checked={filters.upcoming} onChange={(event) => setFilters({ ...filters, upcoming: event.target.checked })}/> Upcoming only</label>
      </div>
    </div>

    <div className="mt-10 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">Discover events</h2><p className="mt-1 text-slate-500">{events?.length || 0} event{events?.length === 1 ? '' : 's'} to explore</p></div></div>
    {error && <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{events?.map((event) => <EventCard key={event.id} event={event}/>)}</div>
    {!error && events?.length === 0 && <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><p className="text-lg font-semibold">No events match these filters.</p><p className="mt-2 text-slate-500">Try another category, search term, or include past events.</p><button className="btn-secondary mt-5" onClick={() => setFilters({ search: '', category: '', upcoming: true })}>Clear filters</button></div>}
  </section>;
}
