export interface Job {
    id: string;
    data: any;
}

export interface QueueService {
    enqueue(jobId: string, data: any): Promise<void>;
    onProcess(handler: (job: Job) => Promise<void>): void;
}
