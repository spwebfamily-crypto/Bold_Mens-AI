import { createLogger, format, transports } from 'winston';

const level = process.env.LOG_LEVEL ?? 'info';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = createLogger({
  level,
  format: isProduction
    ? format.combine(format.timestamp(), format.errors({ stack: true }), format.json())
    : format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level: logLevel, message, ...meta }) => {
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${logLevel}] ${message}${extra}`;
        }),
      ),
  transports: [new transports.Console()],
});
