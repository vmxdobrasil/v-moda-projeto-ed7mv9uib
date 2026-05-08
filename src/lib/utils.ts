/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a Brazilian phone number by stripping non-digits
 * and prepending '55' if it's 10 or 11 digits.
 */
export function normalizePhoneBR(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return '55' + digits.substring(0, 2) + '9' + digits.substring(2)
  }
  if (digits.length === 11 && !digits.startsWith('55')) {
    return '55' + digits
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    return '55' + digits.substring(2, 4) + '9' + digits.substring(4)
  }
  return digits
}
