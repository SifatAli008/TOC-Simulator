import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// For server-side rendering compatibility
export function generateIdSSR(): string {
  if (typeof window === 'undefined') {
    // Server-side: use a deterministic ID
    return `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
  return generateId()
}
