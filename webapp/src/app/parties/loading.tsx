'use client';

import { PartyCardSkeleton, Skeleton } from '@/components/animations';

export default function Loading() {
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section Skeleton */}
      <section className="relative py-16 md:py-24 bg-linear-to-b from-primary/5 to-background overflow-hidden">
        <div className="container">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-14 w-64 rounded-lg" />
            <Skeleton className="h-6 w-96 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Parties Grid Skeleton */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <PartyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
