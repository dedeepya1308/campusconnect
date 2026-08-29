import { Router } from 'express';
import { readData, writeData } from '../utils/fileHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticate, async (req,res) => res.json((await readData('notifications.json')).filter((n) => n.userId === req.user.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt))));
router.get('/unread-count', authenticate, async (req,res) => res.json({ count: (await readData('notifications.json')).filter((n) => n.userId === req.user.id && !n.read).length }));
router.put('/:id/read', authenticate, async (req,res) => { const items = await readData('notifications.json'); const i = items.findIndex((n) => n.id === req.params.id && n.userId === req.user.id); if (i < 0) return res.status(404).json({ message: 'Notification not found.' }); items[i].read = true; await writeData('notifications.json', items); res.json(items[i]); });
router.put('/read-all', authenticate, async (req,res) => { const items = await readData('notifications.json'); items.forEach((item) => { if (item.userId === req.user.id) item.read = true; }); await writeData('notifications.json', items); res.status(204).end(); });
export default router;
