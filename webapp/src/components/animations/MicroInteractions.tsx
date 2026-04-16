'use client';

import { motion, HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { ReactNode, useState, MouseEvent, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// RIPPLE BUTTON
// =====================================================

interface RippleButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  rippleColor?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, className, rippleColor = 'rgba(255, 255, 255, 0.4)', onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const shouldReduceMotion = useReducedMotion();

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (!shouldReduceMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
      
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        onClick={handleClick}
        whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none rounded-full animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </motion.button>
    );
  }
);

RippleButton.displayName = 'RippleButton';

// =====================================================
// HOVER CARD (Elevating card effect)
// =====================================================

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  elevation?: 'sm' | 'md' | 'lg';
}

const elevationMap = {
  sm: { y: -2, shadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
  md: { y: -4, shadow: '0 8px 24px rgba(0, 0, 0, 0.12)' },
  lg: { y: -8, shadow: '0 16px 32px rgba(0, 0, 0, 0.15)' },
};

export function HoverCard({ children, className, elevation = 'md' }: HoverCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { y, shadow } = elevationMap[elevation];

  return (
    <motion.div
      className={cn('transition-shadow', className)}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y,
              boxShadow: shadow,
            }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// =====================================================
// MAGNETIC BUTTON (Follows cursor slightly)
// =====================================================

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const shouldReduceMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

// =====================================================
// ANIMATED ICON (Bounce, pulse, wiggle on hover)
// =====================================================

interface AnimatedIconProps {
  children: ReactNode;
  animation?: 'bounce' | 'pulse' | 'wiggle' | 'spin';
  trigger?: 'hover' | 'always';
  className?: string;
}

const iconAnimations = {
  bounce: {
    y: [0, -4, 0],
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 },
  },
  wiggle: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
  spin: {
    rotate: 360,
    transition: { duration: 0.5, ease: 'linear' as const },
  },
};

export function AnimatedIcon({
  children,
  animation = 'bounce',
  trigger = 'hover',
  className,
}: AnimatedIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  if (trigger === 'always') {
    return (
      <motion.span
        className={className}
        animate={iconAnimations[animation]}
        {...(animation === 'spin' ? { repeat: Infinity } : {})}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <motion.span className={className} whileHover={iconAnimations[animation]}>
      {children}
    </motion.span>
  );
}

// =====================================================
// TOOLTIP (Animated tooltip)
// =====================================================

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const positionAnimations = {
  top: { hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } },
  bottom: { hidden: { opacity: 0, y: -4 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: 4 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: -4 }, visible: { opacity: 1, x: 0 } },
};

export function Tooltip({
  children,
  content,
  position = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <motion.div
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={positionAnimations[position]}
        transition={{ duration: 0.15 }}
        className={cn(
          'absolute z-50 px-2 py-1 text-sm bg-foreground text-background rounded-md whitespace-nowrap pointer-events-none',
          positionStyles[position]
        )}
      >
        {content}
      </motion.div>
    </div>
  );
}

// =====================================================
// PRESS SCALE (Simple press feedback)
// =====================================================

interface PressScaleProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  scale?: number;
}

export function PressScale({
  children,
  scale = 0.97,
  className,
  ...props
}: PressScaleProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileTap={shouldReduceMotion ? undefined : { scale }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// =====================================================
// GLOW CARD (Cursor-following glow effect)
// =====================================================

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({
  children,
  className,
  glowColor = 'rgba(59, 130, 246, 0.3)',
}: GlowCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

// =====================================================
// SHAKE (Error feedback animation)
// =====================================================

interface ShakeProps {
  children: ReactNode;
  trigger?: boolean;
  className?: string;
}

export function Shake({ children, trigger, className }: ShakeProps) {
  return (
    <motion.div
      className={className}
      animate={
        trigger
          ? {
              x: [0, -10, 10, -10, 10, -5, 5, 0],
              transition: { duration: 0.5 },
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
}
