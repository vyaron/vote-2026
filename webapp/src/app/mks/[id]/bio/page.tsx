import { notFound } from 'next/navigation';
import { getMkServer } from '@/lib/mk-server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BioPage({ params }: Props) {
  const { id: idOrSlug } = await params;
  const mk = await getMkServer(idOrSlug);
  if (!mk) notFound();

  return (
    <div className="max-w-3xl">
      <div className="bg-card rounded-2xl p-6 md:p-8 border">
        <h2 className="text-2xl font-bold mb-6">ביוגרפיה</h2>
        <div className="prose prose-lg max-w-none">
          {mk.bio?.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
