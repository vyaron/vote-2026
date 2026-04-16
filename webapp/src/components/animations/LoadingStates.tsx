'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// =====================================================
// SKELETON (Shimmer loading placeholder)
// =====================================================

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted';
  
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const style = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'circular' ? width : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses.text)}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
              height: height ?? 16,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// =====================================================
// MK CARD SKELETON
// =====================================================

export function MkCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border">
      <Skeleton className="aspect-3/4" />
      <div className="p-4 space-y-2">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" height={12} />
      </div>
    </div>
  );
}

// =====================================================
// MK LIST ITEM SKELETON
// =====================================================

export function MkListSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  );
}

// =====================================================
// PARTY CARD SKELETON
// =====================================================

export function PartyCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <Skeleton className="h-2" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton variant="rectangular" width={64} height={64} className="rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-3 rtl:space-x-reverse">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="circular" width={40} height={40} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PROFILE SKELETON
// =====================================================

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Banner skeleton */}
      <Skeleton className="h-48 sm:h-64 md:h-80" />
      
      {/* Profile info */}
      <div className="container relative -mt-24 sm:-mt-32">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Skeleton 
            variant="rectangular" 
            width={160} 
            height={160} 
            className="rounded-2xl border-4 border-background"
          />
          <div className="flex-1 pt-4 sm:pt-8 space-y-3">
            <Skeleton variant="text" width="40%" height={32} />
            <div className="flex gap-3">
              <Skeleton variant="rectangular" width={100} height={28} className="rounded-full" />
              <Skeleton variant="text" width="30%" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="container mt-8">
        <div className="flex gap-2 py-2 border-b">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" width={80} height={36} className="rounded-lg" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card rounded-2xl p-6 border space-y-4">
              <Skeleton variant="text" width="30%" height={24} />
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
                    <div className="space-y-1 flex-1">
                      <Skeleton variant="text" width="40%" height={12} />
                      <Skeleton variant="text" width="60%" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border space-y-4">
              <Skeleton variant="text" width="50%" height={24} />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// SPINNER (Animated loading spinner)
// =====================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <motion.div
      className={cn(
        'border-2 border-muted border-t-primary rounded-full',
        spinnerSizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// =====================================================
// DOTS LOADER (Bouncing dots)
// =====================================================

interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dotSizes = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-3 w-3',
};

export function DotsLoader({ size = 'md', className }: DotsLoaderProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('bg-primary rounded-full', dotSizes[size])}
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// =====================================================
// PULSE LOADER (Pulsing circle)
// =====================================================

interface PulseLoaderProps {
  size?: number;
  className?: string;
}

export function PulseLoader({ size = 48, className }: PulseLoaderProps) {
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 bg-primary/30 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-2 bg-primary rounded-full" />
    </div>
  );
}

// =====================================================
// PROGRESS LINE (Linear progress indicator)
// =====================================================

interface ProgressLineProps {
  className?: string;
}

export function ProgressLine({ className }: ProgressLineProps) {
  return (
    <div className={cn('h-1 w-full bg-muted overflow-hidden rounded-full', className)}>
      <motion.div
        className="h-full bg-primary"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ width: '30%' }}
      />
    </div>
  );
}

// =====================================================
// FULL PAGE LOADER
// =====================================================

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message = 'טוען...' }: FullPageLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
}

// =====================================================
// STATS CARD SKELETON
// =====================================================

export function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 border">
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
        <div className="space-y-2">
          <Skeleton variant="text" width={60} height={28} />
          <Skeleton variant="text" width={80} height={14} />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// GALLERY SKELETON
// =====================================================

export function GallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  );
}
