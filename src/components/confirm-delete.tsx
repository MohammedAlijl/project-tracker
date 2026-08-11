"use client";

import { useState } from "react";

/**
 * PRD §9 requires a confirmation before every delete. The design has none, so
 * the button turns into its own confirmation in place instead of stacking
 * another dialog on top of the modal.
 */
export default function ConfirmDelete({
  label,
  pending,
  onConfirm,
}: {
  label: string;
  pending: boolean;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="h-9 px-3 text-[13px] text-[#a5a59d] hover:text-overdue-ink cursor-pointer"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-muted">متأكد؟</span>
      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        className="h-9 px-2 font-medium text-overdue-ink cursor-pointer disabled:opacity-50"
      >
        {pending ? "جارٍ الحذف…" : "نعم، احذف"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={pending}
        className="h-9 px-2 text-muted-2 hover:text-ink cursor-pointer disabled:opacity-50"
      >
        تراجع
      </button>
    </div>
  );
}
