import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, '../../uploads');

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function saveUploadedPhoto(multipartFile) {
  const ext = multipartFile.filename.split('.').pop()?.toLowerCase() || 'jpg';
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
  if (!allowed.includes(ext)) {
    throw new Error('Format de fichier non autorisé (jpg, png, webp uniquement)');
  }

  const filename = `bc_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const filepath = join(UPLOADS_DIR, filename);

  // Lire le buffer complet
  const chunks = [];
  for await (const chunk of multipartFile.file) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Redimensionner à 800px max et convertir en JPEG
  await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(filepath);

  return `/uploads/${filename}`;
}
