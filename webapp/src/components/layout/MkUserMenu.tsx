'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, LayoutDashboard, FileText, User } from 'lucide-react';
import { signOut } from '@/app/auth/actions';
import { cn } from '@/lib/utils';

export interface MkSession {
  mk_id: number;
  name: string;
  profileImage: string;
  slug: string;
}

interface Props {
  mkSession: MkSession;
}

export function MkUserMenu({ mkSession }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all focus-visible:outline-none focus-visible:ring-primary"
        aria-label="תפריט משתמש"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Image
          src={mkSession.profileImage}
          alt={mkSession.name}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover"
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute left-0 top-full mt-2 w-52 rounded-xl border bg-background shadow-lg z-50',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}
        >
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold truncate">{mkSession.name}</p>
          </div>
          <div className="py-1">
            <Link
              href={`/mks/${mkSession.slug}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 shrink-0" />
              הפרופיל שלי
            </Link>
            <Link
              href="/mk/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0" />
              הבריפים שלי
            </Link>
            <Link
              href="/mk/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              לוח הבקרה
            </Link>
          </div>
          <div className="border-t py-1">
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                התנתקות
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
