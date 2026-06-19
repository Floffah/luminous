import type { LucideIcon } from "lucide-react";
import {
    BuildingIcon,
    CpuIcon,
    FileQuestionIcon,
    LandmarkIcon,
    MapPinnedIcon,
    PersonStandingIcon,
    ScrollIcon,
} from "lucide-react";

export const DOC_TYPE_ICONS = {
    Location: MapPinnedIcon,
    Lore: ScrollIcon,
    Organisation: BuildingIcon,
    People: PersonStandingIcon,
    Governance: LandmarkIcon,
    Technology: CpuIcon,
} satisfies Record<string, LucideIcon>;

export function getDocTypeIcon(type: string): LucideIcon {
    return (
        DOC_TYPE_ICONS[type as keyof typeof DOC_TYPE_ICONS] ?? FileQuestionIcon
    );
}
