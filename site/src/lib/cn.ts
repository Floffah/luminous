import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export default function cn(...args: ClassValue[]): string {
    return twMerge(clsx(...args));
}
