import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import type { Party, MK, PartyWithMembers, MkSummary } from '@/types';
import { getPartyColor } from '@/types';
import { PartyPageClient } from './PartyPageClient';

interface PartyPageProps {
  params: Promise<{ id: string }>;
}

async function getPartyData(id: number): Promise<PartyWithMembers | null> {
  try {
    // Load party data
    const partyPath = path.join(process.cwd(), 'public', 'data', 'parties', `${id}.json`);
    const partyData = await fs.readFile(partyPath, 'utf-8');
    const party: Party = JSON.parse(partyData);

    // Load all MKs and filter by faction
    const activeMksPath = path.join(process.cwd(), 'public', 'data', 'active-mk-ids.json');
    const activeMksData = await fs.readFile(activeMksPath, 'utf-8');
    const activeMkIds: number[] = JSON.parse(activeMksData);

    const mks: MkSummary[] = [];
    for (const mkId of activeMkIds) {
      try {
        const mkPath = path.join(process.cwd(), 'public', 'data', 'mks', `${mkId}.json`);
        const mkData = await fs.readFile(mkPath, 'utf-8');
        const mk: MK = JSON.parse(mkData);
        
        if (mk.faction.trim() === party.name.trim()) {
          mks.push({
            id: mk.id,
            name: mk.name,
            faction: mk.faction,
            isCurrentMk: mk.isCurrentMk,
            profileImage: mk.images.profile,
            gender: mk.gender,
            position: mk.position,
          });
        }
      } catch {
        // Skip if MK file not found
      }
    }

    return {
      ...party,
      memberCount: mks.length,
      mks,
      color: getPartyColor(party.name),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PartyPageProps) {
  const { id } = await params;
  const party = await getPartyData(parseInt(id));
  
  if (!party) {
    return { title: 'סיעה לא נמצאה' };
  }

  return {
    title: party.name.trim(),
    description: `פרטים על סיעת ${party.name.trim()} בכנסת ה-25 - ${party.memberCount} חברי כנסת`,
  };
}

export async function generateStaticParams() {
  // Generate paths for all current parties
  const factionsPath = path.join(process.cwd(), 'public', 'data', 'parties', 'factions.json');
  const factionsData = await fs.readFile(factionsPath, 'utf-8');
  const factions: Party[] = JSON.parse(factionsData);
  
  return factions
    .filter(f => f.isCurrent)
    .map(faction => ({
      id: faction.id.toString(),
    }));
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { id } = await params;
  const party = await getPartyData(parseInt(id));

  if (!party) {
    notFound();
  }

  return <PartyPageClient party={party} />;
}
