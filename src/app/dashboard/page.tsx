import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already checks this, but that check is optimistic — the page
  // must not rely on it alone.
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-xl font-bold">لوحة التحكّم</h1>
      <p className="text-sm">
        مسجَّل الدخول باسم:{" "}
        <span dir="ltr" className="font-mono">
          {user.email}
        </span>
      </p>
      <LogoutButton />
    </main>
  );
}
