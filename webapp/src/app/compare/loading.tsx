'use client';

import { Skeleton } from '@/components/animations';

export default function Loading() {
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header Skeleton */}
      <section className="relative py-12 md:py-20 bg-linear-to-b from-primary/5 to-background">
        <div className="container">
          <Skeleton className="h-12 w-64 rounded-lg mb-4 mx-auto" />
          <Skeleton className="h-6 w-96 rounded-lg mx-auto" />
        </div>
      </section>

      {/* Selectors Skeleton */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison View Skeleton */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {/* MK 1 */}
            <div className="bg-card rounded-2xl border p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={80} height={80} />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* MK 2 */}
            <div className="bg-card rounded-2xl border p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={80} height={80} />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
