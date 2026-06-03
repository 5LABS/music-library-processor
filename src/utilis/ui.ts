class UI {

    readonly COLORS = {
        RESET: "\x1B[0m",
        GREEN: "\x1B[32m",
        RED: "\x1B[31m",
        CYAN: "\x1B[36m",
        YELLOW: "\x1B[33m",
        PINK: "\x1B[35m",
        PURPLE: "\x1B[38;5;93m",
        BOLD: "\x1B[1m",
        DIM: "\x1B[2m",
        CLEAR_LINE: "\x1B[2K\r"
    }

    print(msg: string): void {
        process.stdout.write(`${msg}\n` + this.COLORS.RESET);
    }

    update(current: number, total: number, filename: string, status = "", startTime?: number): void {
        const percent = Math.floor((current / total) * 100);
        const bar = this.progressBar(percent);
        const name = filename.length > 45 ? `...${filename.slice(-42)}` : filename.padEnd(45);
        const statusStr = status ? ` ${this.COLORS.DIM}${status}${this.COLORS.RESET}` : "";
        const elapsed = startTime !== undefined ? Math.floor((Date.now() - startTime) / 1000) : 0;
        const elapsedStr = startTime !== undefined ? ` ${this.COLORS.DIM}${elapsed}s${this.COLORS.RESET}` : "";

        process.stdout.write(`${this.COLORS.CLEAR_LINE}${this.COLORS.GREEN}[${bar}]${this.COLORS.RESET} ${current}/${total} (${percent}%)${elapsedStr} ${this.COLORS.DIM}${name}${this.COLORS.RESET}${statusStr}`);
    }

    updateError(current: number, total: number, filename: string, startTime?: number): void {
        this.update(current, total, filename, `${this.COLORS.RED}Fehler${this.COLORS.RESET}`, startTime);
    }

    printError(file: string, err: Error): void {
        process.stdout.write(`\n${this.COLORS.RED}Fehler:${this.COLORS.RESET} ${file}\n  ${this.COLORS.DIM}${err.message}${this.COLORS.RESET}\n`);
    }

    printCover(file: string): void {
        process.stdout.write(`\n${this.COLORS.GREEN}Cover:${this.COLORS.RESET}  ${this.COLORS.DIM}${file}${this.COLORS.RESET}\n`);
    }

    finish(total: number, errors: number, startTime?: number): void {
        const errStr = errors > 0 ? ` ${this.COLORS.RED}| ${errors} Fehler → error.log${this.COLORS.RESET}` : "";
        const durationStr = startTime !== undefined ? ` ${this.COLORS.DIM}| Dauer: ${this.formatDuration(Date.now() - startTime)}${this.COLORS.RESET}` : "";
        process.stdout.write(`\n\n${this.COLORS.GREEN}✓ Fertig:${this.COLORS.RESET} ${total} Dateien verarbeitet${errStr}${durationStr}\n`);
    }

    private formatDuration(ms: number): string {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;

        if (h > 0) return `${h} Stunde${h !== 1 ? "n" : ""} ${m} Minute${m !== 1 ? "n" : ""}`;
        if (m > 0) return `${m} Minute${m !== 1 ? "n" : ""} ${s} Sekunde${s !== 1 ? "n" : ""}`;
        return `${s} Sekunde${s !== 1 ? "n" : ""}`;
    }

    private progressBar(percent: number): string {
        const width = 25;
        const filled = Math.floor((percent / 100) * width);
        return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
    }
}

export const ui = new UI();
