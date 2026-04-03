import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  VITE_GEMINI_API_KEY: z.string().min(10).optional(),
  VITE_API_URL: z.string().url().default('http://localhost:3001'),
  VITE_APP_ENV: z.enum(['development', 'production']).default('development'),
});

export const env = envSchema.parse(import.meta.env);
