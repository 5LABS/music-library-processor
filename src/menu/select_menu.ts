import { ui } from "@/ui";

export interface SelectOption {
    label: string;
}

class SelectMenu {
    async show<T extends SelectOption>(options: T[]): Promise<T> {
        let selected = 0;
        let firstRender = true;

        const render = () => {
            if (!firstRender) {
                process.stdout.write(`\x1B[${options.length}A`);
            }
            for (let i = 0; i < options.length; i++) {
                const cursor = i === selected ? `${ui.COLORS.CYAN}>` : " ";
                const labelStyle = i === selected ? ui.COLORS.RESET : ui.COLORS.DIM;
                process.stdout.write(`${ui.COLORS.CLEAR_LINE}${cursor} ${labelStyle}${options[i].label}${ui.COLORS.RESET}\n`);
            }
            firstRender = false;
        };

        render();
        process.stdin.setRawMode(true);
        process.stdin.resume();

        return new Promise((resolve) => {
            const onData = (buf: Buffer) => {
                const key = buf.toString();

                if (key === "\x1B[A") selected = Math.max(0, selected - 1);
                else if (key === "\x1B[B") selected = Math.min(options.length - 1, selected + 1);
                else if (key === "\x03") { process.stdin.setRawMode(false); process.exit(); }
                else if (key === "\r" || key === "\n") {
                    process.stdin.removeListener("data", onData);
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdout.write("\n");
                    resolve(options[selected]);
                    return;
                }

                render();
            };

            process.stdin.on("data", onData);
        });
    }
}

export const selectMenu = new SelectMenu();
