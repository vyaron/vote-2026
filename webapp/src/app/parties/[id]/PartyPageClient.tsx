'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Users, ArrowRight, Calendar, Building,
  ChevronLeft, User
} from 'lucide-react';
import type { PartyWithMembers, MkSummary } from '@/types';
import { getPartyLogoPath, getMkPhotoPath } from '@/lib/data';
import { getMkSlug } from '@/lib/slugs';
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
      staggerChildren: 0.05,
    },
  },
};

interface PartyPageClientProps {
  party: PartyWithMembers;
}

// MK Card for party page
function MkCard({ mk, partyColor }: { mk: MkSummary; partyColor: string }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link href={`/mks/${getMkSlug(mk.id, mk.name)}`}>
        <motion.div
          className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300"
          whileHover={{ y: -2 }}
        >
          <div className="aspect-[4/5] relative overflow-hidden">
            <Image
              src={getMkPhotoPath(mk.id)}
              alt={mk.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Position badge */}
            {mk.position && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-800 max-w-[80%] truncate">
                {mk.position.split(' ').slice(0, 3).join(' ')}...
              </div>
            )}
            
            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg drop-shadow-lg">
                {mk.name}
              </h3>
            </div>
          </div>
          
          {/* Party color bar */}
          <div 
            className="h-1.5"
            style={{ backgroundColor: partyColor }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function PartyPageClient({ party }: PartyPageClientProps) {
  const [logoError, setLogoError] = useState(false);
  
  // Gender stats
  const maleCount = party.mks.filter(mk => mk.gender === 'male').length;
  const femaleCount = party.mks.filter(mk => mk.gender === 'female').length;
  
  // Parse start date
  const startDate = party.startDate ? new Date(party.startDate) : null;
  const formattedDate = startDate?.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background with party color gradient */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            background: `linear-gradient(135deg, ${party.color} 0%, transparent 70%)` 
          }}
        />
        
        <div className="container relative">
          {/* Back link */}
          <Link 
            href="/parties"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה לכל הסיעות
          </Link>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col md:flex-row items-start gap-8"
          >
            {/* Party logo */}
            <motion.div 
              variants={fadeInUp}
              className="relative h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-slate-800 overflow-hidden flex-shrink-0"
            >
              {!logoError ? (
                <Image
                  src={getPartyLogoPath(party.id)}
                  alt={party.name}
                  fill
                  className="object-contain p-4"
                  onError={() => setLogoError(true)}
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-700">
                  <Building className="h-16 w-16 text-slate-400" />
                </div>
              )}
            </motion.div>

            {/* Party info */}
            <motion.div variants={fadeInUp} className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {party.name.trim()}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Member count badge */}
                <div 
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white font-medium"
                  style={{ backgroundColor: party.color }}
                >
                  <Users className="h-5 w-5" />
                  {party.memberCount} חברי כנסת
                </div>
                
                {/* Knesset number */}
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-muted">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  כנסת ה-{party.knessetNum}
                </div>
              </div>

              {/* Additional info */}
              {formattedDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>תחילת כהונה: {formattedDate}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: party.color }}>
                {party.memberCount}
              </div>
              <div className="text-sm text-muted-foreground">חברי כנסת</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{maleCount}</div>
              <div className="text-sm text-muted-foreground">גברים</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{femaleCount}</div>
              <div className="text-sm text-muted-foreground">נשים</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {femaleCount > 0 ? Math.round((femaleCount / party.memberCount) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">ייצוג נשים</div>
            </div>
          </div>
        </div>
      </section>

      {/* Members Grid */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">חברי הסיעה</h2>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {party.mks.map((mk) => (
              <MkCard key={mk.id} mk={mk} partyColor={party.color} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gender breakdown visual */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">פילוח מגדרי</h2>
          
          <div className="bg-card rounded-2xl p-6 border max-w-xl">
            {/* Visual bar */}
            <div className="h-8 rounded-lg overflow-hidden flex mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(maleCount / party.memberCount) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="bg-blue-500 flex items-center justify-center"
              >
                {maleCount > 2 && (
                  <span className="text-white text-sm font-medium">{maleCount}</span>
                )}
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(femaleCount / party.memberCount) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-pink-500 flex items-center justify-center"
              >
                {femaleCount > 2 && (
                  <span className="text-white text-sm font-medium">{femaleCount}</span>
                )}
              </motion.div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">גברים ({maleCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-pink-500" />
                <span className="text-sm">נשים ({femaleCount})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA to browse other parties */}
      <section className="py-12">
        <div className="container">
          <div className="bg-card rounded-2xl p-8 border text-center">
            <h2 className="text-2xl font-bold mb-4">רוצים לראות עוד?</h2>
            <p className="text-muted-foreground mb-6">
              צפו בכל הסיעות בכנסת ה-25
            </p>
            <Link
              href="/parties"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              כל הסיעות
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
