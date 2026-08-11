import type { Task } from "./types";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => ARABIC_DIGITS[+digit]);
}

/** `2026-08-20` → `٢٠ أغسطس` */
export function formatDueDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${toArabicDigits(Number(day))} ${MONTHS[Number(month) - 1]}`;
}

/** Today in the viewer's own timezone, as `YYYY-MM-DD`. */
export function today(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export type DueState = "done" | "overdue" | "today" | "future" | null;

/**
 * Lateness is derived at render time, never stored:
 * `due_date < today && status !== 'done'`.
 */
export function dueState(task: Task, currentDate: string): DueState {
  if (task.status === "done") return "done";
  if (!task.due_date) return null;
  if (task.due_date < currentDate) return "overdue";
  if (task.due_date === currentDate) return "today";
  return "future";
}

/** «٤ مشاريع نشطة» — Arabic needs a different noun form per count. */
export function projectsSubtitle(count: number): string {
  if (count === 0) return "لا مشاريع بعد";
  if (count === 1) return "مشروع واحد نشط";
  if (count === 2) return "مشروعان نشطان";
  if (count <= 10) return `${toArabicDigits(count)} مشاريع نشطة`;
  return `${toArabicDigits(count)} مشروعاً نشطاً`;
}

/** «٣ من ٩ مهام» */
export function taskCounter(done: number, total: number): string {
  if (total === 0) return "لا مهام بعد";
  const noun = total === 1 ? "مهمة" : total === 2 ? "مهمتين" : "مهام";
  return `${toArabicDigits(done)} من ${toArabicDigits(total)} ${noun}`;
}
