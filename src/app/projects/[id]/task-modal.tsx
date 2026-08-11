"use client";

import { useState } from "react";

import ConfirmDelete from "@/components/confirm-delete";
import { STATUS_LABELS, TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";

export type TaskDraft = {
  title: string;
  due_date: string;
  status: TaskStatus;
};

export default function TaskModal({
  task,
  initialStatus,
  pending,
  deleting,
  error,
  onSave,
  onDelete,
  onClose,
}: {
  /** null → create */
  task: Task | null;
  initialStatus: TaskStatus;
  pending: boolean;
  deleting: boolean;
  error: string | null;
  onSave: (draft: TaskDraft) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? initialStatus);

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
          {task ? "تعديل المهمة" : "مهمة جديدة"}
        </div>

        <form
          className="flex flex-col gap-[18px]"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ title, due_date: dueDate, status });
          }}
        >
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-medium text-ink-soft">
              عنوان المهمة
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: مراجعة تدفق التسجيل"
              autoFocus
              className="h-[42px] px-3 text-sm bg-surface border border-line-input rounded-lg"
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-medium text-ink-soft">
              تاريخ الاستحقاق
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              dir="ltr"
              className="h-[42px] px-3 text-sm text-start bg-surface border border-line-input rounded-lg"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-ink-soft">الحالة</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F6F6F3] rounded-[9px]">
              {TASK_STATUSES.map((option) => {
                const active = status === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={`h-8 rounded-[7px] border text-[13px] font-medium cursor-pointer ${
                      active
                        ? "bg-surface text-ink border-line-input"
                        : "bg-transparent text-muted border-transparent"
                    }`}
                  >
                    {STATUS_LABELS[option]}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-overdue-ink">
              {error}
            </p>
          )}

          <div className="mt-2 pt-[18px] border-t border-line-soft flex items-center justify-between gap-2.5">
            {task ? (
              <ConfirmDelete
                label="حذف المهمة"
                pending={deleting}
                onConfirm={onDelete}
              />
            ) : (
              <span />
            )}

            <div className="flex gap-2 ms-auto">
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
          </div>
        </form>
      </div>
    </div>
  );
}
