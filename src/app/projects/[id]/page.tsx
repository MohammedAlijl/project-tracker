import { redirect } from "next/navigation";

import AppHeader from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";

import BoardClient from "./board-client";

export default async function BoardPage({ params }: PageProps<"/projects/[id]">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <>
      <AppHeader email={user.email ?? ""} />
      <BoardClient projectId={id} />
    </>
  );
}
