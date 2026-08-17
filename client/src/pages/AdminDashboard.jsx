import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(); const [users, setUsers] = useState([]); const [clubs, setClubs] = useState([]); const [events, setEvents] = useState([]); const [name, setName] = useState('');
  const load = () => { api.get('/admin/summary').then((r) => setSummary(r.data)); api.get('/admin/users').then((r) => setUsers(r.data)); api.get('/admin/clubs').then((r) => setClubs(r.data)); api.get('/admin/events').then((r) => setEvents(r.data)); };
  useEffect(load, []);
  if (!summary) return <Loader/>;
  const addClub = async (event) => { event.preventDefault(); if (name) { await api.post('/admin/clubs', { name }); setName(''); load(); } };
  const review = async (id, decision) => { const reason = decision === 'rejected' ? prompt('Briefly explain what the organizer should change:') : ''; if (decision === 'rejected' && reason === null) return; await api.put(`/admin/events/${id}/approval`, { decision, reason }); load(); };
  const pending = events.filter((event) => event.approvalStatus === 'pending');
  return <>
    <h1 className="text-3xl font-bold">Admin dashboard</h1>
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{Object.entries(summary).map(([key, value]) => <div key={key} className="rounded bg-white p-4 shadow"><b className="text-2xl">{value}</b><p className="capitalize text-slate-500">{key}</p></div>)}</div>
    <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Event approval queue</h2><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">{pending.length} pending</span></div><div className="mt-3 space-y-3">{pending.map((event) => <article className="rounded bg-white p-4 shadow" key={event.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{event.title}</h3><p className="text-sm text-slate-500">By {event.organizer} · {event.date} · {event.location}</p><p className="mt-2 text-sm">{event.description}</p></div><div className="flex gap-2"><button className="btn" onClick={() => review(event.id, 'approved')}>Approve</button><button className="btn-secondary border-red-600 text-red-600" onClick={() => review(event.id, 'rejected')}>Request changes</button></div></div></article>)}</div>{!pending.length && <p className="mt-3 text-slate-500">No events are waiting for review.</p>}</section>
    <section className="mt-8"><h2 className="text-xl font-bold">Users</h2><div className="mt-3 overflow-auto rounded bg-white shadow"><table className="w-full text-left text-sm"><tbody>{users.map((user) => <tr className="border-b" key={user.id}><td className="p-3">{user.name}<br/><span className="text-slate-500">{user.email}</span></td><td><select value={user.role} onChange={async (event) => { await api.put(`/admin/users/${user.id}`, { role: event.target.value }); load(); }}>{['student', 'organizer', 'admin'].map((role) => <option key={role}>{role}</option>)}</select></td><td><button className="text-red-600" onClick={async () => { if (confirm('Delete user?')) { await api.delete(`/admin/users/${user.id}`); load(); } }}>Delete</button></td></tr>)}</tbody></table></div></section>
    <section className="mt-8"><h2 className="text-xl font-bold">Clubs</h2><form className="mt-3 flex gap-2" onSubmit={addClub}><input className="input" placeholder="New club name" value={name} onChange={(event) => setName(event.target.value)}/><button className="btn">Add</button></form><div className="mt-3 space-y-2">{clubs.map((club) => <div className="rounded bg-white p-3 shadow-sm" key={club.id}>{club.name}<button className="float-right text-red-600" onClick={async () => { await api.delete(`/admin/clubs/${club.id}`); load(); }}>Delete</button></div>)}</div></section>
  </>;
}
