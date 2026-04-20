import { createClient } from '@/lib/supabase/server';
import { getMkServer } from '@/lib/mk-server';
import { getMkSlug } from '@/lib/slugs';
import { Header } from './Header';
import type { MkSession } from './MkUserMenu';

export async function HeaderWrapper() {
  let mkSession: MkSession | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: mkUser } = await supabase
        .from('mk_users')
        .select('mk_id, role')
        .eq('user_id', user.id)
        .single();

      if (mkUser) {
        const mk = await getMkServer(String(mkUser.mk_id));
        mkSession = {
          mk_id: mk?.id ?? mkUser.mk_id,
          name: mk?.name ?? 'מנהל',
          profileImage: mk?.images.profile ?? '',
          slug: mk ? getMkSlug(mk.id, mk.name) : '',
          role: mkUser.role,
        };
      }
    }
  } catch {
    // Auth failure — render header without session
  }

  return <Header mkSession={mkSession} />;
}
