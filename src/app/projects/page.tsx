import { redirect } from "next/navigation";

import AppHeader from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";

import ProjectsClient from "./projects-client";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts checks this too, but that check is optimistic.
  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader email={user.email ?? ""} />
      <ProjectsClient />
    </>
  );
}
