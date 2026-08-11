"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AppHeader({ email }: { email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="h-[60px] shrink-0 border-b border-line-header bg-surface flex items-center justify-between px-8">
      <Link href="/projects" className="flex items-center gap-[9px]">
        <span className="w-[9px] h-[9px] rounded-[3px] bg-brand" />
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          مسار
        </span>
      </Link>

      <div className="flex items-center gap-[14px]">
        <button
          type="button"
          onClick={signOut}
          disabled={pending}
          className="text-[13px] text-muted-2 hover:text-brand cursor-pointer disabled:opacity-50"
        >
          {pending ? "جارٍ الخروج…" : "خروج"}
        </button>
        <span className="w-px h-4 bg-line-input" />
        <span dir="ltr" className="text-[13px] text-muted">
          {email}
        </span>
        <span className="w-[29px] h-[29px] rounded-full bg-chip border border-line flex items-center justify-center text-[12.5px] font-semibold text-[#6b6b72] uppercase">
          {email.slice(0, 1)}
        </span>
      </div>
    </header>
  );
}
