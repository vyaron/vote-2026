'use client';

import { motion } from 'framer-motion';
import { 
  MkCardSkeleton, 
  StatsCardSkeleton,
  Skeleton 
} from '@/components/animations';

export default function Loading() {
  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-linear-to-b from-primary/5 to-background">
        <div className="container relative z-10 py-20">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-16 w-3/4 mx-auto rounded-lg" />
            <Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
            <div className="flex items-center justify-center gap-4 pt-4">
              <Skeleton className="h-14 w-40 rounded-full" />
              <Skeleton className="h-14 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured MKs Section Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-5 w-64 rounded-lg" />
            </div>
            <Skeleton className="hidden sm:block h-5 w-28 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <MkCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
