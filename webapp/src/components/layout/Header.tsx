'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { NAV_ITEMS, SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { MkUserMenu } from './MkUserMenu';
import type { MkSession } from './MkUserMenu';

interface Props {
  mkSession: MkSession | null;
}

export function Header({ mkSession }: Props) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Image
              src="/israel-logo.png"
              alt="לוגו"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="font-bold text-xl hidden sm:inline-block">
              {SITE_NAME}
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search button - links to MKs page which has search */}
          <Link
            href="/mks"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="חיפוש"
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* Auth: login link or profile menu */}
          {mkSession ? (
            <MkUserMenu mkSession={mkSession} />
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border hover:bg-muted transition-colors"
            >
              כניסת ח&quot;כים
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="תפריט"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t bg-background"
        >
          <div className="container py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile auth */}
            <div className="border-t pt-2 mt-1">
              {mkSession ? (
                <>
                  {mkSession.slug && (
                    <Link
                      href={`/mks/${mkSession.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    >
                      הפרופיל שלי
                    </Link>
                  )}
                  <Link
                    href="/mk/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    הבריפים שלי / לוח הבקרה
                  </Link>
                  {mkSession.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    >
                      ניהול מערכת
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  כניסת ח&quot;כים
                </Link>
              )}
            </div>
          </div>
        </motion.nav>
      )}
    </header>
  );
}
