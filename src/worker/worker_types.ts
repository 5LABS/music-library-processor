
// Job-Typen entsprechen exakt den Menü-IDs (main_menu.ts).
// Neuer Job = neuer String hier + Handler in worker_node.ts + Menüpunkt.
export type JobType = "normalize_id3_tags" | "find_low_quality_files";

export type MainToWorker =
    | { type: "JOB"; jobId: number; filePath: string; jobType: JobType }
    | { type: "SHUTDOWN" };

export type WorkerToMain =
    | { type: "READY" }
    | { type: "DONE"; jobId: number; filePath: string; status: string }
    | { type: "ERROR"; jobId: number; filePath: string; message: string }
    | { type: "MB_REQUEST"; reqId: number; artist: string; title: string }
    | { type: "LOG"; level: "info" | "error"; message: string };
