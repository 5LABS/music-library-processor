import { Logger } from "@/utilis/logger";
import { ui } from "@/utilis/ui";
import { WorkerManager } from "./worker_manger_class";
import { searchFiles } from "@/utilis/functions";
import { reportLowQuality } from "@/low-quality/report";
import type { JobType } from "@/worker/worker_types";

export async function InitWorkerManger(workerCount: number, musicPath: string, jobType: JobType) {
    const logger = new Logger("error.log");

    const files = await searchFiles(musicPath)
    const lowQualityFiles: string[] = [];

    const startTime = Date.now();
    const manager = new WorkerManager(
        workerCount,
        files,
        jobType,
        (current, total, filePath, status) => {
            ui.update(current, total, filePath, "", startTime);
            // Low-Quality-Treffer einsammeln (Status-Konvention: "lowq:<bitrate>")
            if (status.startsWith("lowq")) lowQualityFiles.push(filePath);
        },
        (filePath, errMsg) => {
            logger.error(filePath, new Error(errMsg));
            ui.updateError(0, files.length, filePath, startTime);
        },
        (level, message) => {
            if (level === "error") logger.error(message, new Error(message));
            else logger.info(message);
        }
    );

    await manager.run();
    ui.finish(files.length, logger.errorCount, startTime);

    if (jobType === "find_low_quality_files") {
        await reportLowQuality(lowQualityFiles);
    }
    await logger.close();
}



