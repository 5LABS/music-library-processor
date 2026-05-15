export class Logger {
  errorCount = 0;
  private logPath: string;
  private entries: string[] = [];

  constructor(logPath: string) {
    this.logPath = logPath;
  }

  info(message: string): void {
    const timestamp = new Date().toISOString();
    this.entries.push(`[${timestamp}] INFO  ${message}`);
  }

  async error(file: string, err: Error): Promise<void> {
    this.errorCount++;
    const timestamp = new Date().toISOString();
    this.entries.push(`[${timestamp}] ERROR ${file}\n  ${err.message}\n`);
  }

  async close(): Promise<void> {
    if (this.entries.length === 0) return;
    await Bun.write(this.logPath, this.entries.join("\n"));
  }
}
