import { NextResponse } from "next/server";

import {
  badRequest,
  getUser,
  isDateString,
  isInteger,
  isNonEmptyString,
  isTaskStatus,
  isUuid,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

const COLUMNS = "id,project_id,title,status,position,due_date,created_at";

/** PATCH /api/tasks/:id — title, status, due date or position. */
export async function PATCH(request: Request, context: Context) {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  if (!isUuid(id)) return notFound();

  const body = await readJson(request);
  if (!body) return badRequest("صيغة الطلب غير صالحة");

  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) {
      return badRequest("عنوان المهمة لا يمكن أن يكون فارغاً");
    }
    updates.title = body.title.trim();
  }

  if (body.status !== undefined) {
    if (!isTaskStatus(body.status)) {
      return badRequest("الحالة يجب أن تكون todo أو in_progress أو done");
    }
    updates.status = body.status;
  }

  if (body.due_date !== undefined) {
    if (body.due_date !== null && !isDateString(body.due_date)) {
      return badRequest("تاريخ الاستحقاق يجب أن يكون بصيغة YYYY-MM-DD أو null");
    }
    updates.due_date = body.due_date;
  }

  if (body.position !== undefined) {
    if (!isInteger(body.position)) {
      return badRequest("الترتيب يجب أن يكون عدداً صحيحاً");
    }
    updates.position = body.position;
  }

  if (Object.keys(updates).length === 0) {
    return badRequest("لا يوجد حقل قابل للتعديل في الطلب");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select(COLUMNS);

  if (error) return serverError(error);
  // No matching row: it does not exist, or its project belongs to someone else.
  if (!data || data.length === 0) return notFound();

  return NextResponse.json(data[0]);
}

/** DELETE /api/tasks/:id */
export async function DELETE(_request: Request, context: Context) {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  if (!isUuid(id)) return notFound();

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return serverError(error);
  if (!data || data.length === 0) return notFound();

  return NextResponse.json({ id });
}
