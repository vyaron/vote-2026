'use client';

import { motion, useInView, useAnimation } from 'framer-motion';
import { useRef, useEffect, ReactNode } from 'react';

// Custom ease curve
const customEase = [0.22, 1, 0.36, 1] as const;

// Preset animation variants
export const animationVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
} as const;

export type AnimationVariantName = keyof typeof animationVariants;

interface FadeInViewProps {
  children: ReactNode;
  variant?: AnimationVariantName;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  threshold?: number;
}

/**
 * Animates children when they enter the viewport
 */
export function FadeInView({
  children,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.5,
  once = true,
  className,
  threshold = 0.1,
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={animationVariants[variant]}
      transition={{
        duration,
        delay,
        ease: customEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

/**
 * Container that staggers animation of children
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  variant?: AnimationVariantName;
  className?: string;
}

/**
 * Child item for StaggerContainer
 */
export function StaggerItem({
  children,
  variant = 'fadeInUp',
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={animationVariants[variant]}
      transition={{ duration: 0.5, ease: customEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

/**
 * Creates a parallax scrolling effect
 */
export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ willChange: 'transform' }}
      initial={{ y: 0 }}
      whileInView={{ y: `${speed * -20}px` }}
      transition={{ type: 'tween', ease: 'linear' }}
      viewport={{ once: false }}
    >
      {children}
    </motion.div>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * Animated counter that counts up when in view
 */
export function CountUp({
  end,
  duration = 2,
  delay = 0,
  suffix = '',
  prefix = '',
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView && ref.current) {
      const element = ref.current;
      const startTime = performance.now();
      const delayMs = delay * 1000;
      const durationMs = duration * 1000;
      
      let rafId: number;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed < delayMs) {
          element.textContent = `${prefix}0${suffix}`;
          rafId = requestAnimationFrame(animate);
          return;
        }
        
        const progress = Math.min((elapsed - delayMs) / durationMs, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * end);
        
        element.textContent = `${prefix}${current.toLocaleString('he-IL')}${suffix}`;
        
        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        }
      };
      
      rafId = requestAnimationFrame(animate);
      
      return () => cancelAnimationFrame(rafId);
    }
  }, [isInView, end, duration, delay, suffix, prefix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

interface TextRevealProps {
  text: string;
  delay?: number;
  className?: string;
}

/**
 * Reveals text character by character (or word by word)
 */
export function TextReveal({ text, delay = 0, className }: TextRevealProps) {
  const words = text.split(' ');
  
  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + i * 0.1,
            ease: customEase,
          }}
          className="inline-block ml-1 rtl:mr-1 rtl:ml-0"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

/**
 * Animated progress bar
 */
export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percentage = (value / max) * 100;

  return (
    <div ref={ref} className={`h-2 bg-muted rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full bg-primary rounded-full ${barClassName}`}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
        transition={{ duration: 1, ease: customEase, delay: 0.2 }}
      />
    </div>
  );
}
