#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pc from 'picocolors';
import { optimize as svgoOptimize } from 'svgo';

const args = process.argv.slice(2);
let dir = './public';
let convertToAvif = false;
let convertToWebp = false;
let help = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) {
    dir = args[i + 1];
    i++;
  } else if (args[i] === '--avif') {
    convertToAvif = true;
  } else if (args[i] === '--webp') {
    convertToWebp = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    help = true;
  }
}

if (help) {
  console.log(`
${pc.cyan(pc.bold('📦 Asset Pack CLI'))}

Usage: asset-pack [options]

Options:
  --dir <path>     Directory to optimize (default: ./public)
  --avif           Convert all PNGs and JPEGs to AVIF
  --webp           Convert all PNGs and JPEGs to WebP
  --help, -h       Show this help message
  `);
  process.exit(0);
}

const stats = {
  original: 0,
  optimized: 0,
  count: 0
};

async function processDirectory(directory: string) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (e) {
    console.error(pc.red(`Error reading directory: ${directory}`));
    process.exit(1);
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      
      try {
        if (ext === '.svg') {
          const content = await fs.readFile(fullPath, 'utf-8');
          const origSize = Buffer.byteLength(content, 'utf-8');
          
          const result = svgoOptimize(content, { path: fullPath, multipass: true });
          const optimizedSize = Buffer.byteLength(result.data, 'utf-8');
          
          if (optimizedSize < origSize) {
            await fs.writeFile(fullPath, result.data);
            stats.original += origSize;
            stats.optimized += optimizedSize;
            stats.count++;
          }
        } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
          const buffer = await fs.readFile(fullPath);
          const origSize = buffer.byteLength;
          let processor = sharp(buffer);
          let newPath = fullPath;
          
          if (convertToAvif) {
            processor = processor.avif({ quality: 80, effort: 6 });
            newPath = fullPath.replace(/\.(png|jpe?g|webp)$/i, '.avif');
          } else if (convertToWebp) {
            processor = processor.webp({ quality: 80, effort: 6 });
            newPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');
          } else if (ext === '.png') {
            processor = processor.png({ quality: 80, compressionLevel: 9 });
          } else if (['.jpg', '.jpeg'].includes(ext)) {
            processor = processor.jpeg({ quality: 80, mozjpeg: true });
          }
          
          const optimizedBuffer = await processor.toBuffer();
          if (optimizedBuffer.byteLength < origSize) {
            await fs.writeFile(newPath, optimizedBuffer);
            if (newPath !== fullPath) {
              await fs.unlink(fullPath);
            }
            stats.original += origSize;
            stats.optimized += optimizedBuffer.byteLength;
            stats.count++;
          }
        }
      } catch (err) {
        console.warn(pc.yellow(`⚠️ Failed to process ${fullPath}`));
      }
    }
  }
}

console.log(pc.cyan(`\n⏳ Optimizing assets in ${dir}...\n`));

processDirectory(dir).then(() => {
  if (stats.count === 0) {
    console.log(pc.gray('No assets needed optimization.'));
    return;
  }
  
  const savedBytes = stats.original - stats.optimized;
  const savingsRatio = stats.original > 0 ? ((savedBytes / stats.original) * 100).toFixed(1) : '0';
  const totalSavedKb = (savedBytes / 1024).toFixed(2);
  
  console.log(pc.green(pc.bold(`🔥 Successfully optimized ${stats.count} files!`)));
  console.log(pc.gray('-'.repeat(40)));
  console.log(`Original Size:  ${(stats.original / 1024).toFixed(2)} KB`);
  console.log(`Optimized Size: ${(stats.optimized / 1024).toFixed(2)} KB`);
  console.log(pc.green(pc.bold(`Total Saved:    ${totalSavedKb} KB (-${savingsRatio}%)`)));
  console.log('');
});
