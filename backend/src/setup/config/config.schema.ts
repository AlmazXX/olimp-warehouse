import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  TRANSACTION_PROCESSING_TIMEOUT_MS: z.coerce
    .number()
    .min(1)
    .default(30 * 60 * 1000),
});

const configSchema = envSchema.transform((env) => ({
  port: env.PORT,
  postgres: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    db: env.POSTGRES_DB,
  },
  transactions: {
    processingTimeoutMs: env.TRANSACTION_PROCESSING_TIMEOUT_MS,
  },
}));

export const loadConfig = (env: Record<string, unknown> = process.env) => {
  const result = configSchema.safeParse(env);
  if (!result.success) throw new Error(`Config validation failed: ${result.error.message}`);

  return result.data;
};

export type AppConfig = z.infer<typeof configSchema>;
