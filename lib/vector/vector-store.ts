export interface VectorMetadata {
    contractId: string;
    chunkId: string;
    chunkIndex: number;
    content: string;
}

export interface QueryResult {
    id: string;
    score: number;
    metadata: VectorMetadata;
}

export interface VectorStore {
    upsert(vectors: {
        id: string;
        values: number[];
        metadata: VectorMetadata;
    }[]): Promise<void>;

    query(vector: number[], topK: number, filter?: Record<string, any>): Promise<QueryResult[]>;
}
