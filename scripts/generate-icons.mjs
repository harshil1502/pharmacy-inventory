import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = join(process.cwd(), 'public', 'icons');

mkdirSync(outputDir, { recursive: true });

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - dark blue gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1e40af');
  gradient.addColorStop(1, '#3b82f6');
  ctx.fillStyle = gradient;
  
  // Rounded rectangle
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Draw "PS" text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
  ctx.fillText('PS', size / 2, size / 2);

  // Save
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon-${size}x${size}.png`;
  writeFileSync(join(outputDir, filename), buffer);
  console.log(`✓ Generated ${filename}`);
});

console.log('\\n✅ All icons generated!');
