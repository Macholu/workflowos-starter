import pino, { type Logger } from 'pino';

export function createLogger(level = 'info', bindings: Record<string, string> = {}): Logger {
  return pino({
    level,
    base: {
      service: 'workflowos',
      ...bindings
    },
    timestamp: pino.stdTimeFunctions.isoTime
  });
}
