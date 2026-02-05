import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
    DATABASE_URL: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    PINECONE_API_KEY: z.string().optional(),
    PINECONE_INDEX: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parse and validate
function getEnv() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    }

    return parsed.data || {
        NODE_ENV: "development" as const,
    };
}

export const env = getEnv();

// Helper checks
export const hasDatabase = !!env.DATABASE_URL;
export const hasOpenAI = !!env.OPENAI_API_KEY;
export const hasPinecone = !!env.PINECONE_API_KEY && !!env.PINECONE_INDEX;
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
