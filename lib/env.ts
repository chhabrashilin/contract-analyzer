import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
    DATABASE_URL: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    PINECONE_API_KEY: z.string().optional(),
    PINECONE_INDEX: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parse and validate
function getEnv() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    }

    return parsed.data || {
        NODE_ENV: "development" as const,
    };
}

export const env = getEnv();

// Helper checks
export const hasDatabase = !!env.DATABASE_URL;
export const hasGemini = !!env.GEMINI_API_KEY;
export const hasPinecone = !!env.PINECONE_API_KEY && !!env.PINECONE_INDEX;
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";

// Legacy alias for compatibility
export const hasOpenAI = hasGemini;

// Production environment validation
if (isProd && typeof window === "undefined") {
    const missingVars: string[] = [];

    if (!hasDatabase) missingVars.push("DATABASE_URL");
    if (!hasGemini) missingVars.push("GEMINI_API_KEY");

    if (missingVars.length > 0) {
        console.warn(
            `[Production Warning] Missing recommended environment variables: ${missingVars.join(", ")}`
        );
    }
}

// Log feature availability in development
if (isDev && typeof window === "undefined") {
    console.log("[Env] Feature availability:");
    console.log(`  - Database: ${hasDatabase ? "Enabled" : "Mock (set DATABASE_URL for persistence)"}`);
    console.log(`  - Gemini AI: ${hasGemini ? "Enabled" : "Disabled (set GEMINI_API_KEY)"}`);
    console.log(`  - Pinecone: ${hasPinecone ? "Enabled" : "In-memory (set PINECONE_API_KEY and PINECONE_INDEX)"}`);
}
