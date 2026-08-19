import * as core from '@actions/core';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { optimize as svgoOptimize } from 'svgo';

const stats = {
  original: 0,
  optimized: 0,
  count: 0
};

async function processDirectory(directory: string, convertToAvif: boolean, convertToWebp: boolean) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (e) {
    core.setFailed(`Error reading directory: ${directory}`);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath, convertToAvif, convertToWebp);
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
        core.warning(`Failed to process ${fullPath}`);
      }
    }
  }
}

async function run() {
  try {
    const dir = core.getInput('directory') || './public';
    const avif = core.getInput('avif') === 'true';
    const webp = core.getInput('webp') === 'true';

    core.info(`⏳ Optimizing assets in ${dir}...`);
    
    await processDirectory(dir, avif, webp);
    
    if (stats.count === 0) {
      core.info('No assets needed optimization.');
    } else {
      const savedBytes = stats.original - stats.optimized;
      const savingsRatio = stats.original > 0 ? ((savedBytes / stats.original) * 100).toFixed(1) : '0';
      const totalSavedKb = (savedBytes / 1024).toFixed(2);
      
      core.info(`🔥 Successfully optimized ${stats.count} files!`);
      core.info(`Original Size: ${(stats.original / 1024).toFixed(2)} KB`);
      core.info(`Optimized Size: ${(stats.optimized / 1024).toFixed(2)} KB`);
      core.notice(`Total Saved: ${totalSavedKb} KB (-${savingsRatio}%)`);
    }

    core.setOutput('optimized_count', stats.count);
    core.setOutput('bytes_saved', stats.original - stats.optimized);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
