import { promises as fs } from 'fs';
import path from 'path';
import type { MK } from '@/types';
import { parseIdOrSlug } from '@/lib/slugs';

export async function getMkServer(idOrSlug: string): Promise<MK | null> {
  const id = parseIdOrSlug(idOrSlug);
  if (id === null) return null;
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'mks', `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getActiveMkIds(): Promise<number[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'active-mk-ids.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}
