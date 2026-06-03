import { logger } from "@/utilis/logger";
import { ui } from "@/utilis/ui";
import { InitWorkerManger } from "@/worker/worker_manager";
import { StartMenuActionSelection } from "./menu/main_menu";
import { promtWithPrefill, calculateWorkers } from "@/utilis/functions";

(async function main() {

    ui.print(ui.COLORS.PINK + `
███╗   ███╗██╗   ██╗███████╗██╗ ██████╗    ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗
████╗ ████║██║   ██║██╔════╝██║██╔════╝    ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗
██╔████╔██║██║   ██║███████╗██║██║         ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝
██║╚██╔╝██║██║   ██║╚════██║██║██║         ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗
██║ ╚═╝ ██║╚██████╔╝███████║██║╚██████╗    ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║
╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
    `);
    ui.print(ui.COLORS.BOLD + ui.COLORS.PINK + "Willkommen zum Music Library Manager!\n");

    const defaultPath = process.env.MUSIC_PATH ?? "./music";
    ui.print(`${ui.COLORS.GREEN}Wo liegen die Musikdaten? ${ui.COLORS.DIM}Keine Eingabe = ${defaultPath} (.env)`);

    const inputPath = prompt(`Neuer Pfad:`);
    const musicPath = inputPath?.trim() || defaultPath;
    const workerCount = calculateWorkers();
    ui.print(`${ui.COLORS.GREEN}Wie viele Worker sollen gleichzeitig starten? ${ui.COLORS.DIM}`);
    const inputWorker = Number(await promtWithPrefill("Worker: ", String(workerCount)));


    logger.info(`Final Worker Count: ${workerCount}`);
    ui.print(`Start Verarbeitung mit ${workerCount} Workers im Pfad ${musicPath}`);
        
    const result = await StartMenuActionSelection();

    switch (result) {
        case "find_low_quality_files":
            logger.info("User selected: Find Low Quality Files");
            break;
        case "normalize_id3_tags":
            logger.info("User selected: Normalize ID3 Tags");
            break;
        case "exit":
            await logger.info("User selected: Exit");
            await logger.close();
            process.exit(0);
        default:
            logger.warn(`Unknown menu option selected: ${result}`);
    }

    // InitWorkerManger(workerCount, musicPath);
})();

