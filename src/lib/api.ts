import { NextResponse } from "next/server";

import { createClient } from "./supabase/server";

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Server client + the verified user (null when there is no valid session). */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

/** Parsed JSON object, or null for a malformed / non-object body. */
export async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return null;
    }
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

/** A calendar date as `YYYY-MM-DD`, rejecting impossible days like 2026-02-31. */
export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "لا توجد جلسة" }, { status: 401 });
}

/**
 * Also used when the resource belongs to someone else: RLS hides those rows,
 * and answering 403 would confirm that the id exists.
 */
export function notFound() {
  return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
}

/** Never leak driver details to the client. */
export function serverError(cause: unknown) {
  console.error("[api]", cause);
  return NextResponse.json({ error: "خطأ غير متوقّع في الخادم" }, { status: 500 });
}
