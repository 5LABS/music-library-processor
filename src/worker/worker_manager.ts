import { Logger } from "@/utilis/logger";
import { ui } from "@/utilis/ui";
import { WorkerManager } from "./worker_manger_class";
import { searchFiles } from "@/utilis/functions";

export async function InitWorkerManger(workerCount: number, musicPath: string) {
    const logger = new Logger("error.log");

    const files = await searchFiles(musicPath)

    const startTime = Date.now();
    const manager = new WorkerManager(
        workerCount,
        files,
        (current, total, filePath) => ui.update(current, total, filePath, "", startTime),
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
    await logger.close();
}



