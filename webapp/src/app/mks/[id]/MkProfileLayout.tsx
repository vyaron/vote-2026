'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { MK } from '@/types';
import { getMkPhotoPath } from '@/lib/data';
import { getMkSlug } from '@/lib/slugs';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface Props {
  mk: MK;
  children: React.ReactNode;
}

export function MkProfileLayout({ mk, children }: Props) {
  const segment = useSelectedLayoutSegment();
  const basePath = `/mks/${getMkSlug(mk.id, mk.name)}`;

  const tabs = [
    { segment: null,      href: basePath,              label: 'סקירה' },
    { segment: 'bio',     href: `${basePath}/bio`,     label: 'ביוגרפיה' },
    { segment: 'gallery', href: `${basePath}/gallery`, label: `גלריה (${mk.photos?.length || 0})` },
    { segment: 'briefs',  href: `${basePath}/briefs`,  label: 'מסרים' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative">
        <div className="h-48 sm:h-64 md:h-80 relative overflow-hidden bg-gradient-to-b from-primary/20 to-primary/5">
          {mk.images.banner && (
            <Image src={mk.images.banner} alt="" fill className="object-cover opacity-50" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container relative -mt-24 sm:-mt-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col sm:flex-row items-start gap-6"
          >
            <motion.div variants={fadeInUp} className="relative group">
              <motion.div
                className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-lg relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Image
                  src={getMkPhotoPath(mk.id)}
                  alt={mk.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
              </motion.div>
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10" />
            </motion.div>

            <motion.div variants={fadeInUp} className="flex-1 pt-4 sm:pt-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{mk.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {mk.faction}
                </span>
                {mk.position && (
                  <span className="text-muted-foreground text-sm">{mk.position}</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="sticky top-16 z-30 bg-background border-b mt-8">
        <div className="container">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <Link
                key={tab.segment ?? 'overview'}
                href={tab.href}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
                  segment === tab.segment
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="container py-8">
        <motion.div
          key={segment ?? 'overview'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Back link */}
      <div className="container pb-8">
        <Link
          href="/mks"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לכל חברי הכנסת
        </Link>
      </div>
    </div>
  );
}
