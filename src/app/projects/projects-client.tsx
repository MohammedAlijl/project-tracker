"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProjectModal from "@/components/project-modal";
import { apiFetch } from "@/lib/api-client";
import { projectsSubtitle, taskCounter, toArabicDigits } from "@/lib/format";
import type { ProjectSummary } from "@/lib/types";

export default function ProjectsClient() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    apiFetch<ProjectSummary[]>("/api/projects").then((result) => {
      if (!active) return;
      if (result.ok) setProjects(result.data);
      else setLoadError(result.error);
    });

    return () => {
      active = false;
    };
  }, []);

  async function createProject(values: { name: string; description: string }) {
    setSaving(true);
    setSaveError(null);

    const result = await apiFetch<ProjectSummary>("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        description: values.description,
      }),
    });

    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    setCreating(false);
    // A fresh project has no tasks yet; the API omits the counters on create.
    setProjects((current) => [
      { ...result.data, task_count: 0, completed_count: 0 },
      ...(current ?? []),
    ]);
  }

  return (
    <main className="w-full max-w-[1080px] mx-auto px-8 pt-11 pb-20">
      <div className="mb-[30px]">
        <h1 className="text-[23px] font-semibold tracking-[-0.01em] mb-1.5">
          المشاريع
        </h1>
        <p className="text-[13.5px] text-muted">
          {projects ? projectsSubtitle(projects.length) : "…"}
        </p>
      </div>

      {loadError && (
        <p role="alert" className="text-[13.5px] text-overdue-ink">
          {loadError}
        </p>
      )}

      <div className="grid gap-[18px] grid-cols-[repeat(auto-fill,minmax(272px,1fr))]">
        {(projects ?? []).map((project) => {
          const percent =
            project.task_count === 0
              ? 0
              : Math.round((project.completed_count / project.task_count) * 100);

          return (
            <button
              key={project.id}
              type="button"
              onClick={() => router.push(`/projects/${project.id}`)}
              className="text-start bg-surface border border-line hover:border-line-hover rounded-xl px-5 pt-5 pb-[18px] cursor-pointer flex flex-col gap-3.5"
            >
              <div className="flex flex-col gap-[7px]">
                <div className="text-[15px] font-semibold tracking-[-0.005em]">
                  {project.name}
                </div>
                <div className="text-[13px] text-muted leading-[1.65] min-h-[42px] text-pretty">
                  {project.description}
                </div>
              </div>

              <div className="flex flex-col gap-[9px]">
                <div className="h-1 bg-track rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[12.5px] text-muted-2">
                  <span>
                    {taskCounter(project.completed_count, project.task_count)}
                  </span>
                  <span className="tabular-nums">
                    {toArabicDigits(percent)}٪
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {projects && (
          <button
            type="button"
            onClick={() => {
              setSaveError(null);
              setCreating(true);
            }}
            className="border border-dashed border-dash hover:border-drop-line rounded-xl min-h-[152px] flex flex-col items-center justify-center gap-[9px] cursor-pointer text-[#9a9a93] hover:text-brand"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-[13.5px] font-medium">مشروع جديد</span>
          </button>
        )}
      </div>

      {creating && (
        <ProjectModal
          project={null}
          pending={saving}
          error={saveError}
          onSave={createProject}
          onClose={() => setCreating(false)}
        />
      )}
    </main>
  );
}
