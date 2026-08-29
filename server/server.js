import express from 'express'; import cors from 'cors'; import dotenv from 'dotenv'; import path from 'path'; import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js'; import eventRoutes from './routes/eventRoutes.js'; import registrationRoutes from './routes/registrationRoutes.js'; import commentRoutes from './routes/commentRoutes.js'; import notificationRoutes from './routes/notificationRoutes.js'; import adminRoutes from './routes/adminRoutes.js';
import clubRoutes from './routes/clubRoutes.js'; import feedbackRoutes from './routes/feedbackRoutes.js';
dotenv.config(); const app = express(); const __dirname = path.dirname(fileURLToPath(import.meta.url));
const allowedOrigins = [
  'http://localhost:5173',
  'https://dedeepya1308.github.io'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));app.get('/api/health', (_,res) => res.json({ status: 'ok' })); app.use('/api/auth', authRoutes); app.use('/api/events', eventRoutes); app.use('/api/registrations', registrationRoutes); app.use('/api/comments', commentRoutes); app.use('/api/notifications', notificationRoutes); app.use('/api/clubs', clubRoutes); app.use('/api/feedback', feedbackRoutes); app.use('/api/admin', adminRoutes);
app.use((err,_,res,_next) => { if (err.name === 'MulterError') return res.status(400).json({ message: err.message }); res.status(500).json({ message: err.message || 'Something went wrong.' }); });
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CampusConnect API listening on ${PORT}`);
});