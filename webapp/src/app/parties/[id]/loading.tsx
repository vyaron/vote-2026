'use client';

import { Skeleton, MkCardSkeleton } from '@/components/animations';

export default function Loading() {
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section Skeleton */}
      <section className="relative py-16 md:py-24 bg-linear-to-b from-primary/5 to-background overflow-hidden">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Party logo skeleton */}
            <Skeleton className="h-32 w-32 rounded-2xl shrink-0" />
            
            {/* Party info skeleton */}
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-64 rounded-lg" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-6 w-48 rounded-lg" />
              </div>
              <Skeleton variant="text" lines={2} className="max-w-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-4">
                <Skeleton className="h-8 w-16 mx-auto rounded-lg mb-2" />
                <Skeleton className="h-4 w-24 mx-auto rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Members Section Skeleton */}
      <section className="py-12">
        <div className="container">
          <Skeleton className="h-8 w-48 rounded-lg mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <MkCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
