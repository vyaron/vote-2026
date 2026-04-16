import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'חברי כנסת',
  description: 'רשימת כל חברי הכנסת ה-25 הנוכחיים - 120 חברי כנסת מכל הסיעות. חיפוש, סינון ומידע מפורט על כל חבר כנסת.',
  keywords: ['חברי כנסת', 'כנסת ה-25', 'רשימת ח"כים', 'חברי פרלמנט ישראל'],
  openGraph: {
    title: 'חברי כנסת | כנסת 2026',
    description: 'רשימת כל חברי הכנסת ה-25 הנוכחיים - 120 חברי כנסת מכל הסיעות',
    url: '/mks',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'חברי כנסת | כנסת 2026',
    description: 'רשימת כל חברי הכנסת ה-25 הנוכחיים',
  },
};

export default function MksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
