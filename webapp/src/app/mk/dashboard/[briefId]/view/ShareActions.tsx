'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { FacebookIcon } from '@/components/icons/SocialIcons';

interface Props {
  facebookShareUrl: string;
  publicBriefUrl: string;
}

export function ShareActions({ facebookShareUrl, publicBriefUrl }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

  async function handleCopy() {
    try {
      setCopyState('copying');
      await navigator.clipboard.writeText(publicBriefUrl);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href={facebookShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border hover:bg-muted transition-colors"
      >
        <FacebookIcon className="h-3.5 w-3.5" />
        שתף בפייסבוק
      </Link>

      <button
        type="button"
        onClick={handleCopy}
        disabled={copyState === 'copying'}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border hover:bg-muted transition-colors disabled:opacity-60"
      >
        {copyState === 'copying' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {copyState === 'copied' && <Check className="h-3.5 w-3.5 text-green-600" />}
        {(copyState === 'idle' || copyState === 'error') && <Copy className="h-3.5 w-3.5" />}
        {copyState === 'copied' ? 'הקישור הועתק' : copyState === 'error' ? 'שגיאה' : 'העתק קישור'}
      </button>
    </div>
  );
}
