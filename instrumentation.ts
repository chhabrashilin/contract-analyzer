export function register() {
    // Import queue and worker only on server side
    if (typeof window === 'undefined') {
        import('./lib/queue/in-memory-queue').then(({ contractQueue }) => {
            import('./lib/workers/contract-parser').then(({ processContract }) => {
                contractQueue.onProcess(async (job) => {
                    if (job.data.type === "CONTRACT_UPLOAD") {
                        await processContract(job.data);
                    }
                });
                console.log('[Instrumentation] Contract queue worker registered');
            });
        });
    }
}
