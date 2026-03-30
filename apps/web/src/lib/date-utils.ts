// ─── Date arithmetic ─────────────────────────────────────────────────────────

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ─── Date formatting ─────────────────────────────────────────────────────────

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDateShort(d: Date): string {
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const yy = d.getFullYear().toString().slice(2);
  return `${mm}/${dd}/${yy}`;
}

export function formatDateLong(d: Date): string {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── Date comparison ─────────────────────────────────────────────────────────

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// ─── Month grids ─────────────────────────────────────────────────────────────

/** Returns (Date | null)[] — null for empty padding cells. Used by compact pickers. */
export function getMonthDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) for (let i = 0; i < remaining; i++) days.push(null);

  return days;
}

export interface MonthGridCell {
  date: Date;
  isCurrentMonth: boolean;
}

/** Returns full 6-row grid with prev/next month dates filled in. Used by calendars and schedule views. */
export function getMonthGrid(date: Date): MonthGridCell[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const startDow = firstDay.getDay();

  const cells: MonthGridCell[] = [];

  // Previous month trailing days
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Next month leading days — fill to 35 or 42 cells
  const target = cells.length > 35 ? 42 : 35;
  for (let d = 1; cells.length < target; d++) {
    cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
  }

  return cells;
}

// ─── Time helpers ────────────────────────────────────────────────────────────

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

let _idCounter = 0;
export function timeSlotId(): string {
  return `ts_${Date.now()}_${++_idCounter}`;
}

export function generateTimeOptions(): string[] {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'am' : 'pm';
      opts.push(`${h12}:${m.toString().padStart(2, '0')}${ampm}`);
    }
  }
  return opts;
}

export const TIME_OPTIONS = generateTimeOptions();

export function timeToMinutes(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (!m) return 0;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3] === 'am' && h === 12) h = 0;
  if (m[3] === 'pm' && h !== 12) h += 12;
  return h * 60 + min;
}

export function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  const aS = timeToMinutes(a.start);
  const aE = timeToMinutes(a.end);
  const bS = timeToMinutes(b.start);
  const bE = timeToMinutes(b.end);
  if (aS === aE || bS === bE) return false;
  return aS < bE && bS < aE;
}

export function findOverlappingPair(slots: TimeSlot[]): [number, number] | null {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slotsOverlap(slots[i], slots[j])) return [i, j];
    }
  }
  return null;
}

export function hasAnyOverlap(slots: TimeSlot[]): boolean {
  return findOverlappingPair(slots) !== null;
}
