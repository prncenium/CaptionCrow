import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to conditionally merge Tailwind classes seamlessly.
 * It prevents class collisions when passing custom styles to components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}