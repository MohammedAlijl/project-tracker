import { NextResponse } from "next/server";

import {
  badRequest,
  getUser,
  isNonEmptyString,
  isUuid,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

/** GET /api/projects/:id — one project with its tasks. */
export async function GET(_request: Request, context: Context) {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  if (!isUuid(id)) return notFound();

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,name,description,created_at,tasks(id,title,status,position,due_date,created_at)",
    )
    .eq("id", id)
    .order("position", { referencedTable: "tasks" })
    .maybeSingle();

  if (error) return serverError(error);
  if (!data) return notFound();

  return NextResponse.json(data);
}

/** PATCH /api/projects/:id — rename or re-describe. */
export async function PATCH(request: Request, context: Context) {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  if (!isUuid(id)) return notFound();

  const body = await readJson(request);
  if (!body) return badRequest("صيغة الطلب غير صالحة");

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (!isNonEmptyString(body.name)) {
      return badRequest("اسم المشروع لا يمكن أن يكون فارغاً");
    }
    updates.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return badRequest("الوصف يجب أن يكون نصاً");
    }
    updates.description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;
  }

  if (Object.keys(updates).length === 0) {
    return badRequest("لا يوجد حقل قابل للتعديل في الطلب");
  }

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select("id,name,description,created_at");

  if (error) return serverError(error);
  // No matching row: it does not exist, or RLS hides someone else's project.
  if (!data || data.length === 0) return notFound();

  return NextResponse.json(data[0]);
}

/** DELETE /api/projects/:id — tasks go with it via ON DELETE CASCADE. */
export async function DELETE(_request: Request, context: Context) {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  if (!isUuid(id)) return notFound();

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return serverError(error);
  if (!data || data.length === 0) return notFound();

  return NextResponse.json({ id });
}
