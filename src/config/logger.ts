export interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

type Level = 'INFO' | 'WARN' | 'ERROR';

function format(level: Level, scope: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `${timestamp}  ${level.padEnd(5)} --- [${scope}] : ${message}`;
}

export function createLogger(scope: string): Logger {
  return {
    info: (message, ...args) =>
      console.log(format('INFO', scope, message), ...args),
    warn: (message, ...args) =>
      console.warn(format('WARN', scope, message), ...args),
    error: (message, ...args) =>
      console.error(format('ERROR', scope, message), ...args),
  };
}
