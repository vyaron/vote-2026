'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Grid, List, X } from 'lucide-react';
import type { MkSummary } from '@/types';
import { getMkPhotoPath } from '@/lib/data';
import { getMkSlug } from '@/lib/slugs';
import { cn } from '@/lib/utils';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

// MK Card for grid view
function MkGridCard({ mk }: { mk: MkSummary }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link
        href={`/mks/${getMkSlug(mk.id, mk.name)}`}
        className="block bg-card rounded-2xl overflow-hidden shadow-sm border hover:shadow-lg transition-all group"
      >
        <div className="aspect-[3/4] relative overflow-hidden">
          <Image
            src={getMkPhotoPath(mk.id)}
            alt={mk.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-bold text-lg leading-tight">{mk.name}</h3>
            <p className="text-white/80 text-sm">{mk.faction}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// MK Card for list view
function MkListCard({ mk }: { mk: MkSummary }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link
        href={`/mks/${getMkSlug(mk.id, mk.name)}`}
        className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:shadow-md transition-all group"
      >
        <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={getMkPhotoPath(mk.id)}
            alt={mk.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
            {mk.name}
          </h3>
          <p className="text-muted-foreground text-sm truncate">{mk.faction}</p>
          {mk.position && (
            <p className="text-xs text-muted-foreground/70 truncate mt-1">{mk.position}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function MksPage() {
  const [mks, setMks] = useState<MkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Load MKs
  useEffect(() => {
    async function loadMks() {
      try {
        const res = await fetch('/data/active-mk-ids.json');
        const ids: number[] = await res.json();
        
        const mkPromises = ids.map(async (id) => {
          const mkRes = await fetch(`/data/mks/${id}.json`);
          const mk = await mkRes.json();
          return {
            id: mk.id,
            name: mk.name,
            faction: mk.faction,
            isCurrentMk: mk.isCurrentMk,
            profileImage: mk.images.profile,
            gender: mk.gender,
            position: mk.position,
          } as MkSummary;
        });
        
        const loadedMks = await Promise.all(mkPromises);
        setMks(loadedMks);
      } catch (error) {
        console.error('Failed to load MKs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMks();
  }, []);

  // Get unique parties
  const parties = useMemo(() => {
    const partySet = new Set(mks.map(mk => mk.faction.trim()));
    return Array.from(partySet).sort();
  }, [mks]);

  // Filter MKs
  const filteredMks = useMemo(() => {
    let result = mks;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(mk => 
        mk.name.toLowerCase().includes(query) ||
        mk.faction.toLowerCase().includes(query)
      );
    }
    
    if (selectedParty) {
      result = result.filter(mk => mk.faction.trim() === selectedParty);
    }
    
    return result;
  }, [mks, searchQuery, selectedParty]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">חברי הכנסת</h1>
            <p className="text-muted-foreground">
              {loading ? 'טוען...' : `${filteredMks.length} חברי כנסת`}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="חיפוש לפי שם או מפלגה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filter button (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "md:hidden p-2 rounded-lg border transition-colors",
                showFilters ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <Filter className="h-5 w-5" />
            </button>

            {/* Party filter (desktop) */}
            <div className="hidden md:block">
              <select
                value={selectedParty || ''}
                onChange={(e) => setSelectedParty(e.target.value || null)}
                className="px-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">כל המפלגות</option>
                {parties.map(party => (
                  <option key={party} value={party}>{party}</option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'grid' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'list' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4"
            >
              <select
                value={selectedParty || ''}
                onChange={(e) => setSelectedParty(e.target.value || null)}
                className="w-full px-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">כל המפלגות</option>
                {parties.map(party => (
                  <option key={party} value={party}>{party}</option>
                ))}
              </select>
            </motion.div>
          )}
        </div>
      </div>

      {/* MKs Grid/List */}
      <div className="container py-8">
        {loading ? (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "space-y-3"
          )}>
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "bg-muted animate-pulse rounded-2xl",
                  viewMode === 'grid' ? "aspect-[3/4]" : "h-24"
                )}
              />
            ))}
          </div>
        ) : filteredMks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">לא נמצאו תוצאות</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedParty(null); }}
              className="mt-4 text-primary hover:underline"
            >
              נקה חיפוש
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "space-y-3"
            )}
          >
            {filteredMks.map((mk) => (
              viewMode === 'grid' 
                ? <MkGridCard key={mk.id} mk={mk} />
                : <MkListCard key={mk.id} mk={mk} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
