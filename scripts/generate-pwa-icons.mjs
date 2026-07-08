import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'public/assets/logo/logo-light-mode.png');
const outDir = path.join(root, 'public/icons');

await mkdir(outDir, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192, padding: 0 },
  { file: 'icon-512.png', size: 512, padding: 0 },
  // ponytail: maskable icons need ~20% safe-zone padding so OS masks don't crop the logo
  { file: 'icon-maskable-192.png', size: 192, padding: 0.2 },
  { file: 'icon-maskable-512.png', size: 512, padding: 0.2 },
];

for (const { file, size, padding } of targets) {
  const contentSize = Math.round(size * (1 - padding * 2));
  await sharp(source)
    .resize(contentSize, contentSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: Math.round((size - contentSize) / 2),
      bottom: Math.round((size - contentSize) / 2),
      left: Math.round((size - contentSize) / 2),
      right: Math.round((size - contentSize) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, file));
  console.warn(`generated ${file}`);
}
