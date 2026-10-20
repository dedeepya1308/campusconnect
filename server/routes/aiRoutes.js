import { Router } from 'express';
import { readData } from '../utils/fileHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
const keywords = (value = '') => value.toLowerCase().split(/[^a-z0-9+#.]+/).filter((word) => word.length > 2);
const isPublic = (event) => (event.status || 'published') === 'published' && (event.approvalStatus || 'approved') === 'approved';
const aiRequest = async (instructions, input) => {
  if (!process.env.OPENAI_API_KEY) return null;
  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions, input, max_output_tokens: 450 }) });
  if (!response.ok) throw new Error('AI service is unavailable.');
  const result = await response.json();
  return result.output_text?.trim();
};

router.get('/recommendations', authenticate, allowRoles('student'), async (req, res) => {
  const [events, follows] = await Promise.all([readData('events.json'), readData('follows.json')]);
  const interests = keywords([...(req.user.interests || []), req.user.department, req.user.course].join(' '));
  const followedClubIds = new Set(follows.filter((follow) => follow.userId === req.user.id).map((follow) => follow.clubId));
  const recommendations = events.filter((event) => isPublic(event) && event.date >= new Date().toISOString().slice(0, 10)).map((event) => {
    const haystack = keywords(`${event.title} ${event.description} ${event.category}`); const matches = interests.filter((interest) => haystack.includes(interest)); const clubMatch = followedClubIds.has(event.clubId); const score = matches.length * 3 + (clubMatch ? 4 : 0); const reasons = [...matches.slice(0, 2).map((item) => `Matches your interest in ${item}`), ...(clubMatch ? ['From a club you follow'] : [])]; return { ...event, score, reasons: reasons.length ? reasons : ['Popular campus opportunity'] };
  }).sort((a, b) => b.score - a.score || `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 6);
  res.json(recommendations);
});

router.post('/event-description', authenticate, allowRoles('organizer', 'admin'), async (req, res) => {
  const { title, category, date, time, location, audience = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Add an event title first.' });
  const fallback = `${title} is an engaging ${category || 'campus'} event${audience ? ` designed for ${audience}` : ' for the campus community'}. Join us on ${date || 'the scheduled date'}${time ? ` at ${time}` : ''}${location ? ` in ${location}` : ''}. Connect with fellow students, learn something new, and be part of the experience.`;
  try { const generated = await aiRequest('Write one polished, welcoming event description in 70–110 words. Do not invent facts. Return only the description.', JSON.stringify({ title, category, date, time, location, audience })); res.json({ description: generated || fallback, source: generated ? 'ai' : 'template' }); } catch (error) { res.json({ description: fallback, source: 'template', notice: error.message }); }
});

router.get('/feedback-summary/:eventId', authenticate, allowRoles('organizer', 'admin'), async (req, res) => {
  const [events, feedback] = await Promise.all([readData('events.json'), readData('feedback.json')]); const event = events.find((item) => item.id === req.params.eventId); if (!event) return res.status(404).json({ message: 'Event not found.' }); if (req.user.role !== 'admin' && event.organizerId !== req.user.id) return res.status(403).json({ message: 'Not permitted.' }); const comments = feedback.filter((item) => item.eventId === event.id && item.comment).map((item) => ({ rating: item.rating, comment: item.comment })); const average = feedback.filter((item) => item.eventId === event.id); const fallback = comments.length ? `Feedback overview: ${average.length} response${average.length === 1 ? '' : 's'} with an average rating of ${(average.reduce((sum, item) => sum + item.rating, 0) / average.length).toFixed(1)}/5. Review the private comments below for recurring strengths and improvements.` : 'There is not enough written feedback yet to create a summary.'; try { const summary = comments.length ? await aiRequest('Summarize private event feedback in three concise sections: What worked, Opportunities to improve, and Suggested next step. Do not identify any attendee.', JSON.stringify(comments)) : null; res.json({ summary: summary || fallback, source: summary ? 'ai' : 'template' }); } catch { res.json({ summary: fallback, source: 'template' }); }
});

router.post('/event-agenda', authenticate, allowRoles('organizer', 'admin'), async (req, res) => {
  const { title, category = 'campus', duration = 120, audience = 'students', goal = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Add an event title first.' });
  const minutes = Math.max(30, Number(duration) || 120); const opening = Math.max(10, Math.round(minutes * 0.1)); const close = Math.max(10, Math.round(minutes * 0.1)); const activity = Math.max(20, minutes - opening - close - 15);
  const fallback = `Suggested agenda for ${title}\n\n• Welcome and introductions — ${opening} minutes\n• Main ${category} session — ${Math.round(activity * 0.55)} minutes\n• Interactive activity / Q&A — ${Math.round(activity * 0.45)} minutes\n• Networking break — 15 minutes\n• Wrap-up and next steps — ${close} minutes\n\nAudience: ${audience}${goal ? `\nGoal: ${goal}` : ''}`;
  try { const agenda = await aiRequest('Create a practical, minute-by-minute event agenda. Use only supplied facts. Include welcome, core activity, interaction, and wrap-up. Return plain text with clear bullet points.', JSON.stringify({ title, category, duration: minutes, audience, goal })); res.json({ agenda: agenda || fallback, source: agenda ? 'ai' : 'template' }); } catch { res.json({ agenda: fallback, source: 'template' }); }
});

router.post('/chat', authenticate, async (req, res) => {
  const question = req.body.message?.trim(); if (!question) return res.status(400).json({ message: 'Ask a question first.' });
  const [events, clubs, follows] = await Promise.all([readData('events.json'), readData('clubs.json'), readData('follows.json')]);
  const upcoming = events.filter((event) => isPublic(event) && event.date >= new Date().toISOString().slice(0, 10)).slice(0, 12).map(({ title, date, time, location, category, clubId }) => ({ title, date, time, location, category, clubId }));
  const clubContext = clubs.map(({ id, name, description }) => ({ id, name, description })); const followed = follows.filter((follow) => follow.userId === req.user.id).map((follow) => follow.clubId);
  const fallback = upcoming.length ? `Here are upcoming events you can explore: ${upcoming.slice(0, 3).map((event) => `${event.title} on ${event.date} at ${event.location}`).join('; ')}. You can browse Events or Clubs for more details.` : 'There are no approved upcoming events yet. Check back after organizers publish events.';
  try { const answer = await aiRequest('You are CampusConnect Assistant. Answer only about the supplied campus events, clubs, and the signed-in user. Be concise. If information is missing, say so. Do not invent events, policies, or registration status.', JSON.stringify({ question, user: { role: req.user.role, interests: req.user.interests || [], followedClubIds: followed }, upcomingEvents: upcoming, clubs: clubContext })); res.json({ answer: answer || fallback, source: answer ? 'ai' : 'local' }); } catch { res.json({ answer: fallback, source: 'local' }); }
});
export default router;
