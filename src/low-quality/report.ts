import { unlink } from "node:fs/promises";
import { ui } from "@/utilis/ui";

const REPORT_PATH = "low-quality-report.txt";

// Nicht-destruktiver Abschluss des "Low Quality finden"-Laufs:
// listet die Treffer, schreibt einen Report und überlässt dem User
// die Entscheidung, ob die Dateien gelöscht werden sollen.
export async function reportLowQuality(files: string[]): Promise<void> {
    if (files.length === 0) {
        ui.print(`${ui.COLORS.GREEN}Keine Low-Quality-Dateien gefunden.`);
        return;
    }

    ui.print(`${ui.COLORS.YELLOW}${files.length} Low-Quality-Dateien gefunden:`);
    for (const f of files) ui.print(`${ui.COLORS.DIM}  ${f}`);

    await Bun.write(REPORT_PATH, files.join("\n") + "\n");
    ui.print(`${ui.COLORS.GREEN}Report geschrieben: ${REPORT_PATH}`);

    const answer = prompt(`${ui.COLORS.RED}Diese ${files.length} Dateien löschen? (y/N):`);
    if (answer?.trim().toLowerCase() !== "y") {
        ui.print(`${ui.COLORS.GREEN}Nichts gelöscht.`);
        return;
    }

    let deleted = 0;
    for (const f of files) {
        try {
            await unlink(f);
            deleted++;
        } catch (err: any) {
            ui.printError(f, err instanceof Error ? err : new Error(String(err)));
        }
    }
    ui.print(`${ui.COLORS.GREEN}${deleted} Dateien gelöscht.`);
}
