import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

export function useTimeFormat() {
  function formatUtc(dateString: string | Date, pattern = 'yyyy-MM-dd HH:mm:ss'): string {
    try {
      const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(d, pattern);
    } catch {
      return String(dateString);
    }
  }

  function formatShortDate(dateString: string | Date): string {
    return formatUtc(dateString, 'MMM dd, HH:mm');
  }

  function timeAgo(dateString: string | Date): string {
    try {
      const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return String(dateString);
    }
  }

  function getDurationHours(start: string | Date, end: string | Date): string {
    try {
      const s = typeof start === 'string' ? new Date(start).getTime() : start.getTime();
      const e = typeof end === 'string' ? new Date(end).getTime() : end.getTime();
      const diffMs = Math.max(0, e - s);
      const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
      return `${hours} hrs`;
    } catch {
      return '0 hrs';
    }
  }

  function isLiveNow(start: string | Date, end: string | Date): boolean {
    const now = new Date();
    const s = typeof start === 'string' ? new Date(start) : start;
    const e = typeof end === 'string' ? new Date(end) : end;
    return isAfter(now, s) && isBefore(now, e);
  }

  return {
    formatUtc,
    formatShortDate,
    timeAgo,
    getDurationHours,
    isLiveNow,
  };
}
