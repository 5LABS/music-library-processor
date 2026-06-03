import type { JobType, MainToWorker, WorkerToMain } from "@/worker/worker_types";
import { normalizeJob } from "@/id3-normalizar/processor";
import { lowQualityJob } from "@/low-quality/checker";

// Bun Worker-Kontext: self ist der globale Worker-Scope
// const workerSelf = self as unknown as { close(): void };

// Handler-Registry: bildet jeden Job-Typ auf seine Verarbeitungsfunktion ab.
// Neuer Job = ein Eintrag hier (+ JobType in worker_types.ts + Menüpunkt).
const handlers: Record<JobType, (filePath: string) => Promise<string>> = {
    normalize_id3_tags: normalizeJob,
    find_low_quality_files: lowQualityJob,
};

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
                const status = await handlers[msg.jobType](msg.filePath);
                postMessage({
                    type: "DONE",
                    jobId: msg.jobId,
                    filePath: msg.filePath,
                    status,
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


