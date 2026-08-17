import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readData, writeData } from '../utils/fileHandler.js';
import { generateId } from '../utils/generateId.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
const safe = ({ password, ...user }) => user;
const tokenFor = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' });
router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (!['student', 'organizer'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
  const users = await readData('users.json');
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ message: 'Email is already registered.' });
  const user = { id: generateId('usr'), name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role, bio: '', department: '', course: '', graduationYear: '', interests: [], phone: '', linkedin: '', createdAt: new Date().toISOString() };
  users.push(user); await writeData('users.json', users);
  res.status(201).json({ token: tokenFor(user), user: safe(user) });
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body; const user = (await readData('users.json')).find((u) => u.email === email?.toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: tokenFor(user), user: safe(user) });
});
router.get('/me', authenticate, (req, res) => res.json(req.user));
router.put('/me', authenticate, async (req, res) => {
  const users = await readData('users.json'); const index = users.findIndex((u) => u.id === req.user.id);
  const fields = ['name', 'bio', 'department', 'course', 'graduationYear', 'phone', 'linkedin'];
  fields.forEach((field) => { if (req.body[field] !== undefined) users[index][field] = String(req.body[field]).trim(); });
  if (req.body.interests !== undefined) users[index].interests = Array.isArray(req.body.interests) ? req.body.interests.map((item) => String(item).trim()).filter(Boolean).slice(0, 12) : [];
  if (!users[index].name) return res.status(400).json({ message: 'Name is required.' });
  await writeData('users.json', users); res.json(safe(users[index]));
});
export default router;
