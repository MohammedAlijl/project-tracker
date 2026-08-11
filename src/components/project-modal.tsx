"use client";

import { useState } from "react";

import type { Project } from "@/lib/types";

/**
 * Not in the design — the prototype creates «مشروع بلا عنوان» with no input and
 * offers no way to rename it. Built in the same language as the task modal.
 */
export default function ProjectModal({
  project,
  pending,
  error,
  onSave,
  onClose,
}: {
  /** null → create */
  project: Project | null;
  pending: boolean;
  error: string | null;
  onSave: (values: { name: string; description: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-20 bg-[rgba(24,24,27,0.24)] backdrop-blur-[2px] flex items-center justify-center p-6 animate-fade"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[430px] bg-surface border border-[#EDEDE9] rounded-[14px] px-[26px] pt-[26px] pb-[22px] animate-pop"
      >
        <div className="text-[16.5px] font-semibold mb-[22px]">
          {project ? "تعديل المشروع" : "مشروع جديد"}
        </div>

        <form
          className="flex flex-col gap-[18px]"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ name, description });
          }}
        >
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-medium text-ink-soft">
              اسم المشروع
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثال: تطبيق الجوال"
              autoFocus
              className="h-[42px] px-3 text-sm bg-surface border border-line-input rounded-lg"
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-medium text-ink-soft">
              الوصف <span className="text-faint">(اختياري)</span>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="سطر يشرح هدف المشروع."
              rows={3}
              className="px-3 py-2 text-sm leading-relaxed bg-surface border border-line-input rounded-lg resize-none"
            />
          </label>

          {error && (
            <p role="alert" className="text-[13px] text-overdue-ink">
              {error}
            </p>
          )}

          <div className="mt-2 pt-[18px] border-t border-line-soft flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-[15px] bg-surface border border-line-input rounded-lg text-[13.5px] text-ink-soft hover:bg-drop cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-9 px-[17px] bg-brand hover:bg-brand-hover text-white rounded-lg text-[13.5px] font-medium cursor-pointer disabled:opacity-50"
            >
              {pending ? "جارٍ الحفظ…" : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
