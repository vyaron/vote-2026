/**
 * Data loading utilities for Knesset data
 * Loads data from public/data directory
 */

import type { MK, MkSummary, Party, Committee, KnessetStats, PartyWithMembers } from '@/types';
import { getPartyColor } from '@/types';

// Base path for data files (works both server-side and client-side)
const DATA_BASE_PATH = '/data';

/**
 * Get all MK IDs from the active MKs list
 */
export async function getMkIds(): Promise<number[]> {
  const response = await fetch(`${DATA_BASE_PATH}/active-mk-ids.json`);
  return response.json();
}

/**
 * Get a single MK by ID
 */
export async function getMkById(id: number): Promise<MK | null> {
  try {
    const response = await fetch(`${DATA_BASE_PATH}/mks/${id}.json`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Get all MKs
 */
export async function getAllMks(): Promise<MK[]> {
  const ids = await getMkIds();
  const mks = await Promise.all(ids.map(id => getMkById(id)));
  return mks.filter((mk): mk is MK => mk !== null);
}

/**
 * Get MK summaries for list views
 */
export async function getMkSummaries(): Promise<MkSummary[]> {
  const mks = await getAllMks();
  return mks.map(mk => ({
    id: mk.id,
    name: mk.name,
    faction: mk.faction,
    isCurrentMk: mk.isCurrentMk,
    profileImage: mk.images.profile,
    gender: mk.gender,
    position: mk.position,
  }));
}

/**
 * Get all parties/factions
 */
export async function getAllParties(): Promise<Party[]> {
  const response = await fetch(`${DATA_BASE_PATH}/parties/factions.json`);
  return response.json();
}

/**
 * Get current Knesset parties only
 */
export async function getCurrentParties(): Promise<Party[]> {
  const parties = await getAllParties();
  return parties.filter(p => p.isCurrent);
}

/**
 * Get party by ID
 */
export async function getPartyById(id: number): Promise<Party | null> {
  try {
    const response = await fetch(`${DATA_BASE_PATH}/parties/${id}.json`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Get all committees
 */
export async function getAllCommittees(): Promise<Committee[]> {
  const response = await fetch(`${DATA_BASE_PATH}/committees.json`);
  return response.json();
}

/**
 * Get parties with their MK members
 */
export async function getPartiesWithMembers(): Promise<PartyWithMembers[]> {
  const [parties, mks] = await Promise.all([
    getCurrentParties(),
    getMkSummaries(),
  ]);

  // Group MKs by faction
  const mksByFaction = new Map<string, MkSummary[]>();
  for (const mk of mks) {
    const faction = mk.faction.trim();
    if (!mksByFaction.has(faction)) {
      mksByFaction.set(faction, []);
    }
    mksByFaction.get(faction)!.push(mk);
  }

  // Match parties with their MKs
  return parties.map(party => {
    const partyMks = mksByFaction.get(party.name.trim()) || [];
    return {
      ...party,
      memberCount: partyMks.length,
      mks: partyMks,
      color: getPartyColor(party.name),
    };
  }).filter(p => p.memberCount > 0);
}

/**
 * Get dashboard statistics
 */
export async function getKnessetStats(): Promise<KnessetStats> {
  const [mks, parties, committees] = await Promise.all([
    getAllMks(),
    getCurrentParties(),
    getAllCommittees(),
  ]);

  const currentMks = mks.filter(mk => mk.isCurrentMk);
  const maleCount = currentMks.filter(mk => mk.gender === 'male').length;
  const femaleCount = currentMks.filter(mk => mk.gender === 'female').length;
  
  // Calculate average age
  const ages = currentMks
    .map(mk => {
      if (!mk.dateOfBirth) return null;
      const match = mk.dateOfBirth.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!match) return null;
      const birthYear = parseInt(match[3]);
      return new Date().getFullYear() - birthYear;
    })
    .filter((age): age is number => age !== null);
  
  const averageAge = ages.length > 0 
    ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
    : 0;

  const totalPhotos = mks.reduce((sum, mk) => sum + (mk.photos?.length || 0), 0);

  return {
    totalMks: mks.length,
    currentMks: currentMks.length,
    parties: parties.length,
    committees: committees.length,
    photos: totalPhotos,
    maleCount,
    femaleCount,
    averageAge,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Search MKs by name (fuzzy search ready)
 */
export async function searchMks(query: string): Promise<MkSummary[]> {
  const mks = await getMkSummaries();
  const lowerQuery = query.toLowerCase();
  
  return mks.filter(mk => 
    mk.name.toLowerCase().includes(lowerQuery) ||
    mk.faction.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get MKs by party name
 */
export async function getMksByParty(partyName: string): Promise<MK[]> {
  const mks = await getAllMks();
  return mks.filter(mk => mk.faction.trim() === partyName.trim());
}

/**
 * Calculate age from Hebrew/formatted date string
 */
export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  
  // Try to extract date in format DD/MM/YYYY
  const match = dateOfBirth.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  
  const [, day, month, year] = match;
  const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get local photo path for an MK
 */
export function getMkPhotoPath(mkId: number, filename: string = 'profile.jpg'): string {
  return `/data/photos/${mkId}/${filename}`;
}

/**
 * Get party logo path
 */
export function getPartyLogoPath(partyId: number): string {
  return `/party-logos/${partyId}.png`;
}

/**
 * Get party by ID with members
 */
export async function getPartyWithMembers(partyId: number): Promise<PartyWithMembers | null> {
  const party = await getPartyById(partyId);
  if (!party) return null;

  const mks = await getMkSummaries();
  const partyMks = mks.filter(mk => mk.faction.trim() === party.name.trim());

  return {
    ...party,
    memberCount: partyMks.length,
    mks: partyMks,
    color: getPartyColor(party.name),
  };
}
