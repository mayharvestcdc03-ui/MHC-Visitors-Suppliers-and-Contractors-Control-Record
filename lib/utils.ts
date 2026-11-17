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
  const masked = '•'.repeat(Math.max(4, idNumber.length - 4));
  return `${start}${masked}${end}`;
}

export interface VisitorTheme {
  name: string;
  color: string;      // Main theme color
  bgLight: string;    // Light tint for validity box
  badgeText: string;  // Badge text color (usually white, or dark for yellow)
  prefix: string;     // Unique pass prefix
}

/**
 * Returns color theme and code prefix depending on Visitor Type
 * 1. Applicant - violet (#7c3aed)
 * 2. Supplier - red (#dc2626)
 * 3. Regulatory - LGU - green (#16a34a)
 * 4. Live truck - yellow (#ca8a04)
 * 5. Finish good truck - orange (#ea580c)
 * 6. Repair-engineering work - red (#dc2626)
 * 7. By product contractor - red (#dc2626)
 * 8. Peer group - green (#16a34a)
 * 9. Auditor - green (#16a34a)
 */
export function getVisitorTheme(visitorType: string = ''): VisitorTheme {
  const norm = visitorType.trim().toLowerCase();

  // 1. Applicant - violet
  if (norm.includes('applicant')) {
    return {
      name: 'Applicant',
      color: '#7c3aed',
      bgLight: '#f5f3ff',
      badgeText: '#ffffff',
      prefix: 'APPLICANT',
    };
  }

  // 2. Supplier - red
  if (norm.includes('supplier')) {
    return {
      name: 'Supplier',
      color: '#dc2626',
      bgLight: '#fef2f2',
      badgeText: '#ffffff',
      prefix: 'SUPPLIER',
    };
  }

  // 3. Regulatory - LGU - green
  if (norm.includes('regulatory') || norm.includes('lgu')) {
    return {
      name: 'Regulatory / LGU',
      color: '#16a34a',
      bgLight: '#f0fdf4',
      badgeText: '#ffffff',
      prefix: 'REGULATORY',
    };
  }

  // 4. Live truck - yellow
  if (norm.includes('live truck') || norm.includes('live-truck')) {
    return {
      name: 'Live Truck',
      color: '#ca8a04',
      bgLight: '#fefce8',
      badgeText: '#ffffff',
      prefix: 'LIVETRUCK',
    };
  }

  // 5. Finish good truck - orange
  if (norm.includes('finish') || norm.includes('fg truck') || norm.includes('goods truck')) {
    return {
      name: 'Finished Goods Truck',
      color: '#ea580c',
      bgLight: '#fff7ed',
      badgeText: '#ffffff',
      prefix: 'FGTRUCK',
    };
  }

  // 6. Repair-engineering work - red
  if (norm.includes('repair') || norm.includes('engineering')) {
    return {
      name: 'Repair / Engineering Work',
      color: '#dc2626',
      bgLight: '#fef2f2',
      badgeText: '#ffffff',
      prefix: 'REPAIR',
    };
  }

  // 7. By product contractor - red
  if (norm.includes('by product') || norm.includes('by-product') || norm.includes('byproduct')) {
    return {
      name: 'By-Product Contractor',
      color: '#dc2626',
      bgLight: '#fef2f2',
      badgeText: '#ffffff',
      prefix: 'CONTRACTOR',
    };
  }

  // 8. Peer group - green
  if (norm.includes('peer')) {
    return {
      name: 'Peer Group',
      color: '#16a34a',
      bgLight: '#f0fdf4',
      badgeText: '#ffffff',
      prefix: 'PEERGROUP',
    };
  }

  // 9. Auditor - green
  if (norm.includes('auditor') || norm.includes('audit')) {
    return {
      name: 'Auditor',
      color: '#16a34a',
      bgLight: '#f0fdf4',
      badgeText: '#ffffff',
      prefix: 'AUDITOR',
    };
  }

  // General Contractor - red
  if (norm.includes('contractor')) {
    return {
      name: 'Contractor',
      color: '#dc2626',
      bgLight: '#fef2f2',
      badgeText: '#ffffff',
      prefix: 'CONTRACTOR',
    };
  }

  // Default fallback - Navy / Standard Visitor
  return {
    name: visitorType || 'Visitor',
    color: '#17324d',
    bgLight: '#f3f6f9',
    badgeText: '#ffffff',
    prefix: 'VISITOR',
  };
}

/**
 * Generate formatted pass code e.g. MHC-APPLICANT-001, MHC-SUPPLIER-002
 */
export function generatePassCode(visitorType: string = 'Visitor', sequenceNumber?: number): string {
  const theme = getVisitorTheme(visitorType);
  const numStr = sequenceNumber !== undefined
    ? String(sequenceNumber).padStart(3, '0')
    : Math.floor(1 + Math.random() * 999).toString().padStart(3, '0');
  return `MHC-${theme.prefix}-${numStr}`;
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
