import { Router } from 'express';
import { readData, writeData } from '../utils/fileHandler.js';
import { generateId } from '../utils/generateId.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/:eventId', async (req,res) => { const comments = await readData('comments.json'); const users = await readData('users.json'); res.json(comments.filter((c) => c.eventId === req.params.eventId).map((c) => ({ ...c, author: users.find((u) => u.id === c.userId)?.name || 'Deleted user' }))); });
router.post('/:eventId', authenticate, async (req,res) => { const text = req.body.text?.trim(); if (!text) return res.status(400).json({ message: 'Comment text is required.' }); const comments = await readData('comments.json'); const comment = { id: generateId('com'), eventId: req.params.eventId, userId: req.user.id, text, createdAt: new Date().toISOString() }; comments.push(comment); await writeData('comments.json', comments); res.status(201).json({ ...comment, author: req.user.name }); });
router.delete('/:id', authenticate, async (req,res) => { const comments = await readData('comments.json'); const comment = comments.find((c) => c.id === req.params.id); if (!comment) return res.status(404).json({ message: 'Comment not found.' }); if (comment.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not permitted.' }); await writeData('comments.json', comments.filter((c) => c.id !== comment.id)); res.status(204).end(); });
export default router;
