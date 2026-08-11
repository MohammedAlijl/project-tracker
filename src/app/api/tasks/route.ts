import { NextResponse } from "next/server";

import {
  badRequest,
  getUser,
  isDateString,
  isNonEmptyString,
  isTaskStatus,
  isUuid,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

/** Gap between task positions, so an insert between two rows updates one row. */
const POSITION_STEP = 10;

/** POST /api/tasks — add a task to a project the user owns. */
export async function POST(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!body) return badRequest("صيغة الطلب غير صالحة");

  const projectId = body.project_id;
  if (!isUuid(projectId)) return badRequest("project_id مطلوب ويجب أن يكون UUID");

  if (!isNonEmptyString(body.title)) {
    return badRequest("عنوان المهمة مطلوب");
  }

  const status = body.status === undefined ? "todo" : body.status;
  if (!isTaskStatus(status)) {
    return badRequest("الحالة يجب أن تكون todo أو in_progress أو done");
  }

  let dueDate: string | null = null;
  if (body.due_date !== undefined && body.due_date !== null) {
    if (!isDateString(body.due_date)) {
      return badRequest("تاريخ الاستحقاق يجب أن يكون بصيغة YYYY-MM-DD");
    }
    dueDate = body.due_date;
  }

  // RLS hides other users' projects, so "not visible" and "does not exist"
  // are the same answer here: 404.
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) return serverError(projectError);
  if (!project) return notFound();

  // Last position in the target column, then step past it: 10, 20, 30…
  const { data: last, error: lastError } = await supabase
    .from("tasks")
    .select("position")
    .eq("project_id", projectId)
    .eq("status", status)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) return serverError(lastError);

  const position = (last?.position ?? 0) + POSITION_STEP;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: body.title.trim(),
      status,
      position,
      due_date: dueDate,
    })
    .select("id,project_id,title,status,position,due_date,created_at")
    .single();

  if (error) return serverError(error);

  return NextResponse.json(data, { status: 201 });
}
