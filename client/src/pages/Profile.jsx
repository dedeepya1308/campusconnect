import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Notification from '../components/Notification';

const initialForm = (user) => ({
  name: user.name || '', bio: user.bio || '', department: user.department || '', course: user.course || '',
  graduationYear: user.graduationYear || '', interests: (user.interests || []).join(', '), phone: user.phone || '', linkedin: user.linkedin || ''
});

export default function Profile() {
  const { user, setUser } = useAuth(); const [form, setForm] = useState(initialForm(user)); const [saved, setSaved] = useState(false); const [error, setError] = useState('');
  const update = (key, value) => { setSaved(false); setForm({ ...form, [key]: value }); };
  const submit = async (event) => {
    event.preventDefault(); setError('');
    try { const { data } = await api.put('/auth/me', { ...form, interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean) }); setUser(data); setSaved(true); }
    catch (err) { setError(err.response?.data?.message || 'Profile could not be saved.'); }
  };
  return <form onSubmit={submit} className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow sm:p-8">
    <div className="border-b border-slate-200 pb-5"><h1 className="text-2xl font-bold">My profile</h1><p className="mt-1 text-slate-500">Keep your campus identity and interests up to date.</p><p className="mt-3 text-sm text-slate-500">{user.email} · <span className="capitalize">{user.role}</span></p></div>
    <Notification error={error}/>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="sm:col-span-2">Name<input required className="input mt-1" value={form.name} onChange={(e) => update('name', e.target.value)}/></label>
      <label>Department<input className="input mt-1" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => update('department', e.target.value)}/></label>
      <label>Course / program<input className="input mt-1" placeholder="e.g. B.Tech" value={form.course} onChange={(e) => update('course', e.target.value)}/></label>
      <label>Graduation year<input className="input mt-1" inputMode="numeric" placeholder="e.g. 2027" value={form.graduationYear} onChange={(e) => update('graduationYear', e.target.value)}/></label>
      <label>Phone number<input className="input mt-1" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}/></label>
      <label className="sm:col-span-2">LinkedIn / portfolio URL<input className="input mt-1" type="url" placeholder="https://…" value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)}/></label>
      <label className="sm:col-span-2">About me<textarea className="input mt-1 min-h-28" maxLength="500" placeholder="Tell the campus community a little about yourself." value={form.bio} onChange={(e) => update('bio', e.target.value)}/></label>
      <label className="sm:col-span-2">Interests<input className="input mt-1" placeholder="e.g. Web development, music, photography" value={form.interests} onChange={(e) => update('interests', e.target.value)}/><span className="mt-1 block text-xs text-slate-500">Separate interests with commas. Up to 12 interests.</span></label>
    </div>
    <button className="btn mt-7">Save profile</button>{saved && <span className="ml-3 text-sm font-medium text-green-700">Profile saved.</span>}
  </form>;
}
