import Link from 'next/link';
import { Mail, Phone, Globe, MapPin, Calendar, GraduationCap, Shield, Languages } from 'lucide-react';
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from '@/components/icons/SocialIcons';
import { getMkServer } from '@/lib/mk-server';
import { getMkSlug } from '@/lib/slugs';
import { calculateAge } from '@/lib/data';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
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
        'p-3 rounded-xl transition-colors flex items-center gap-2',
        colorClass || 'bg-muted hover:bg-primary hover:text-primary-foreground',
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

export default async function OverviewPage({ params }: Props) {
  const { id: idOrSlug } = await params;
  const mk = await getMkServer(idOrSlug);
  if (!mk) notFound();

  const age = calculateAge(mk.dateOfBirth);
  const basePath = `/mks/${getMkSlug(mk.id, mk.name)}`;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Main info */}
      <div className="md:col-span-2 space-y-8">
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

        {mk.bio && (
          <div className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-bold mb-4">אודות</h2>
            <p className="text-muted-foreground leading-relaxed line-clamp-6">{mk.bio}</p>
            <Link
              href={`${basePath}/bio`}
              className="mt-4 inline-block text-primary font-medium hover:underline"
            >
              קרא עוד
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
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

        {(mk.socialLinks.facebook || mk.socialLinks.twitter || mk.socialLinks.instagram || mk.socialLinks.youtube || mk.socialLinks.website) && (
          <div className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-bold mb-4">רשתות חברתיות</h2>
            <div className="flex flex-wrap gap-2">
              <SocialLink href={mk.socialLinks.facebook} icon={FacebookIcon} label="Facebook" colorClass="bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white" />
              <SocialLink href={mk.socialLinks.twitter} icon={TwitterIcon} label="X" colorClass="bg-black/10 text-black dark:text-white hover:bg-black hover:text-white" />
              <SocialLink href={mk.socialLinks.instagram} icon={InstagramIcon} label="Instagram" colorClass="bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white" />
              <SocialLink href={mk.socialLinks.youtube} icon={YoutubeIcon} label="YouTube" colorClass="bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white" />
              <SocialLink href={mk.socialLinks.website} icon={Globe} label="אתר אישי" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
