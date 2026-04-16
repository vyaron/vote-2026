/**
 * Simple logger utility with timestamps
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const levelColors: Record<LogLevel, string> = {
  info: colors.blue,
  warn: colors.yellow,
  error: colors.red,
  success: colors.green,
  debug: colors.gray,
};

const levelIcons: Record<LogLevel, string> = {
  info: 'ℹ',
  warn: '⚠',
  error: '✖',
  success: '✔',
  debug: '🔍',
};

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, context?: string): string {
  const timestamp = getTimestamp();
  const color = levelColors[level];
  const icon = levelIcons[level];
  const contextStr = context ? ` [${context}]` : '';
  
  return `${colors.gray}[${timestamp}]${colors.reset} ${color}${icon} ${level.toUpperCase()}${colors.reset}${contextStr} ${message}`;
}

export const logger = {
  info(message: string, context?: string) {
    console.log(formatMessage('info', message, context));
  },
  
  warn(message: string, context?: string) {
    console.warn(formatMessage('warn', message, context));
  },
  
  error(message: string, context?: string) {
    console.error(formatMessage('error', message, context));
  },
  
  success(message: string, context?: string) {
    console.log(formatMessage('success', message, context));
  },
  
  debug(message: string, context?: string) {
    if (process.env.DEBUG) {
      console.log(formatMessage('debug', message, context));
    }
  },
  
  // Progress indicator for batch operations
  progress(current: number, total: number, item: string) {
    const percent = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    process.stdout.write(`\r${colors.blue}[${bar}]${colors.reset} ${percent}% (${current}/${total}) ${item}`);
    if (current === total) {
      console.log(); // New line at the end
    }
  },
  
  // Section header
  section(title: string) {
    console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.blue}  ${title}${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
  },
};
