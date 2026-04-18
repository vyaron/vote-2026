import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'אודות',
  description: 'אודות פרויקט כנסת 2026 - מידע שקוף ונגיש על נבחרי הציבור בישראל. מקורות המידע, המטרות והכלים שהאתר מציע.',
  keywords: ['אודות', 'כנסת 2026', 'דמוקרטיה', 'שקיפות', 'ישראל'],
  openGraph: {
    title: 'אודות | כנסת 2026',
    description: 'מידע שקוף ונגיש על נבחרי הציבור בישראל',
    url: '/about',
    type: 'website',
    images: [
      {
        url: '/Knesset1.png',
        width: 1200,
        height: 630,
        alt: 'כנסת 2026',
      },
    ],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
