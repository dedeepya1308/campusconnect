import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
export const readData = async (file) => JSON.parse(await fs.readFile(path.join(dataDir, file), 'utf8'));
export const writeData = async (file, data) => fs.writeFile(path.join(dataDir, file), JSON.stringify(data, null, 2));
