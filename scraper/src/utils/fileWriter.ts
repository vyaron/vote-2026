/**
 * File system utilities for saving JSON and images
 */

import { writeFile, mkdir, readFile, access, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';
import { logger } from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');

// Resolve output directories relative to scraper folder
const dataDir = join(projectRoot, config.output.dataDir);
const mksDir = join(projectRoot, config.output.mksDir);
const photosDir = join(projectRoot, config.output.photosDir);
const partiesDir = join(projectRoot, config.output.partiesDir);

export const fileWriter = {
  /**
   * Ensure all output directories exist
   */
  async ensureDirectories(): Promise<void> {
    const dirs = [dataDir, mksDir, photosDir, partiesDir];
    
    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
    }
    
    logger.info('Output directories created', 'FileSystem');
  },
  
  /**
   * Save JSON data to a file
   */
  async saveJson(filename: string, data: unknown, subdir?: string): Promise<string> {
    const dir = subdir ? join(dataDir, subdir) : dataDir;
    await mkdir(dir, { recursive: true });
    
    const filepath = join(dir, filename);
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    
    logger.debug(`Saved ${filepath}`, 'FileSystem');
    return filepath;
  },
  
  /**
   * Save MK data to individual JSON file
   */
  async saveMk(mkId: number, data: unknown): Promise<string> {
    const filename = `${mkId}.json`;
    const filepath = join(mksDir, filename);
    
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    logger.debug(`Saved MK ${mkId}`, 'FileSystem');
    
    return filepath;
  },
  
  /**
   * Save party data
   */
  async saveParty(partyId: number, data: unknown): Promise<string> {
    const filename = `${partyId}.json`;
    const filepath = join(partiesDir, filename);
    
    await mkdir(partiesDir, { recursive: true });
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    
    return filepath;
  },
  
  /**
   * Save an image file for an MK
   */
  async savePhoto(mkId: number, filename: string, buffer: Buffer): Promise<string> {
    const mkPhotoDir = join(photosDir, String(mkId));
    await mkdir(mkPhotoDir, { recursive: true });
    
    const filepath = join(mkPhotoDir, filename);
    await writeFile(filepath, buffer);
    
    logger.debug(`Saved photo ${filename} for MK ${mkId}`, 'FileSystem');
    return filepath;
  },
  
  /**
   * Check if a file exists
   */
  async exists(filepath: string): Promise<boolean> {
    try {
      await access(filepath);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Read JSON file
   */
  async readJson<T>(filepath: string): Promise<T | null> {
    try {
      const content = await readFile(filepath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  },
  
  /**
   * Get list of already saved MK IDs
   */
  async getSavedMkIds(): Promise<number[]> {
    try {
      const files = await readdir(mksDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => parseInt(f.replace('.json', ''), 10))
        .filter(id => !isNaN(id));
    } catch {
      return [];
    }
  },
  
  /**
   * Get stats about saved data
   */
  async getStats(): Promise<{ mks: number; photos: number; parties: number }> {
    let mks = 0;
    let photos = 0;
    let parties = 0;
    
    try {
      const mkFiles = await readdir(mksDir);
      mks = mkFiles.filter(f => f.endsWith('.json')).length;
    } catch {}
    
    try {
      const photoDirs = await readdir(photosDir);
      for (const dir of photoDirs) {
        const photoFiles = await readdir(join(photosDir, dir));
        photos += photoFiles.length;
      }
    } catch {}
    
    try {
      const partyFiles = await readdir(partiesDir);
      parties = partyFiles.filter(f => f.endsWith('.json')).length;
    } catch {}
    
    return { mks, photos, parties };
  },
  
  // Export paths for external use
  paths: {
    dataDir,
    mksDir,
    photosDir,
    partiesDir,
  },
};
