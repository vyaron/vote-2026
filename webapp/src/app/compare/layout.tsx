import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'השוואת חברי כנסת',
  description: 'כלי להשוואת חברי כנסת - השוו בין חברי כנסת שונים, תפקידים, השכלה ופעילות פרלמנטרית.',
  keywords: ['השוואת ח"כים', 'כנסת ה-25', 'השוואת פוליטיקאים'],
  openGraph: {
    title: 'השוואת חברי כנסת | כנסת 2026',
    description: 'כלי להשוואת חברי כנסת - השוו בין חברי כנסת שונים',
    url: '/compare',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'השוואת חברי כנסת | כנסת 2026',
    description: 'כלי להשוואת חברי כנסת',
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
