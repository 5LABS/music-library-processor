
type MainToWorker =
    | { type: "JOB"; jobId: number; filePath: string }
    | { type: "SHUTDOWN" };

type WorkerToMain =
    | { type: "READY" }
    | { type: "DONE"; jobId: number; filePath: string; status: string }
    | { type: "ERROR"; jobId: number; filePath: string; message: string }
    | { type: "MB_REQUEST"; reqId: number; artist: string; title: string };

export class WorkerManager {
    private workers: Worker[] = [];
    private queue: string[];
    private active = 0;
    private done = 0;
    private total: number;
    private onProgress: (current: number, total: number, filePath: string) => void;
    private onError: (filePath: string, error: string) => void;
    private resolve!: () => void;

    constructor(
        workerCount: number,
        files: string[],
        onProgress: (current: number, total: number, filePath: string) => void,
        onError: (filePath: string, error: string) => void
    ) {
        this.queue = [...files];
        this.total = files.length;
        this.onProgress = onProgress;
        this.onError = onError;

        for (let i = 0; i < workerCount; i++) {
            const w = new Worker(new URL("./worker_node.ts", import.meta.url));
            this.workers.push(w);
            w.onmessage = (event) => this.handleMessage(w, event.data as WorkerToMain);
            w.onerror = (err) => {
                this.done++;
                this.active--;
                this.onError("worker-init", err.message ?? String(err));
                this.checkDone();
            };
        }
    }

    async run(): Promise<void> {
        if (this.total === 0) return;
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    private handleMessage(worker: Worker, msg: WorkerToMain) {
        switch (msg.type) {
            case "READY":
                this.dispatch(worker);
                break;

            case "DONE":
                this.done++;
                this.active--;
                this.onProgress(this.done, this.total, msg.filePath);
                this.dispatch(worker);
                break;

            case "ERROR":
                this.done++;
                this.active--;
                this.onError(msg.filePath, msg.message);
                this.dispatch(worker);
                break;
        }
    }

    private dispatch(worker: Worker) {
        if (this.queue.length === 0) {
            // active wurde bereits in handleMessage dekrementiert – nur Abschluss prüfen
            this.checkDone();
            return;
        }

        const filePath = this.queue.shift()!;
        const jobId = this.total - this.queue.length;
        this.active++;
        worker.postMessage({ type: "JOB", jobId, filePath } satisfies MainToWorker);
    }

    private checkDone() {
        if (this.active === 0 && this.done === this.total) {
            for (const w of this.workers) {
                w.terminate();
            }
            this.resolve?.();
        }
    }

}