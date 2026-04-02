import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (value === undefined) throw new Error();
  return value;
}

export const env = {
  NODE_ENV: requireEnv("NODE_ENV", "development"),
  PORT: parseInt(requireEnv("PORT", "3001"), 10),
  API_PREFIX: requireEnv("API_PREFIX", "/api/v1"),
  DB_HOST: requireEnv("DB_HOST", "localhost"),
  DB_PORT: parseInt(requireEnv("DB_PORT", "5432"), 10),
  DB_NAME: requireEnv("DB_NAME", "rsci_db"),
  DB_USER: requireEnv("DB_USER", "postgres"),
  DB_PASSWORD: requireEnv("DB_PASSWORD", ""),
  DB_SSL: requireEnv("DB_SSL", "false") === "true",
  DB_POOL_MIN: parseInt(requireEnv("DB_POOL_MIN", "2"), 10),
  DB_POOL_MAX: parseInt(requireEnv("DB_POOL_MAX", "20"), 10),
  JWT_SECRET: requireEnv("JWT_SECRET", ""),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET", ""),
  JWT_EXPIRES_IN: requireEnv("JWT_EXPIRES_IN", "24h"),
  JWT_REFRESH_EXPIRES_IN: requireEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  CORS_ORIGIN: requireEnv("CORS_ORIGIN", "*").split(","),
  RATE_LIMIT_WINDOW_MS: parseInt(requireEnv("RATE_LIMIT_WINDOW_MS", "900000"), 10),
  RATE_LIMIT_MAX: parseInt(requireEnv("RATE_LIMIT_MAX", "100"), 10),
  LOG_LEVEL: requireEnv("LOG_LEVEL", "info"),
  LOG_DIR: requireEnv("LOG_DIR", "./logs"),
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  UPLOAD_DIR: requireEnv("UPLOAD_DIR", "./uploads"),
  MAX_FILE_SIZE_MB: parseInt(requireEnv("MAX_FILE_SIZE_MB", "10"), 10),
  FINANCIAL_YEAR_START_MONTH: parseInt(requireEnv("FINANCIAL_YEAR_START_MONTH", "4"), 10),
  GST_ENABLED: requireEnv("GST_ENABLED", "true") === "true",
} as const;
