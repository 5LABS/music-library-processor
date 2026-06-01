import { logger } from "@/logger";
import { ui } from "@/ui";
import { InitWorkerManger } from "@/worker/worker_manager";
import { StartMenuActionSelection } from "./menu/main_menu";
import { askWithPrefill, calculateWorkers } from "./utilis";

async function main() {

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
    const inputWorker = Number(await askWithPrefill("Worker: ", String(workerCount)));


    logger.info(`Final Worker Count: ${workerCount}`);
    ui.print(`Start Verarbeitung mit ${workerCount} Workers im Pfad ${musicPath}`);
    logger.info(`Start Verarbeitung mit ${workerCount} Workers im Pfad ${musicPath}`);

    await StartMenuActionSelection();
    // InitWorkerManger(workerCount, musicPath);
}

main()