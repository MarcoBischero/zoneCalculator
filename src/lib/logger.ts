/**
 * Logging utility for ZoneCalculatorPRO
 * Provides environment-aware logging with different levels
 */

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    [key: string]: any;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
    /**
     * Debug logs - only in development
     */
    debug: (message: string, context?: LogContext) => {
        if (isDev && !isTest) {
            console.log(formatMessage('debug', message, context));
        }
    },

    /**
     * Info logs - always logged
     */
    info: (message: string, context?: LogContext) => {
        if (!isTest) {
            console.log(formatMessage('info', message, context));
        }
    },

    /**
     * Warning logs - always logged
     */
    warn: (message: string, context?: LogContext) => {
        if (!isTest) {
            console.warn(formatMessage('warn', message, context));
        }
    },

    /**
     * Error logs - always logged
     */
    error: (message: string, error?: Error | unknown, context?: LogContext) => {
        const errorContext = {
            ...context,
            ...(error instanceof Error ? {
                errorMessage: error.message,
                errorStack: error.stack
            } : { error })
        };
        console.error(formatMessage('error', message, errorContext));
    },
};
