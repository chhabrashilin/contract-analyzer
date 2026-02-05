import { Pinecone } from "@pinecone-database/pinecone";
import { VectorStore, VectorMetadata, QueryResult } from "./vector-store";
import { hasPinecone, env } from "@/lib/env";

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone | null {
    if (!hasPinecone) return null;

    if (!pineconeClient) {
        pineconeClient = new Pinecone({
            apiKey: env.PINECONE_API_KEY!,
        });
    }
    return pineconeClient;
}

export class PineconeVectorStore implements VectorStore {
    private indexName: string;

    constructor() {
        this.indexName = env.PINECONE_INDEX || "contracts";
    }

    async upsert(vectors: { id: string; values: number[]; metadata: VectorMetadata }[]): Promise<void> {
        const client = getPineconeClient();
        if (!client) {
            console.warn("[Pinecone] Client not available, skipping upsert");
            return;
        }

        try {
            const index = client.index(this.indexName);
            // Transform to Pinecone format - use type assertion to handle SDK differences
            const records = vectors.map(v => ({
                id: v.id,
                values: v.values,
                metadata: {
                    contractId: v.metadata.contractId,
                    chunkId: v.metadata.chunkId,
                    chunkIndex: v.metadata.chunkIndex,
                    content: v.metadata.content,
                },
            }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (index as any).upsert(records);
            console.log(`[Pinecone] Upserted ${vectors.length} vectors`);
        } catch (error) {
            console.error("[Pinecone] Upsert error:", error);
            throw error;
        }
    }

    async query(vector: number[], topK: number, filter?: Record<string, unknown>): Promise<QueryResult[]> {
        const client = getPineconeClient();
        if (!client) {
            console.warn("[Pinecone] Client not available, returning empty results");
            return [];
        }

        try {
            const index = client.index(this.indexName);
            const response = await index.query({
                vector,
                topK,
                filter,
                includeMetadata: true,
            });

            return (response.matches || []).map((match) => ({
                id: match.id,
                score: match.score || 0,
                metadata: {
                    contractId: String(match.metadata?.contractId || ""),
                    chunkId: String(match.metadata?.chunkId || ""),
                    chunkIndex: Number(match.metadata?.chunkIndex || 0),
                    content: String(match.metadata?.content || ""),
                },
            }));
        } catch (error) {
            console.error("[Pinecone] Query error:", error);
            return [];
        }
    }
}

// Export singleton
export const pineconeVectorStore = new PineconeVectorStore();
