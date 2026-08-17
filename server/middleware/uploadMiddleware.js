import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateId } from '../utils/generateId.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({ destination: path.join(__dirname, '..', 'uploads'), filename: (_, file, cb) => cb(null, `${generateId('img')}${path.extname(file.originalname).toLowerCase()}`) });
const imageFilter = (_, file, cb) => cb(null, file.mimetype.startsWith('image/'));
export const uploadImage = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
