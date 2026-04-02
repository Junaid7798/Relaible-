import winston from "winston";
import path from "path";
import fs from "fs";
import { env } from "./env";

const logDir = env.LOG_DIR;
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "rsci-backend" },
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error", maxsize: 5242880, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log"), maxsize: 5242880, maxFiles: 10 }),
  ],
});

if (env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: "HH:mm:ss" }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    ),
  }));
}
