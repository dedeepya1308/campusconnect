import jwt from 'jsonwebtoken';
import { readData } from '../utils/fileHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    const user = (await readData('users.json')).find((item) => item.id === id);
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired token.' }); }
};
