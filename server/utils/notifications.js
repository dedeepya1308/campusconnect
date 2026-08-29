import { readData, writeData } from './fileHandler.js';
import { generateId } from './generateId.js';

export const createNotification = async (userId, message, type = 'general', link = '') => {
  const notifications = await readData('notifications.json');
  const notification = { id: generateId('note'), userId, message, type, link, read: false, createdAt: new Date().toISOString() };
  notifications.push(notification);
  await writeData('notifications.json', notifications);
  return notification;
};

export const notifyMany = async (userIds, message, type, link = '') => Promise.all(userIds.map((userId) => createNotification(userId, message, type, link)));
