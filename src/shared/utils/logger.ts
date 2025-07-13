import { isDevelopment, isProduction } from '@/shared/config/environment';
import { ApplicationError } from '@/shared/types/errors';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4,
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context: Record<string, unknown> | undefined;
    error: Error | undefined;
}

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel;

    private constructor() {
        this.logLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel;
    }

    private formatMessage(entry: LogEntry): string {
        const timestamp = entry.timestamp.toISOString();
        const level = LogLevel[entry.level];
        const context = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
        const error = entry.error ? ` | Error: ${entry.error.message}` : '';

        return `[${timestamp}] ${level}: ${entry.message}${context}${error}`;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            context,
            error,
        };

        const formattedMessage = this.formatMessage(entry);

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(formattedMessage);
                break;
            case LogLevel.INFO:
                console.info(formattedMessage);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(formattedMessage);
                if (error?.stack && isDevelopment) {
                    console.error(error.stack);
                }
                break;
        }

        // In production, you might want to send logs to a service like Sentry
        if (isProduction && level >= LogLevel.ERROR) {
            this.sendToErrorTracking(entry);
        }
    }

    private sendToErrorTracking(entry: LogEntry): void {
        // TODO: Implement error tracking service integration (Sentry, LogRocket, etc.)
        // For now, we'll just log to console in production
        if (entry.error instanceof ApplicationError) {
            console.error('Application Error:', {
                code: entry.error.code,
                message: entry.error.message,
                details: entry.error.details,
                timestamp: entry.error.timestamp,
            });
        }
    }

    public debug(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    public info(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context);
    }

    public warn(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context);
    }

    public error(message: string, error?: Error, context?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, context, error);
    }

    public fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
        this.log(LogLevel.FATAL, message, context, error);
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }
}

export const logger = Logger.getInstance(); 