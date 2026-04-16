'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// =====================================================
// DEFAULT ERROR FALLBACK
// =====================================================

interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mx-auto mb-6 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center"
        >
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-2"
        >
          אופס! משהו השתבש
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-6"
        >
          {error?.message || 'אירעה שגיאה בלתי צפויה. אנא נסו שוב.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              נסו שוב
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors"
          >
            <Home className="h-4 w-4" />
            חזרה לדף הבית
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// =====================================================
// SUSPENSE ERROR FALLBACK (for use with Suspense)
// =====================================================

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <DefaultErrorFallback error={error} onReset={resetErrorBoundary} />
  );
}

// =====================================================
// NOT FOUND FALLBACK
// =====================================================

interface NotFoundFallbackProps {
  title?: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
}

export function NotFoundFallback({
  title = 'הדף לא נמצא',
  description = 'הדף שחיפשתם לא קיים או הוסר.',
  backLink = '/',
  backLabel = 'חזרה לדף הבית',
}: NotFoundFallbackProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="text-8xl font-bold text-muted-foreground/20 mb-4"
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-2"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-6"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            {backLabel}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// =====================================================
// EMPTY STATE FALLBACK
// =====================================================

interface EmptyStateFallbackProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyStateFallback({
  title = 'אין תוצאות',
  description = 'לא נמצאו פריטים התואמים את החיפוש שלך.',
  icon,
  action,
}: EmptyStateFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </motion.div>
  );
}

// =====================================================
// OFFLINE FALLBACK
// =====================================================

export function OfflineFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="mx-auto mb-6 text-6xl"
        >
          📡
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">אין חיבור לאינטרנט</h2>
        <p className="text-muted-foreground mb-6">
          נראה שאינכם מחוברים לאינטרנט. בדקו את החיבור ונסו שוב.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          נסו שוב
        </button>
      </motion.div>
    </div>
  );
}
