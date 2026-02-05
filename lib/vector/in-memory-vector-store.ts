import { VectorStore, VectorMetadata, QueryResult } from "./vector-store";

interface StoredVector {
    id: string;
    values: number[];
    metadata: VectorMetadata;
}

// Simple in-memory vector store for development
export class InMemoryVectorStore implements VectorStore {
    private vectors: StoredVector[] = [];

    async upsert(vectors: StoredVector[]): Promise<void> {
        for (const vec of vectors) {
            // Remove existing vector with same ID if present
            this.vectors = this.vectors.filter(v => v.id !== vec.id);
            this.vectors.push(vec);
        }
        console.log(`[InMemoryVectorStore] Upserted ${vectors.length} vectors`);
    }

    async query(queryVector: number[], topK: number, filter?: Record<string, any>): Promise<QueryResult[]> {
        let filteredVectors = this.vectors;

        // Apply filter if provided (e.g., contractId)
        if (filter && filter.contractId) {
            filteredVectors = this.vectors.filter(v => v.metadata.contractId === filter.contractId);
        }

        // Calculate cosine similarity
        const results = filteredVectors.map(vec => {
            const score = this.cosineSimilarity(queryVector, vec.values);
            return {
                id: vec.id,
                score,
                metadata: vec.metadata
            };
        });

        // Sort by score descending and take top K
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

// Export singleton
export const inMemoryVectorStore = new InMemoryVectorStore();
