
export type MainToWorker =
    | { type: "JOB"; jobId: number; filePath: string }
    | { type: "SHUTDOWN" };

export type WorkerToMain =
    | { type: "READY" }
    | { type: "DONE"; jobId: number; filePath: string; status: string }
    | { type: "ERROR"; jobId: number; filePath: string; message: string }
    | { type: "MB_REQUEST"; reqId: number; artist: string; title: string }
    | { type: "LOG"; level: "info" | "error"; message: string };
