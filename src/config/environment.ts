import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  PORT: z.string().default("3000").transform(Number),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_PATH: z.string().default("./medagenda.db"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7200"),
  CORS_ORIGIN: z.string().default("http://localhost:8081"),
  BCRYPT_ROUNDS: z.string().default("10").transform(Number),
});

export type Environment = z.infer<typeof environmentSchema>;

const parseEnvironment = (): Environment => {
  const result = environmentSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Environment validation error:", result.error.format());
    throw new Error("Invalid environment configuration");
  }

  return result.data;
};

export const env = parseEnvironment();
