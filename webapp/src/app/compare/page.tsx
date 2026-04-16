'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, X, Users, Calendar, MapPin, GraduationCap, 
  ArrowLeftRight, ChevronDown, User, Building
} from 'lucide-react';
import type { MK, MkSummary } from '@/types';
import { getPartyColor } from '@/types';
import { getMkById, getMkSummaries, getMkPhotoPath, calculateAge } from '@/lib/data';
import { getMkSlug } from '@/lib/slugs';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// MK Selector Dropdown
function MkSelector({ 
  selectedMk, 
  onSelect, 
  mks,
  label,
  otherSelectedId
}: { 
  selectedMk: MK | null;
  onSelect: (mk: MK | null) => void;
  mks: MkSummary[];
  label: string;
  otherSelectedId: number | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredMks = useMemo(() => {
    return mks.filter(mk => {
      if (mk.id === otherSelectedId) return false;
      if (!search) return true;
      return mk.name.includes(search) || mk.faction.includes(search);
    });
  }, [mks, search, otherSelectedId]);

  const handleSelect = async (mkSummary: MkSummary) => {
    const fullMk = await getMkById(mkSummary.id);
    onSelect(fullMk);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-4 rounded-xl border bg-card text-right flex items-center gap-3 transition-all",
          isOpen ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
        )}
      >
        {selectedMk ? (
          <>
            <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={getMkPhotoPath(selectedMk.id)}
                alt={selectedMk.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{selectedMk.name}</div>
              <div className="text-sm text-muted-foreground truncate">{selectedMk.faction}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="p-1 hover:bg-muted rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 text-muted-foreground">בחר חבר כנסת...</div>
            <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="חיפוש לפי שם או מפלגה..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto">
              {filteredMks.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  לא נמצאו תוצאות
                </div>
              ) : (
                filteredMks.map((mk) => (
                  <button
                    key={mk.id}
                    onClick={() => handleSelect(mk)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-right"
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={getMkPhotoPath(mk.id)}
                        alt={mk.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{mk.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{mk.faction}</div>
                    </div>
                    <div 
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getPartyColor(mk.faction) }}
                    />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Comparison stat row
function ComparisonRow({ 
  label, 
  value1, 
  value2, 
  icon: Icon 
}: { 
  label: string; 
  value1: string | number | null; 
  value2: string | number | null;
  icon: React.ElementType;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b last:border-0">
      <div className="text-center font-medium">{value1 || '-'}</div>
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-center font-medium">{value2 || '-'}</div>
    </div>
  );
}

// MK Card for comparison
function ComparisonCard({ mk }: { mk: MK }) {
  const age = calculateAge(mk.dateOfBirth);
  const partyColor = getPartyColor(mk.faction);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="bg-card rounded-2xl border overflow-hidden"
    >
      {/* Party color bar */}
      <div className="h-2" style={{ backgroundColor: partyColor }} />
      
      <div className="p-6">
        {/* Photo and name */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href={`/mks/${getMkSlug(mk.id, mk.name)}`}>
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 mb-4 hover:scale-105 transition-transform" style={{ borderColor: partyColor }}>
              <Image
                src={getMkPhotoPath(mk.id)}
                alt={mk.name}
                fill
                className="object-cover"
              />
            </div>
          </Link>
          <Link href={`/mks/${getMkSlug(mk.id, mk.name)}`} className="hover:text-primary transition-colors">
            <h3 className="text-xl font-bold">{mk.name}</h3>
          </Link>
          <Link href={`/parties/${mk.faction}`} className="text-muted-foreground hover:text-primary transition-colors">
            {mk.faction}
          </Link>
          {mk.position && (
            <div className="mt-2 text-sm bg-muted px-3 py-1 rounded-full">
              {mk.position.split(' ').slice(0, 4).join(' ')}...
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{age ? `${age} שנים` : '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{mk.residence || '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{mk.education || '-'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ComparePage() {
  const [mks, setMks] = useState<MkSummary[]>([]);
  const [mk1, setMk1] = useState<MK | null>(null);
  const [mk2, setMk2] = useState<MK | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMks() {
      const data = await getMkSummaries();
      setMks(data);
      setLoading(false);
    }
    loadMks();
  }, []);

  const age1 = mk1 ? calculateAge(mk1.dateOfBirth) : null;
  const age2 = mk2 ? calculateAge(mk2.dateOfBirth) : null;

  const swapMks = () => {
    const temp = mk1;
    setMk1(mk2);
    setMk2(temp);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-linear-to-b from-primary/5 to-background">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              ⚖️ השוואת חברי כנסת
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              בחרו שני חברי כנסת להשוואה מקיפה
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Selectors */}
      <section className="py-8">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <MkSelector
              selectedMk={mk1}
              onSelect={setMk1}
              mks={mks}
              label="חבר כנסת ראשון"
              otherSelectedId={mk2?.id || null}
            />
            
            {/* Swap button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button
                onClick={swapMks}
                disabled={!mk1 && !mk2}
                className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="החלף"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </button>
            </div>

            <MkSelector
              selectedMk={mk2}
              onSelect={setMk2}
              mks={mks}
              label="חבר כנסת שני"
              otherSelectedId={mk1?.id || null}
            />
          </div>

          {/* Mobile swap button */}
          <div className="flex justify-center mt-4 md:hidden">
            <button
              onClick={swapMks}
              disabled={!mk1 && !mk2}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowLeftRight className="h-4 w-4" />
              החלף
            </button>
          </div>
        </div>
      </section>

      {/* Comparison View */}
      {(mk1 || mk2) && (
        <section className="py-8">
          <div className="container max-w-4xl">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {mk1 ? (
                <ComparisonCard mk={mk1} />
              ) : (
                <div className="bg-muted/50 rounded-2xl border-2 border-dashed flex items-center justify-center min-h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>בחר חבר כנסת ראשון</p>
                  </div>
                </div>
              )}
              {mk2 ? (
                <ComparisonCard mk={mk2} />
              ) : (
                <div className="bg-muted/50 rounded-2xl border-2 border-dashed flex items-center justify-center min-h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>בחר חבר כנסת שני</p>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed comparison table */}
            {mk1 && mk2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border p-6"
              >
                <h2 className="text-xl font-bold mb-6 text-center">השוואה מפורטת</h2>
                
                <ComparisonRow
                  icon={Calendar}
                  label="גיל"
                  value1={age1 ? `${age1} שנים` : null}
                  value2={age2 ? `${age2} שנים` : null}
                />
                <ComparisonRow
                  icon={Building}
                  label="מפלגה"
                  value1={mk1.faction.trim()}
                  value2={mk2.faction.trim()}
                />
                <ComparisonRow
                  icon={MapPin}
                  label="מגורים"
                  value1={mk1.residence}
                  value2={mk2.residence}
                />
                <ComparisonRow
                  icon={MapPin}
                  label="מקום לידה"
                  value1={mk1.placeOfBirth}
                  value2={mk2.placeOfBirth}
                />
                <ComparisonRow
                  icon={GraduationCap}
                  label="השכלה"
                  value1={mk1.education}
                  value2={mk2.education}
                />
                <ComparisonRow
                  icon={Users}
                  label="מגדר"
                  value1={mk1.gender === 'male' ? 'זכר' : 'נקבה'}
                  value2={mk2.gender === 'male' ? 'זכר' : 'נקבה'}
                />
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!mk1 && !mk2 && !loading && (
        <section className="py-12">
          <div className="container max-w-2xl text-center">
            <div className="bg-muted/30 rounded-2xl p-12">
              <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">בחרו חברי כנסת להשוואה</h2>
              <p className="text-muted-foreground">
                השתמשו בתפריטים למעלה כדי לבחור שני חברי כנסת ולראות השוואה מפורטת ביניהם
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
