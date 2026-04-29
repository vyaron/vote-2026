import { getMaarivFeed } from '@/lib/feed/maariv';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { FeedCard } from '@/components/feed/FeedCard';
import { Newspaper } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'עדכוני חדשות | בחירות 2026',
  description: 'חדשות פוליטיות עדכניות — ישירות לפיד שלך',
};

export default async function FeedPage() {
  const supabase = await createClient();
  const [items, { data: { user } }] = await Promise.all([
    getMaarivFeed(),
    supabase.auth.getUser(),
  ]);

  // Determine if the logged-in user is an MK
  let isMk = false;
  if (user) {
    const service = createServiceClient();
    const { data: mkUser } = await service
      .from('mk_users')
      .select('mk_id')
      .eq('user_id', user.id)
      .maybeSingle();
    isMk = !!mkUser;
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Newspaper className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">עדכוני חדשות</h1>
          <p className="text-sm text-muted-foreground mt-0.5">חדשות פוליטיות עדכניות ממעריב</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-2xl">
          <Newspaper className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>הפיד אינו זמין כרגע. נסה שוב בקרוב.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} isMk={isMk} />
          ))}
        </div>
      )}
    </div>
  );
}
