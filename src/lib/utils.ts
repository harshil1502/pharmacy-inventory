import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-CA').format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getAgingColor(days: number | null): string {
  if (days === null) return 'text-gray-500';
  if (days <= 30) return 'text-green-600';
  if (days <= 90) return 'text-yellow-600';
  if (days <= 180) return 'text-orange-600';
  return 'text-red-600';
}

export function getAgingBadgeColor(days: number | null): string {
  if (days === null) return 'bg-gray-100 text-gray-700';
  if (days <= 30) return 'bg-green-100 text-green-700';
  if (days <= 90) return 'bg-yellow-100 text-yellow-700';
  if (days <= 180) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    case 'counter_offer':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getMarketingStatusLabel(status: string): string {
  switch (status) {
    case 'C':
      return 'Current';
    case 'O':
      return 'Obsolete';
    case 'R':
      return 'Replacement';
    case 'S':
      return 'Special';
    default:
      return status;
  }
}

export function getOrderControlLabel(control: string): string {
  switch (control) {
    case 'N':
      return 'Normal';
    case 'P':
      return 'Protected';
    default:
      return control;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
