import { logger } from "@/logger";
import { ui } from "@/ui";
import { InitWorkerManger } from "@/worker/worker_manager";
import { StartMenuActionSelection } from "./menu/main_menu";

function calculateWorkers() {
    const cpuCount = navigator.hardwareConcurrency; // Bun-API, gibt logische Kerne zurück
    logger.info(`Dieser Pc hat: ${cpuCount} Kerne`);
    const maxWorkers = Math.max(cpuCount, 2)
    const minWorkers = Math.min(maxWorkers, 8);
    return minWorkers; // Automatisch: 2 bis 8, abhängig von der CPU
}

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
    const inputWorker = Number(prompt("Worker:"));


    logger.info(`Final Worker Count: ${workerCount}`);
    ui.print(`Start Verarbeitung mit ${workerCount} Workers im Pfad ${musicPath}`);
    logger.info(`Start Verarbeitung mit ${workerCount} Workers im Pfad ${musicPath}`);

    await StartMenuActionSelection();
    // InitWorkerManger(workerCount, musicPath);
}

main()