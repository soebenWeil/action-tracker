-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles table keeps user metadata separate from auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  plan text not null default 'free',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  target_steps integer not null check (target_steps > 0),
  completed_steps integer not null default 0 check (completed_steps >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  completed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  status text not null,
  provider_id text,
  renews_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Helpful indexes
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_actions_goal on public.actions(goal_id);
create index if not exists idx_actions_user on public.actions(user_id);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

-- Trigger to keep goals.updated_at fresh
create or replace function public.handle_goal_update()
returns trigger as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trg_goals_updated_at
before update on public.goals
for each row execute procedure public.handle_goal_update();

-- Trigger to update completed steps when new actions land
create or replace function public.handle_action_insert()
returns trigger as $$
begin
  update public.goals
     set completed_steps = least(target_steps, completed_steps + 1),
         completed_at = case
           when completed_steps + 1 >= target_steps then timezone('utc', now())
           else completed_at
         end,
         updated_at = timezone('utc', now())
   where id = new.goal_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_actions_insert
after insert on public.actions
for each row execute procedure public.handle_action_insert();

-- Trigger to decrement when an action is removed
create or replace function public.handle_action_delete()
returns trigger as $$
begin
  update public.goals
     set completed_steps = greatest(0, completed_steps - 1),
         completed_at = case
           when completed_steps - 1 < target_steps then null
           else completed_at
         end,
         updated_at = timezone('utc', now())
   where id = old.goal_id;
  return old;
end;
$$ language plpgsql;

create trigger trg_actions_delete
after delete on public.actions
for each row execute procedure public.handle_action_delete();

-- Row Level Security policies
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.actions enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can read own goals" on public.goals
  for select using (auth.uid() = user_id);

create policy "Users manage own goals" on public.goals
  for insert with check (auth.uid() = user_id);

create policy "Users update own goals" on public.goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users delete own goals" on public.goals
  for delete using (auth.uid() = user_id);

create policy "Users can read own actions" on public.actions
  for select using (auth.uid() = user_id);

create policy "Users can insert own actions" on public.actions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own actions" on public.actions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own actions" on public.actions
  for delete using (auth.uid() = user_id);

create policy "Users manage their subscription" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep profile in sync with auth metadata on new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
