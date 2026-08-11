-- Phase 1 — projects and tasks tables, RLS, policies, index.
-- Re-appliable: every statement is guarded (if not exists / drop policy if exists).

-- ---------------------------------------------------------------------------
-- 1. projects
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  name        text        not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. tasks
-- ---------------------------------------------------------------------------

create table if not exists public.tasks (
  id         uuid        primary key default gen_random_uuid(),
  project_id uuid        not null references public.projects (id) on delete cascade,
  title      text        not null,
  status     text        not null default 'todo'
               constraint tasks_status_check check (status in ('todo', 'in_progress', 'done')),
  position   integer     not null,
  due_date   date,
  created_at timestamptz not null default now()
);

-- Every board query filters by project_id.
create index if not exists tasks_project_id_idx on public.tasks (project_id);

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.tasks    enable row level security;

-- ---------------------------------------------------------------------------
-- 4. Policies — projects: the row is the user's own
-- ---------------------------------------------------------------------------

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own on public.projects
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own on public.projects
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 5. Policies — tasks: ownership is inherited from the parent project
-- ---------------------------------------------------------------------------

drop policy if exists tasks_select_own on public.tasks;
create policy tasks_select_own on public.tasks
  for select to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );

drop policy if exists tasks_insert_own on public.tasks;
create policy tasks_insert_own on public.tasks
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );

drop policy if exists tasks_update_own on public.tasks;
create policy tasks_update_own on public.tasks
  for update to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );

drop policy if exists tasks_delete_own on public.tasks;
create policy tasks_delete_own on public.tasks
  for delete to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );
