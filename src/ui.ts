const RESET = "\x1B[0m";
const GREEN = "\x1B[32m";
const RED = "\x1B[31m";
const CYAN = "\x1B[36m";
const DIM = "\x1B[2m";
const CLEAR_LINE = "\x1B[2K\r";

class UI {
  print(msg: string): void {
    process.stdout.write(`${msg}\n`);
  }

  init(total: number): void {
    process.stdout.write(`\n${CYAN}Verarbeite ${total} Dateien...${RESET}\n\n`);
  }

  update(current: number, total: number, filename: string, status = "", startTime?: number): void {
    const percent = Math.floor((current / total) * 100);
    const bar = this.progressBar(percent);
    const name = filename.length > 45 ? `...${filename.slice(-42)}` : filename.padEnd(45);
    const statusStr = status ? ` ${DIM}${status}${RESET}` : "";
    const elapsed = startTime !== undefined ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const elapsedStr = startTime !== undefined ? ` ${DIM}${elapsed}s${RESET}` : "";

    process.stdout.write(`${CLEAR_LINE}${GREEN}[${bar}]${RESET} ${current}/${total} (${percent}%)${elapsedStr} ${DIM}${name}${RESET}${statusStr}`);
  }

  updateError(current: number, total: number, filename: string, startTime?: number): void {
    this.update(current, total, filename, `${RED}Fehler${RESET}`, startTime);
  }

  printError(file: string, err: Error): void {
    process.stdout.write(`\n${RED}Fehler:${RESET} ${file}\n  ${DIM}${err.message}${RESET}\n`);
  }

  printCover(file: string): void {
    process.stdout.write(`\n${GREEN}Cover:${RESET}  ${DIM}${file}${RESET}\n`);
  }

  finish(total: number, errors: number, startTime?: number): void {
    const errStr = errors > 0 ? ` ${RED}| ${errors} Fehler → error.log${RESET}` : "";
    const durationStr = startTime !== undefined ? ` ${DIM}| Dauer: ${this.formatDuration(Date.now() - startTime)}${RESET}` : "";
    process.stdout.write(`\n\n${GREEN}✓ Fertig:${RESET} ${total} Dateien verarbeitet${errStr}${durationStr}\n`);
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
