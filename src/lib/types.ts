/** Shared between the API routes and the client components. */

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Column titles from the design. `doing` there is `in_progress` here. */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "لم يبدأ",
  in_progress: "جارٍ",
  done: "مكتمل",
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  position: number;
  due_date: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

/** GET /api/projects */
export type ProjectSummary = Project & {
  task_count: number;
  completed_count: number;
};

/** GET /api/projects/:id */
export type ProjectDetail = Project & { tasks: Task[] };
