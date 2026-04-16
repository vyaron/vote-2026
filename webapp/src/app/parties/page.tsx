'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Users, Building, ChevronLeft } from 'lucide-react';
import type { PartyWithMembers } from '@/types';
import { getPartiesWithMembers, getPartyLogoPath, getMkPhotoPath } from '@/lib/data';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Party card component
function PartyCard({ party, index }: { party: PartyWithMembers; index: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/parties/${party.id}`}>
        <motion.div
          className="group relative bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300"
          whileHover={{ y: -4 }}
        >
          {/* Party color bar */}
          <div 
            className="h-2"
            style={{ backgroundColor: party.color }}
          />

          <div className="p-6">
            {/* Logo and name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative h-16 w-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                {!imageError ? (
                  <Image
                    src={getPartyLogoPath(party.id)}
                    alt={party.name}
                    fill
                    className="object-contain p-2"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-700">
                    <Building className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                  {party.name.trim()}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{party.memberCount} חברי כנסת</span>
                </div>
              </div>
            </div>

            {/* Member preview */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {party.mks.slice(0, 5).map((mk) => (
                  <div
                    key={mk.id}
                    className="relative h-10 w-10 rounded-full border-2 border-background overflow-hidden"
                  >
                    <Image
                      src={getMkPhotoPath(mk.id)}
                      alt={mk.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {party.memberCount > 5 && (
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-sm font-medium">
                    +{party.memberCount - 5}
                  </div>
                )}
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground mr-auto group-hover:text-primary transition-colors" />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function PartiesPage() {
  const [parties, setParties] = useState<PartyWithMembers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPartiesWithMembers();
        // Sort by member count descending
        data.sort((a, b) => b.memberCount - a.memberCount);
        setParties(data);
      } catch (error) {
        console.error('Error loading parties:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalMks = parties.reduce((sum, p) => sum + p.memberCount, 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-linear-to-b from-primary/5 to-background overflow-hidden">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              🏛️ הסיעות בכנסת
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-8"
            >
              {parties.length} סיעות פעילות בכנסת ה-25, המייצגות את {totalMks} חברי הכנסת
            </motion.p>
            
            {/* Quick stats */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border">
                <Building className="h-5 w-5 text-primary" />
                <span className="font-medium">{parties.length} סיעות</span>
              </div>
              <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{totalMks} ח&quot;כים</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Parties Grid */}
      <section className="py-12">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {parties.map((party, index) => (
                <PartyCard key={party.id} party={party} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Seat Distribution Chart */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">חלוקת המנדטים</h2>
          <div className="bg-card rounded-2xl p-6 border">
            {/* Horizontal stacked bar */}
            <div className="h-12 rounded-lg overflow-hidden flex">
              {parties.map((party) => (
                <motion.div
                  key={party.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${(party.memberCount / totalMks) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="relative group cursor-pointer"
                  style={{ backgroundColor: party.color }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-bold drop-shadow-lg">
                      {party.memberCount}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4">
              {parties.map((party) => (
                <Link 
                  key={party.id}
                  href={`/parties/${party.id}`}
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: party.color }}
                  />
                  <span className="text-sm">{party.name.trim()}</span>
                  <span className="text-sm text-muted-foreground">({party.memberCount})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
