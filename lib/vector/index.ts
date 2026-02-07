// Smart vector store that uses Pinecone in production, in-memory for development

import { hasPinecone } from "@/lib/env";
import { VectorStore, VectorMetadata, QueryResult } from "./vector-store";
import { inMemoryVectorStore as memoryStore } from "./in-memory-vector-store";

// Dynamic import for Pinecone to avoid errors when not configured
let pineconeStore: VectorStore | null = null;

async function getPineconeStore(): Promise<VectorStore | null> {
    if (!hasPinecone) return null;

    if (!pineconeStore) {
        try {
            const { pineconeVectorStore } = await import("./pinecone-client");
            pineconeStore = pineconeVectorStore;
        } catch (error) {
            console.warn("[VectorStore] Failed to load Pinecone:", error);
            return null;
        }
    }
    return pineconeStore;
}

// Unified vector store that selects the right provider
class SmartVectorStore implements VectorStore {
    async upsert(vectors: { id: string; values: number[]; metadata: VectorMetadata }[]): Promise<void> {
        const pinecone = await getPineconeStore();

        if (pinecone) {
            await pinecone.upsert(vectors);
        } else {
            await memoryStore.upsert(vectors);
        }
    }

    async query(vector: number[], topK: number, filter?: Record<string, string>): Promise<QueryResult[]> {
        const pinecone = await getPineconeStore();

        if (pinecone) {
            return pinecone.query(vector, topK, filter);
        }
        return memoryStore.query(vector, topK, filter);
    }
}

export const vectorStore = new SmartVectorStore();
