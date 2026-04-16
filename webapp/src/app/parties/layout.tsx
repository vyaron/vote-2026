import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'סיעות',
  description: 'כל הסיעות בכנסת ה-25 - מידע על כל מפלגה, מספר המנדטים וחברי הכנסת. סקירה מקיפה של הקואליציה והאופוזיציה.',
  keywords: ['סיעות הכנסת', 'מפלגות ישראל', 'כנסת ה-25', 'קואליציה', 'אופוזיציה'],
  openGraph: {
    title: 'סיעות הכנסת | כנסת 2026',
    description: 'כל הסיעות בכנסת ה-25 - מידע על כל מפלגה ומספר המנדטים',
    url: '/parties',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'סיעות הכנסת | כנסת 2026',
    description: 'כל הסיעות בכנסת ה-25',
  },
};

export default function PartiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
