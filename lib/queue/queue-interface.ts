export interface Job<T = Record<string, unknown>> {
    id: string;
    data: T;
}

export interface QueueService<T = Record<string, unknown>> {
    enqueue(jobId: string, data: T): Promise<void>;
    onProcess(handler: (job: Job<T>) => Promise<void>): void;
}
