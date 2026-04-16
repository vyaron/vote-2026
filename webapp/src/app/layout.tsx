import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { ErrorBoundary } from "@/components/animations";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['כנסת', 'חברי כנסת', 'ישראל', 'פוליטיקה', 'מפלגות', 'בחירות'],
  authors: [{ name: 'Knesset 2026' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'he_IL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Assistant:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </body>
    </html>
  );
}
