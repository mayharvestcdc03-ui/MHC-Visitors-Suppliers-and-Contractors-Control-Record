import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskIdNumber(idNumber: string): string {
  if (!idNumber) return '—';
  if (idNumber.length <= 4) return '****';
  const start = idNumber.slice(0, 2);
  const end = idNumber.slice(-2);
  const masked = '*'.repeat(Math.max(4, idNumber.length - 4));
  return `${start}${masked}${end}`;
}

export function generatePassCode(): string {
  const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MHC-${segment1}-${segment2}`;
}

export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
