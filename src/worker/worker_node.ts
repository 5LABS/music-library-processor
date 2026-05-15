// Die Logik des einzelnen Workers
import { processFile } from "@/processor";

// Bun Worker-Kontext: self ist der globale Worker-Scope
// const workerSelf = self as unknown as { close(): void };


type MainToWorker =
    | { type: "JOB"; jobId: number; filePath: string }
    | { type: "SHUTDOWN" };

type WorkerToMain =
    | { type: "READY" }
    | { type: "DONE"; jobId: number; filePath: string; status: string }
    | { type: "ERROR"; jobId: number; filePath: string; message: string }
    | { type: "MB_REQUEST"; reqId: number; artist: string; title: string };


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

// Signal an den Manager: dieser Worker ist bereit für den ersten Job
postMessage({ type: "READY" } satisfies WorkerToMain);
