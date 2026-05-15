import type { MainToWorker, WorkerToMain } from "@/worker/worker_types";
import { processFile } from "@/processor";

// Bun Worker-Kontext: self ist der globale Worker-Scope
// const workerSelf = self as unknown as { close(): void };

function postLog(level: "info" | "error", message: string) {
    postMessage({ type: "LOG", level, message } satisfies WorkerToMain);
}

// Signal an den Manager: dieser Worker ist bereit für den ersten Job
postMessage({ type: "READY" } satisfies WorkerToMain);

onmessage = async (event: MessageEvent<MainToWorker>) => {
    const msg = event.data;

    switch (msg.type) {
        case "JOB":
            try {
                await processFile(msg.filePath);
                postMessage({
                    type: "DONE",
                    jobId: msg.jobId,
                    filePath: msg.filePath,
                    status: "ok",
                } satisfies WorkerToMain);
            } catch (err: any) {
                postMessage({
                    type: "ERROR",
                    jobId: msg.jobId,
                    filePath: msg.filePath,
                    message: err?.message ?? String(err),
                } satisfies WorkerToMain);
            }
            break;

        case "SHUTDOWN":
            // Wird vom Main-Thread via worker.terminate() beendet
            break;
    }
};


