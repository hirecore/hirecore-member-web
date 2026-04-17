import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const tailwindUtils = (...inputs: ClassValue[]): string => {
    return twMerge(clsx(inputs));
}