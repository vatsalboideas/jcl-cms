type LogLevel = 'log' | 'info' | 'warn' | 'error'

const formatArgs = (level: LogLevel, args: unknown[]): unknown[] => {
  const timestamp = new Date().toISOString()
  return [`[${timestamp}]`, ...args]
}

const createLoggerMethod =
  (level: LogLevel) =>
  (...args: unknown[]) => {
    const method = console[level] ?? console.log
    method(...formatArgs(level, args))
  }

export const logger = {
  log: createLoggerMethod('log'),
  info: createLoggerMethod('info'),
  warn: createLoggerMethod('warn'),
  error: createLoggerMethod('error'),
}

export const createScopedLogger = (scope: string) => ({
  log: (...args: unknown[]) => logger.log(`[${scope}]`, ...args),
  info: (...args: unknown[]) => logger.info(`[${scope}]`, ...args),
  warn: (...args: unknown[]) => logger.warn(`[${scope}]`, ...args),
  error: (...args: unknown[]) => logger.error(`[${scope}]`, ...args),
})

export default logger

