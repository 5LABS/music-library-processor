import { logger } from "@/utilis/logger";
import * as readline from "readline";
import { ui } from "./ui";

export function promtWithPrefill(question: string, prefill: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(question, (answer) => { rl.close(); resolve(answer); });
        rl.write(prefill);
    });
}

export function calculateWorkers() {
    const cpuCount = navigator.hardwareConcurrency; // Bun-API, gibt logische Kerne zurück
    logger.info(`Dieser Pc hat: ${cpuCount} Kerne`);
    const maxWorkers = Math.max(cpuCount, 2)
    const minWorkers = Math.min(maxWorkers, 8);
    return minWorkers; // Automatisch: 2 bis 8, abhängig von der CPU
}

export async function searchFiles(musicPath: string) {
    const files: string[] = [];
    for (const pattern of ["**/*.mp3", "**/*.MP3"]) {
        const glob = new Bun.Glob(pattern);
        for await (const file of glob.scan({ cwd: musicPath, absolute: true })) {
            files.push(file);
        }
    }

    if (files.length === 0) {
        ui.print("Keine MP3-Dateien gefunden.");
        return files;
    }

    ui.print(`\n${ui.COLORS.CYAN}${files.length} Files Indexiert...${ui.COLORS.RESET}\n\n`);

    return files
}