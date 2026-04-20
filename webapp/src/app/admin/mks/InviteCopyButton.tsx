'use client';

import { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';

interface Props {
  mkId: number;
  email: string;
}

export function InviteCopyButton({ mkId, email }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

  async function handleClick() {
    setState('loading');
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mkId, email }),
    });

    if (!res.ok) { setState('error'); setTimeout(() => setState('idle'), 2000); return; }

    const { link } = await res.json();
    await navigator.clipboard.writeText(link);
    setState('copied');
    setTimeout(() => setState('idle'), 3000);
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
    >
      {state === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
      {state === 'copied' && <Check className="h-3 w-3 text-green-600" />}
      {(state === 'idle' || state === 'error') && <Copy className="h-3 w-3" />}
      {state === 'copied' ? 'הועתק!' : state === 'error' ? 'שגיאה' : 'הזמן'}
    </button>
  );
}
