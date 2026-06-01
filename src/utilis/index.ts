import { logger } from "@/logger";
import * as readline from "readline";

export function askWithPrefill(question: string, prefill: string): Promise<string> {
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