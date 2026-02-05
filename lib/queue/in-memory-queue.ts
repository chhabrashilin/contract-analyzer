import { Job, QueueService } from "./queue-interface";

// Singleton in-memory queue for simple async processing without Redis
class InMemoryQueue implements QueueService {
    private jobs: Job[] = [];
    private handlers: ((job: Job) => Promise<void>)[] = [];
    private isProcessing = false;

    async enqueue(jobId: string, data: any): Promise<void> {
        const job = { id: jobId, data };
        this.jobs.push(job);
        console.log(`[Queue] Job ${jobId} enqueued.`);
        this.processNext();
    }

    onProcess(handler: (job: Job) => Promise<void>): void {
        this.handlers.push(handler);
    }

    private async processNext() {
        if (this.isProcessing || this.jobs.length === 0) return;

        this.isProcessing = true;
        const job = this.jobs.shift();

        if (job) {
            try {
                console.log(`[Queue] Processing job ${job.id}...`);
                // Run all handlers (or just one if we had load balancing, but here we multicast or just act as a worker)
                // For this simple implementation, we assume one worker handler
                for (const handler of this.handlers) {
                    await handler(job);
                }
                console.log(`[Queue] Job ${job.id} completed.`);
            } catch (error) {
                console.error(`[Queue] Job ${job.id} failed:`, error);
            } finally {
                this.isProcessing = false;
                // Check for next job
                if (this.jobs.length > 0) {
                    this.processNext(); // Recursive-ish loop
                }
            }
        }
    }
}

// Export a singleton instance
export const contractQueue = new InMemoryQueue();
