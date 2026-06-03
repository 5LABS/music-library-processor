import { ui } from "@/utilis/ui";
import { selectMenu } from "@/menu/select_menu";
import type { SelectOption } from "@/menu/select_menu";

export const MENU_OPTIONS = [
    {
        label: "Low Quality Dateien finden",
        id: "find_low_quality_files",
    },
    {
        label: "ID3 Tags normalisieren",
        id: "normalize_id3_tags",
    },
    {
        label: "Beenden",
        id: "exit",
    },
] satisfies SelectOption[];

export async function StartMenuActionSelection(): Promise<string> {

    ui.print(ui.COLORS.GREEN + "\nWas möchtest du tun?");
    return selectMenu.show(MENU_OPTIONS);
}