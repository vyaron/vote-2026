'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Building, Vote, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MkSummary } from '@/types';
import { getMkPhotoPath } from '@/lib/data';
import { getMkSlug } from '@/lib/slugs';
import { TOTAL_MKS } from '@/lib/constants';

// Animation variants
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

// Stat card component
function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  value: number | string; 
  label: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-card rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="text-3xl font-bold">{displayValue}</div>
          <div className="text-muted-foreground text-sm">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

// MK Card component
function MkCard({ mk }: { mk: MkSummary }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4, scale: 1.02 }}
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

export default function HomePage() {
  const [mks, setMks] = useState<MkSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/data/active-mk-ids.json');
        const ids: number[] = await res.json();
        
        // Load first 8 MKs for featured section
        const mkPromises = ids.slice(0, 8).map(async (id) => {
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
    
    loadData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container relative z-10 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo with animations */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center mb-8"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 20,
                  delay: 0.2 
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
                className="relative"
              >
                <Image
                  src="/israel-logo.png"
                  alt="לוגו ישראל"
                  width={120}
                  height={120}
                  className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain drop-shadow-lg"
                  priority
                />
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-primary">בחירות</span>{' '}
              2026
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="text-2xl sm:text-3xl md:text-4xl font-medium text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              לאן ישראל הולכת?
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/mks"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/90 transition-colors group"
              >
                צפו בכל החברים
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-medium text-lg hover:bg-secondary/80 transition-colors"
              >
                <Search className="h-5 w-5" />
                חיפוש
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard icon={Users} value={120} label="חברי כנסת" delay={0} />
            <StatCard icon={Building} value={14} label="מפלגות" delay={200} />
            <StatCard icon={Vote} value={378} label="ועדות" delay={400} />
            <StatCard icon={Users} value={2550} label="תמונות" delay={600} />
          </motion.div>
        </div>
      </section>

      {/* Featured MKs Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">חברי כנסת</h2>
                <p className="text-muted-foreground">
                  הכירו את נציגי העם בכנסת ה-25
                </p>
              </div>
              <Link
                href="/mks"
                className="hidden sm:inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                לכל החברים
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-2xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {mks.map((mk) => (
                  <MkCard key={mk.id} mk={mk} />
                ))}
              </motion.div>
            )}

            <motion.div variants={fadeInUp} className="mt-8 text-center sm:hidden">
              <Link
                href="/mks"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                לכל החברים
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              השוו בין חברי כנסת
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-primary-foreground/80 mb-8">
              כלי ההשוואה שלנו מאפשר לכם לראות את ההבדלים והדמיון בין נבחרי הציבור
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-medium text-lg hover:bg-white/90 transition-colors"
              >
                התחילו להשוות
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
