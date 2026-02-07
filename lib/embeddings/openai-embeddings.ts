import { GoogleGenerativeAI } from "@google/generative-ai";
import { hasGemini } from "@/lib/env";

// Only initialize Gemini if API key is available
const genAI = hasGemini
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    : null;

/**
 * Generate embeddings for text using Gemini's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!genAI) {
        console.warn("[Embeddings] Gemini API key not configured, returning empty embedding");
        return [];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("[Embeddings] Error generating embedding:", error);
        throw error;
    }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!genAI) {
        console.warn("[Embeddings] Gemini API key not configured, returning empty embeddings");
        return [];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddings: number[][] = [];

        // Gemini doesn't have native batch embedding, process sequentially
        for (const text of texts) {
            const result = await model.embedContent(text);
            embeddings.push(result.embedding.values);
        }

        return embeddings;
    } catch (error) {
        console.error("[Embeddings] Error generating embeddings:", error);
        throw error;
    }
}
