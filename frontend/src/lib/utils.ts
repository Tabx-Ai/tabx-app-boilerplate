import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional classes without Tailwind conflicts (skill: always use this). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
