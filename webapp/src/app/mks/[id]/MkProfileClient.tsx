'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Mail, Phone, Globe,
  MapPin, Calendar, GraduationCap, Shield, Languages, ArrowRight,
  X
} from 'lucide-react';
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from '@/components/icons/SocialIcons';
import type { MK } from '@/types';
import { getMkPhotoPath, calculateAge } from '@/lib/data';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface MkProfileClientProps {
  mk: MK;
}

function InfoItem({ icon: Icon, label, value }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | null | undefined;
}) {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-muted rounded-lg">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon: Icon, label, colorClass }: { 
  href: string | null; 
  icon: React.ElementType;
  label: string;
  colorClass?: string;
}) {
  if (!href) return null;
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "p-3 rounded-xl transition-colors flex items-center gap-2",
        colorClass || "bg-muted hover:bg-primary hover:text-primary-foreground"
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

export function MkProfileClient({ mk }: MkProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bio' | 'gallery'>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  
  const age = calculateAge(mk.dateOfBirth);
  
  const tabs = [
    { id: 'overview', label: 'סקירה' },
    { id: 'bio', label: 'ביוגרפיה' },
    { id: 'gallery', label: `גלריה (${mk.photos?.length || 0})` },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 sm:h-64 md:h-80 relative overflow-hidden bg-gradient-to-b from-primary/20 to-primary/5">
          {mk.images.banner && (
            <Image
              src={mk.images.banner}
              alt=""
              fill
              className="object-cover opacity-50"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Profile info overlay */}
        <div className="container relative -mt-24 sm:-mt-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col sm:flex-row items-start gap-6"
          >
            {/* Profile photo */}
            <motion.div
              variants={fadeInUp}
              className="relative group"
            >
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
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
              </motion.div>
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10" />
            </motion.div>

            {/* Name and title */}
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

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-30 bg-background border-b mt-8">
        <div className="container">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main info */}
              <div className="md:col-span-2 space-y-8">
                {/* Quick info */}
                <div className="bg-card rounded-2xl p-6 border">
                  <h2 className="text-xl font-bold mb-4">מידע אישי</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InfoItem 
                      icon={Calendar} 
                      label="תאריך לידה" 
                      value={age ? `${mk.dateOfBirth?.split(',')[1]?.trim()} (בן ${age})` : mk.dateOfBirth}
                    />
                    <InfoItem icon={MapPin} label="מקום מגורים" value={mk.residence} />
                    <InfoItem icon={MapPin} label="מקום לידה" value={mk.placeOfBirth} />
                    <InfoItem icon={Calendar} label="שנת עלייה" value={mk.immigrationYear} />
                    <InfoItem icon={GraduationCap} label="השכלה" value={mk.education} />
                    <InfoItem icon={Shield} label="שירות צבאי" value={mk.militaryService} />
                    <InfoItem 
                      icon={Languages} 
                      label="שפות" 
                      value={mk.languages?.length > 0 ? mk.languages.join(', ') : null}
                    />
                  </div>
                </div>

                {/* Bio excerpt */}
                {mk.bio && (
                  <div className="bg-card rounded-2xl p-6 border">
                    <h2 className="text-xl font-bold mb-4">אודות</h2>
                    <p className="text-muted-foreground leading-relaxed line-clamp-6">
                      {mk.bio}
                    </p>
                    <button
                      onClick={() => setActiveTab('bio')}
                      className="mt-4 text-primary font-medium hover:underline"
                    >
                      קרא עוד
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact */}
                <div className="bg-card rounded-2xl p-6 border">
                  <h2 className="text-xl font-bold mb-4">יצירת קשר</h2>
                  <div className="space-y-3">
                    {mk.email && (
                      <a
                        href={`mailto:${mk.email}`}
                        className="flex items-center gap-3 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                      >
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm truncate">{mk.email}</span>
                      </a>
                    )}
                    {mk.workPhone && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{mk.workPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social links */}
                {(mk.socialLinks.facebook || mk.socialLinks.twitter || mk.socialLinks.instagram || mk.socialLinks.youtube || mk.socialLinks.website) && (
                  <div className="bg-card rounded-2xl p-6 border">
                    <h2 className="text-xl font-bold mb-4">רשתות חברתיות</h2>
                    <div className="flex flex-wrap gap-2">
                      <SocialLink 
                        href={mk.socialLinks.facebook} 
                        icon={FacebookIcon} 
                        label="Facebook" 
                        colorClass="bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                      />
                      <SocialLink 
                        href={mk.socialLinks.twitter} 
                        icon={TwitterIcon} 
                        label="X" 
                        colorClass="bg-black/10 text-black dark:text-white hover:bg-black hover:text-white"
                      />
                      <SocialLink 
                        href={mk.socialLinks.instagram} 
                        icon={InstagramIcon} 
                        label="Instagram" 
                        colorClass="bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white"
                      />
                      <SocialLink 
                        href={mk.socialLinks.youtube} 
                        icon={YoutubeIcon} 
                        label="YouTube" 
                        colorClass="bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white"
                      />
                      <SocialLink 
                        href={mk.socialLinks.website} 
                        icon={Globe} 
                        label="אתר אישי" 
                        colorClass="bg-muted hover:bg-primary hover:text-primary-foreground"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bio Tab */}
          {activeTab === 'bio' && (
            <div className="max-w-3xl">
              <div className="bg-card rounded-2xl p-6 md:p-8 border">
                <h2 className="text-2xl font-bold mb-6">ביוגרפיה</h2>
                <div className="prose prose-lg max-w-none">
                  {mk.bio?.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              {mk.photos && mk.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mk.photos.map((photo, index) => (
                    <motion.button
                      key={photo.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedPhoto(index)}
                      className="aspect-square relative rounded-xl overflow-hidden group"
                    >
                      <Image
                        src={`/data/${photo.localPath}`}
                        alt={photo.title || mk.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  אין תמונות בגלריה
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Lightbox */}
      {selectedPhoto !== null && mk.photos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
            <Image
              src={`/data/${mk.photos[selectedPhoto].localPath}`}
              alt={mk.photos[selectedPhoto].title || mk.name}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {mk.photos[selectedPhoto].title && (
            <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm">
              {mk.photos[selectedPhoto].title}
            </div>
          )}
        </motion.div>
      )}

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
