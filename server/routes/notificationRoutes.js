import { Router } from 'express';
import { readData, writeData } from '../utils/fileHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticate, async (req,res) => res.json((await readData('notifications.json')).filter((n) => n.userId === req.user.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt))));
router.put('/:id/read', authenticate, async (req,res) => { const items = await readData('notifications.json'); const i = items.findIndex((n) => n.id === req.params.id && n.userId === req.user.id); if (i < 0) return res.status(404).json({ message: 'Notification not found.' }); items[i].read = true; await writeData('notifications.json', items); res.json(items[i]); });
export default router;
