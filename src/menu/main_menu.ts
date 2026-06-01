import { ui } from "@/ui";
import { selectMenu } from "@/menu/select_menu";
import type { SelectOption } from "@/menu/select_menu";

export const MENU_OPTIONS = [
    { label: "Low Quality Dateien finden" },
    { label: "ID3 Tags normalisieren" },
    { label: "Beenden" },
] satisfies SelectOption[];

export async function StartMenuActionSelection(): Promise<SelectOption> {

    ui.print(ui.COLORS.GREEN + "\nWas möchtest du tun?");
    return selectMenu.show(MENU_OPTIONS);
}