import { format, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatDate(date: Date | string, pattern = "yyyy-MM-dd"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
}

export function formatDateTime(date: Date | string, pattern = "MM-dd HH:mm"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm");
}

export function formatDateTimeLocal(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function formatDateTimeWithDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MM-dd HH:mm");
}

export function getAgeMonths(birthday: string): number {
  return differenceInMonths(new Date(), parseISO(birthday));
}

export function getAgeDays(birthday: string): number {
  return differenceInDays(new Date(), parseISO(birthday));
}

export function formatAge(birthday: string): string {
  const months = getAgeMonths(birthday);
  const days = getAgeDays(birthday);
  if (months < 1) {
    return `${days}天`;
  }
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  if (years === 0) {
    return `${months}个月`;
  }
  if (remainMonths === 0) {
    return `${years}岁`;
  }
  return `${years}岁${remainMonths}个月`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
}

export function calculateDuration(start: string, end: string): number {
  return Math.max(0, differenceInMinutes(parseISO(end), parseISO(start)));
}

export function isToday(dateStr: string): boolean {
  const today = format(new Date(), "yyyy-MM-dd");
  const target = format(parseISO(dateStr), "yyyy-MM-dd");
  return today === target;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function nowStr(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
}

export function getHoursMinutes(start: string, end: string): { hours: number; minutes: number } {
  const total = differenceInMinutes(parseISO(end), parseISO(start));
  return {
    hours: Math.floor(total / 60),
    minutes: total % 60,
  };
}
