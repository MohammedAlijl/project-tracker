import { NextResponse } from "next/server";

import {
  badRequest,
  getUser,
  isNonEmptyString,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type EmbeddedCount = { count: number }[];

/** GET /api/projects — the user's projects with task counters. */
export async function GET() {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  // One round trip: PostgREST turns each `tasks(count)` embed into an aggregate
  // over the joined rows, so there is no query per project. `done` is the same
  // relation filtered to completed tasks via `done.status=eq.done`.
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,description,created_at,total:tasks(count),done:tasks(count)")
    .eq("done.status", "done")
    .order("created_at", { ascending: false });

  if (error) return serverError(error);

  // An empty list is a successful read, not an error.
  const projects = (data ?? []).map((row) => {
    const { total, done, ...project } = row as typeof row & {
      total: EmbeddedCount;
      done: EmbeddedCount;
    };

    return {
      ...project,
      task_count: total[0]?.count ?? 0,
      completed_count: done[0]?.count ?? 0,
    };
  });

  return NextResponse.json(projects);
}

/** POST /api/projects — create a project owned by the current user. */
export async function POST(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!body) return badRequest("صيغة الطلب غير صالحة");

  if (!isNonEmptyString(body.name)) {
    return badRequest("اسم المشروع مطلوب");
  }
  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return badRequest("الوصف يجب أن يكون نصاً");
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : null;

  const { data, error } = await supabase
    .from("projects")
    // user_id is set here and re-checked by the RLS `with check` policy.
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      description: description || null,
    })
    .select("id,name,description,created_at")
    .single();

  if (error) return serverError(error);

  return NextResponse.json(data, { status: 201 });
}
