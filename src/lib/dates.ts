export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function todayISO(): string {
  const now = new Date();
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseISODate(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

export function formatISODate(value: string): string {
  const { year, month, day } = parseISODate(value);
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

export function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function dueDateInMonth(year: number, month: number, dueDay: number): string {
  const day = Math.min(Math.max(dueDay, 1), lastDayOfMonth(year, month));
  return toISODate(year, month, day);
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  const start = toISODate(year, month, 1);
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const end = toISODate(next.year, next.month, 1);
  return { start, end };
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function compareISODate(a: string, b: string): number {
  return a.localeCompare(b);
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseYearMonth(searchParams: {
  ano?: string | string[];
  mes?: string | string[];
}): { year: number; month: number } {
  const now = new Date();
  const year = Number(firstParam(searchParams.ano)) || now.getFullYear();
  const month = Number(firstParam(searchParams.mes)) || now.getMonth() + 1;
  const safeMonth = Math.min(12, Math.max(1, month));
  return { year, month: safeMonth };
}

export function monthQuery(year: number, month: number): string {
  return `ano=${year}&mes=${month}`;
}

export function addMonthsToISO(year: number, month: number, offset: number): { year: number; month: number } {
  return shiftMonth(year, month, offset);
}
