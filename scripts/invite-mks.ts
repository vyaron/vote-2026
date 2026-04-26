/**
 * Bulk invite script — reads MK JSON files, creates Supabase Auth users,
 * sends branded invite emails.
 *
 * Usage:
 *   cd elect-2026
 *   npx tsx scripts/invite-mks.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SITE_URL
 *
 * Reads from: webapp/public/data/mks/*.json
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

if (!SUPABASE_URL || !SERVICE_KEY || !SITE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or NEXT_PUBLIC_SITE_URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface MK {
  id: number;
  name: string;
  faction: string;
  email?: string | null;
}

async function main() {
  const dataDir = join(__dirname, '../webapp/public/data/mks');
  const activeIds: number[] = JSON.parse(
    readFileSync(join(__dirname, '../webapp/public/data/active-mk-ids.json'), 'utf-8'),
  );

  // Load all active MKs
  const mks: MK[] = activeIds
    .map((id) => {
      try {
        return JSON.parse(readFileSync(join(dataDir, `${id}.json`), 'utf-8')) as MK;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as MK[];

  // Check which mk_ids are already invited
  const { data: existing } = await supabase.from('mk_users').select('mk_id');
  const alreadyInvited = new Set((existing ?? []).map((r: { mk_id: number }) => r.mk_id));

  const toInvite = mks.filter((mk) => !alreadyInvited.has(mk.id) && mk.email);
  const noEmail = mks.filter((mk) => !alreadyInvited.has(mk.id) && !mk.email);

  console.log(`Total active MKs : ${mks.length}`);
  console.log(`Already invited  : ${alreadyInvited.size}`);
  console.log(`To invite        : ${toInvite.length}`);
  console.log(`No email         : ${noEmail.length}`);
  console.log('');

  // Invite MKs with email
  for (const mk of toInvite) {
    process.stdout.write(`Inviting ${mk.name} (${mk.email}) ... `);
    const { error } = await supabase.auth.admin.inviteUserByEmail(mk.email!, {
      redirectTo: `${SITE_URL}/auth/update-password`,
      data: { mk_id: mk.id },
    });

    if (error) {
      console.log(`FAILED — ${error.message}`);
      continue;
    }

    // Register in mk_users
    await supabase.from('mk_users').upsert(
      { mk_id: mk.id, user_id: (await supabase.auth.admin.listUsers()).data.users.find((u) => u.email === mk.email)?.id ?? '', party_id: null },
      { onConflict: 'mk_id' },
    );

    console.log('OK');
  }

  // Report MKs without email
  if (noEmail.length > 0) {
    console.log('\n--- MKs without email (manual invite needed) ---');
    for (const mk of noEmail) {
      console.log(`  ${mk.id}\t${mk.name}\t${mk.faction}`);
    }
    console.log('\nTo generate a manual invite link, use the admin dashboard:');
    console.log(`  ${SITE_URL}/admin/mks?filter=no-email`);
  }

  console.log('\nDone.');
}

main().catch((err) => { console.error(err); process.exit(1); });
