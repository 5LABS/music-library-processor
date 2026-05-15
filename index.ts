import { Logger } from "@/logger";
import { UI } from "@/ui";
import { InitWorkerManger } from "@/worker/worker_manager";
const ui = new UI();
const logger = new Logger("error.log");

function calculateWorkers() {
    const cpuCount = navigator.hardwareConcurrency; // Bun-API, gibt logische Kerne zurück
    logger.info(`Dieser Pc hat: ${cpuCount} Kerne`);
    const maxWorkers = Math.max(cpuCount, 2)
    const minWorkers = Math.min(maxWorkers, 8);
    return minWorkers; // Automatisch: 2 bis 8, abhängig von der CPU
}

async function main() {

    ui.print(`
███╗   ██╗ ██████╗ ██████╗ ███╗   ███╗ █████╗ ██╗     ██╗███████╗███████╗    
████╗  ██║██╔═══██╗██╔══██╗████╗ ████║██╔══██╗██║     ██║╚══███╔╝██╔════╝    
██╔██╗ ██║██║   ██║██████╔╝██╔████╔██║███████║██║     ██║  ███╔╝ █████╗      
██║╚██╗██║██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║     ██║ ███╔╝  ██╔══╝      
██║ ╚████║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║███████╗██║███████╗███████╗    
╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚══════╝    
                                                                             
███╗   ███╗██╗   ██╗███████╗██╗ ██████╗    ██╗     ██╗██████╗                
████╗ ████║██║   ██║██╔════╝██║██╔════╝    ██║     ██║██╔══██╗               
██╔████╔██║██║   ██║███████╗██║██║         ██║     ██║██████╔╝               
██║╚██╔╝██║██║   ██║╚════██║██║██║         ██║     ██║██╔══██╗               
██║ ╚═╝ ██║╚██████╔╝███████║██║╚██████╗    ███████╗██║██████╔╝               
╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝    ╚══════╝╚═╝╚═════╝                                                                            
        `);


    const defaultPath = process.env.MUSIC_PATH ?? "./music";
    ui.print("Gebe einen Pfad zur Musikbibliothek ein. \nKeine Eingabe = " + defaultPath + " (.env)");
    const inputPath = prompt(`Neuer Pfad:`);
    const musicPath = inputPath?.trim() || defaultPath;

    ui.print("Wie viele Worker sollen gleichzeitig starten? (leer für Automatisch)");
    const inputWorker = Number(prompt("Worker:"));

    const workerCount = inputWorker || calculateWorkers();
    logger.info(`Final Worker Count: ${workerCount}`);
    ui.print(`Start Verarbeitung mit ${workerCount} Workers im Pfad ${musicPath}`);
    logger.info(`Start Verarbeitung mit ${workerCount} Workers im Pfad ${musicPath}`);
    InitWorkerManger(workerCount, musicPath);
}

main()