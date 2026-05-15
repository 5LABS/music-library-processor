import { Logger } from "@/logger";
import { UI } from "@/ui";
import { WorkerManager } from "./worker_manger_class";

export async function InitWorkerManger(workerCount: number, musicPath: string) {
    const ui = new UI();
    const logger = new Logger("error.log");

    const files: string[] = [];
    for (const pattern of ["**/*.mp3", "**/*.MP3"]) {
        const glob = new Bun.Glob(pattern);
        for await (const file of glob.scan({ cwd: musicPath, absolute: true })) {
            files.push(file);
        }
    }

    if (files.length === 0) {
        ui.print("Keine MP3-Dateien gefunden.");
        return;
    }

    const startTime = Date.now();
    ui.init(files.length);

    const manager = new WorkerManager(
        workerCount,
        files,
        (current, total, filePath) => ui.update(current, total, filePath, "", startTime),
        (filePath, errMsg) => {
            logger.error(filePath, new Error(errMsg));
            ui.updateError(0, files.length, filePath, startTime);
        }
    );

    await manager.run();
    ui.finish(files.length, logger.errorCount, startTime);
    await logger.close();
}



