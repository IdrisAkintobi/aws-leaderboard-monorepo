interface LogContext {
    requestId?: string | undefined;
    userId?: string | undefined;
    action: string;
    [key: string]: any;
}

export class Logger {
    static info(message: string, context: LogContext = { action: "unknown" }): void {
        console.log(
            JSON.stringify({
                level: "INFO",
                timestamp: new Date().toISOString(),
                message,
                ...context,
            }),
        );
    }

    static error(message: string, error: any, context: LogContext = { action: "unknown" }): void {
        console.error(
            JSON.stringify({
                level: "ERROR",
                timestamp: new Date().toISOString(),
                message,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
                ...context,
            }),
        );
    }

    static warn(message: string, context: LogContext = { action: "unknown" }): void {
        console.warn(
            JSON.stringify({
                level: "WARN",
                timestamp: new Date().toISOString(),
                message,
                ...context,
            }),
        );
    }
}
