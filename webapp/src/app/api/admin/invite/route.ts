import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  // Verify the caller is an admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: mkUser } = await supabase
    .from('mk_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!mkUser || mkUser.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { mkId, email } = await request.json() as { mkId: number; email: string };
  if (!email) return NextResponse.json({ error: 'missing email' }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo: `${SITE_URL}/auth/update-password`,
      data: { mk_id: mkId },
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ link: data.properties.action_link });
}
