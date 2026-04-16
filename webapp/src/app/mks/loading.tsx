'use client';

import { MkCardSkeleton, Skeleton } from '@/components/animations';

export default function Loading() {
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header Skeleton */}
      <div className="bg-linear-to-b from-primary/5 to-background py-12">
        <div className="container">
          <Skeleton className="h-10 w-48 rounded-lg mb-2" />
          <Skeleton className="h-5 w-32 rounded-lg" />
        </div>
      </div>

      {/* Filters Bar Skeleton */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="flex-1 max-w-md h-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg md:hidden" />
            <Skeleton className="hidden md:block h-10 w-32 rounded-lg" />
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="container py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <MkCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
