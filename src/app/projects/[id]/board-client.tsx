"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ConfirmDelete from "@/components/confirm-delete";
import ProjectModal from "@/components/project-modal";
import { apiFetch } from "@/lib/api-client";
import { dueState, formatDueDate, taskCounter, toArabicDigits, today } from "@/lib/format";
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type ProjectDetail,
  type Task,
  type TaskStatus,
} from "@/lib/types";

import TaskModal, { type TaskDraft } from "./task-modal";

/** Matches the API: a task dropped in a column lands at its end. */
const POSITION_STEP = 10;

export default function BoardClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [currentDate] = useState(today);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const [taskModal, setTaskModal] = useState<{
    task: Task | null;
    status: TaskStatus;
  } | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  const [editingProject, setEditingProject] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);

  useEffect(() => {
    let active = true;

    apiFetch<ProjectDetail>(`/api/projects/${projectId}`).then((result) => {
      if (!active) return;
      if (result.ok) setProject(result.data);
      else setLoadError(result.error);
    });

    return () => {
      active = false;
    };
  }, [projectId]);

  const tasks = project?.tasks ?? [];
  const doneCount = tasks.filter((task) => task.status === "done").length;

  function replaceTask(updated: Task) {
    setProject((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((task) =>
              task.id === updated.id ? updated : task,
            ),
          }
        : current,
    );
  }

  /** Drop into another column: one PATCH carrying status and a new position. */
  async function moveTask(taskId: string, status: TaskStatus) {
    const moved = tasks.find((task) => task.id === taskId);
    if (!moved || moved.status === status) return;

    const positions = tasks
      .filter((task) => task.status === status)
      .map((task) => task.position);
    const position = Math.max(0, ...positions) + POSITION_STEP;

    const snapshot = project;
    setActionError(null);
    replaceTask({ ...moved, status, position });

    const result = await apiFetch<Task>(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, position }),
    });

    if (!result.ok) {
      setProject(snapshot); // put it back where the user found it
      setActionError(result.error);
      return;
    }
    replaceTask(result.data);
  }

  async function saveTask(draft: TaskDraft) {
    if (!taskModal) return;
    setSavingTask(true);
    setTaskError(null);

    const payload = {
      title: draft.title,
      status: draft.status,
      due_date: draft.due_date === "" ? null : draft.due_date,
    };

    const result = taskModal.task
      ? await apiFetch<Task>(`/api/tasks/${taskModal.task.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await apiFetch<Task>("/api/tasks", {
          method: "POST",
          body: JSON.stringify({ ...payload, project_id: projectId }),
        });

    setSavingTask(false);
    if (!result.ok) {
      setTaskError(result.error);
      return;
    }

    if (taskModal.task) {
      replaceTask(result.data);
    } else {
      const created = result.data;
      setProject((current) =>
        current ? { ...current, tasks: [...current.tasks, created] } : current,
      );
    }
    setTaskModal(null);
  }

  async function deleteTask() {
    if (!taskModal?.task) return;
    const id = taskModal.task.id;
    setDeletingTask(true);
    setTaskError(null);

    const result = await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
    setDeletingTask(false);

    if (!result.ok) {
      setTaskError(result.error);
      return;
    }

    setProject((current) =>
      current
        ? { ...current, tasks: current.tasks.filter((task) => task.id !== id) }
        : current,
    );
    setTaskModal(null);
  }

  async function saveProject(values: { name: string; description: string }) {
    setSavingProject(true);
    setProjectError(null);

    const result = await apiFetch<ProjectDetail>(`/api/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });

    setSavingProject(false);
    if (!result.ok) {
      setProjectError(result.error);
      return;
    }

    setProject((current) =>
      current
        ? { ...current, name: result.data.name, description: result.data.description }
        : current,
    );
    setEditingProject(false);
  }

  async function deleteProject() {
    setDeletingProject(true);
    setActionError(null);

    const result = await apiFetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (!result.ok) {
      setDeletingProject(false);
      setActionError(result.error);
      return;
    }

    router.push("/projects");
  }

  if (loadError) {
    return (
      <main className="w-full max-w-[1180px] mx-auto px-8 py-16 flex flex-col items-start gap-4">
        <p className="text-[15px] text-ink">{loadError}</p>
        <Link href="/projects" className="text-[13.5px] text-brand">
          العودة إلى المشاريع
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[1180px] mx-auto px-8 pt-[30px] pb-20">
      <Link
        href="/projects"
        className="text-[13px] text-muted-2 hover:text-brand inline-flex items-center gap-1.5 mb-[18px]"
      >
        <span>→</span>
        <span>المشاريع</span>
      </Link>

      <div className="flex items-end justify-between gap-5 mb-[30px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[23px] font-semibold tracking-[-0.01em]">
            {project?.name ?? "…"}
          </h1>
          <p className="text-[13.5px] text-muted">
            {project ? taskCounter(doneCount, tasks.length) : ""}
          </p>
        </div>

        {project && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setProjectError(null);
                setEditingProject(true);
              }}
              className="text-[13px] text-muted-2 hover:text-brand cursor-pointer"
            >
              تعديل المشروع
            </button>
            <ConfirmDelete
              label="حذف المشروع"
              pending={deletingProject}
              onConfirm={deleteProject}
            />
            <button
              type="button"
              onClick={() => {
                setTaskError(null);
                setTaskModal({ task: null, status: "todo" });
              }}
              className="h-9 px-[15px] bg-brand hover:bg-brand-hover text-white rounded-lg text-[13.5px] font-medium cursor-pointer inline-flex items-center gap-[7px]"
            >
              <span className="text-[15px] leading-none">+</span>
              <span>مهمة جديدة</span>
            </button>
          </div>
        )}
      </div>

      {actionError && (
        <p role="alert" className="mb-4 text-[13.5px] text-overdue-ink">
          {actionError}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks
            .filter((task) => task.status === status)
            .sort((a, b) => a.position - b.position);
          const isOver = dragOver === status;

          return (
            <div key={status} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[13.5px] font-semibold text-[#3A3A40]">
                  {STATUS_LABELS[status]}
                </span>
                <span className="min-w-[21px] text-center px-1.5 py-0.5 bg-chip rounded-md text-xs text-muted-2 tabular-nums">
                  {toArabicDigits(columnTasks.length)}
                </span>
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  if (dragOver !== status) setDragOver(status);
                }}
                onDragLeave={() => {
                  if (dragOver === status) setDragOver(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(null);
                  if (dragId) moveTask(dragId, status);
                  setDragId(null);
                }}
                className={`min-h-[430px] p-1.5 rounded-xl border border-dashed flex flex-col gap-2 transition-colors ${
                  isOver ? "bg-drop border-drop-line" : "bg-transparent border-transparent"
                }`}
              >
                {columnTasks.map((task) => {
                  const state = dueState(task, currentDate);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        setDragId(task.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragOver(null);
                      }}
                      onClick={() => {
                        setTaskError(null);
                        setTaskModal({ task, status });
                      }}
                      style={{ opacity: dragId === task.id ? 0.4 : 1 }}
                      className="bg-surface border border-line hover:border-line-hover rounded-[10px] px-3.5 py-[13px] cursor-grab flex flex-col gap-2.5"
                    >
                      <div className="text-[13.8px] leading-[1.55] font-medium text-pretty">
                        {task.title}
                      </div>

                      {state === "overdue" && (
                        <div>
                          <span className="inline-block px-2 py-[3px] rounded-md bg-overdue-bg text-overdue-ink text-[11.5px] font-medium">
                            متأخرة
                          </span>
                        </div>
                      )}
                      {state === "today" && (
                        <div>
                          <span className="inline-block px-2 py-[3px] rounded-md bg-today-bg text-brand-ink text-[11.5px] font-medium">
                            اليوم
                          </span>
                        </div>
                      )}
                      {state === "done" && (
                        <div>
                          <span className="inline-block px-2 py-[3px] rounded-md bg-done-bg text-done-ink text-[11.5px] font-medium">
                            تم
                          </span>
                        </div>
                      )}
                      {state === "future" && task.due_date && (
                        <div>
                          <span className="inline-block px-2 py-[3px] rounded-md bg-neutral-bg text-neutral-ink text-[11.5px] font-medium">
                            {formatDueDate(task.due_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {project && columnTasks.length === 0 && (
                  <div className="px-1.5 py-3.5 text-[12.5px] text-faint">
                    لا مهام هنا
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {taskModal && (
        <TaskModal
          key={taskModal.task?.id ?? "new"}
          task={taskModal.task}
          initialStatus={taskModal.status}
          pending={savingTask}
          deleting={deletingTask}
          error={taskError}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setTaskModal(null)}
        />
      )}

      {editingProject && project && (
        <ProjectModal
          project={project}
          pending={savingProject}
          error={projectError}
          onSave={saveProject}
          onClose={() => setEditingProject(false)}
        />
      )}
    </main>
  );
}
