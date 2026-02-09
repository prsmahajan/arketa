-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Arketa - Community Wellness Platform                       ║
-- ║  Initial Schema Migration (Supabase + RevenueCat)           ║
-- ╚═══════════════════════════════════════════════════════════════╝

create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  avatar_url  text,
  role        text not null default 'member' check (role in ('creator', 'member')),
  rc_app_user_id text,  -- RevenueCat app user ID (defaults to supabase uid)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Communities ─────────────────────────────────────────────
create table public.communities (
  id                  uuid primary key default uuid_generate_v4(),
  creator_id          uuid not null unique references public.profiles(id) on delete cascade,
  name                text not null,
  slug                text not null unique,
  description         text,
  image_url           text,
  -- RevenueCat product IDs configured in RC dashboard
  membership_entitlement_id text, -- e.g. "community_membership"
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_communities_slug on public.communities(slug);

-- ─── Memberships ─────────────────────────────────────────────
create table public.memberships (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  community_id          uuid not null references public.communities(id) on delete cascade,
  status                text not null default 'active' check (status in ('active', 'inactive', 'cancelled')),
  rc_entitlement_id     text,  -- RevenueCat entitlement that granted this
  joined_at             timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  unique(user_id, community_id)
);

create index idx_memberships_community on public.memberships(community_id);

-- ─── Programs ────────────────────────────────────────────────
create table public.programs (
  id            uuid primary key default uuid_generate_v4(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  name          text not null,
  description   text,
  image_url     text,
  start_date    date not null,
  end_date      date not null,
  price_cents   integer not null default 0,   -- display price (actual price in RC/app stores)
  capacity      integer,
  visibility    text not null default 'public' check (visibility in ('public', 'private')),
  rc_product_id text,  -- RevenueCat product ID for this program
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_programs_community on public.programs(community_id);

-- ─── Program Members ─────────────────────────────────────────
create table public.program_members (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  program_id  uuid not null references public.programs(id) on delete cascade,
  status      text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  enrolled_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique(user_id, program_id)
);

create index idx_program_members_program on public.program_members(program_id);

-- ─── Posts ───────────────────────────────────────────────────
create table public.posts (
  id            uuid primary key default uuid_generate_v4(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  program_id    uuid references public.programs(id) on delete set null,
  content       text not null,
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_posts_community_date on public.posts(community_id, created_at desc);
create index idx_posts_program_date on public.posts(program_id, created_at desc) where program_id is not null;

-- ─── Comments ────────────────────────────────────────────────
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  post_id     uuid not null references public.posts(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_comments_post on public.comments(post_id, created_at asc);

-- ─── Likes ───────────────────────────────────────────────────
create table public.likes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  post_id     uuid not null references public.posts(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, post_id)
);

-- ─── Classes ─────────────────────────────────────────────────
create table public.classes (
  id                uuid primary key default uuid_generate_v4(),
  community_id      uuid not null references public.communities(id) on delete cascade,
  program_id        uuid references public.programs(id) on delete set null,
  title             text not null,
  description       text,
  date_time         timestamptz not null,
  duration_minutes  integer not null,
  location_type     text not null check (location_type in ('zoom', 'physical')),
  location_value    text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_classes_community_date on public.classes(community_id, date_time asc);

-- ─── Bookings ────────────────────────────────────────────────
create table public.bookings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  status      text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at  timestamptz not null default now(),
  unique(user_id, class_id)
);

create index idx_bookings_class on public.bookings(class_id);

-- ─── Purchases (synced from RevenueCat webhooks) ─────────────
create table public.purchases (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  rc_product_id       text not null,           -- RevenueCat product identifier
  rc_transaction_id   text unique,             -- store transaction ID
  rc_entitlement_id   text,                    -- entitlement granted
  store               text not null check (store in ('app_store', 'play_store', 'web', 'promotional')),
  amount_cents        integer,                 -- display amount (from RC event)
  currency            text default 'inr',
  type                text not null check (type in ('membership', 'program', 'class')),
  reference_id        uuid,                    -- community/program/class ID
  status              text not null default 'active' check (status in ('active', 'expired', 'refunded', 'cancelled')),
  purchased_at        timestamptz not null default now(),
  expires_at          timestamptz,             -- for subscriptions
  created_at          timestamptz not null default now()
);

create index idx_purchases_user on public.purchases(user_id, created_at desc);
create index idx_purchases_rc_transaction on public.purchases(rc_transaction_id);

-- ─── Weekly Prompts ──────────────────────────────────────────
create table public.weekly_prompts (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  content     text not null,
  week_number integer not null,
  created_at  timestamptz not null default now()
);

create index idx_prompts_program on public.weekly_prompts(program_id, week_number asc);

-- ─── Member Notes ────────────────────────────────────────────
create table public.member_notes (
  id            uuid primary key default uuid_generate_v4(),
  creator_id    uuid not null references public.profiles(id) on delete cascade,
  member_id     uuid not null references public.profiles(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  content       text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(creator_id, member_id, community_id)
);

-- ─── Engagement Streaks ──────────────────────────────────────
create table public.engagement_streaks (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  community_id        uuid not null references public.communities(id) on delete cascade,
  current_streak      integer not null default 0,
  longest_streak      integer not null default 0,
  last_activity_date  date,
  unique(user_id, community_id)
);


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Row Level Security Policies                                 ║
-- ╚═══════════════════════════════════════════════════════════════╝

alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.memberships enable row level security;
alter table public.programs enable row level security;
alter table public.program_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.classes enable row level security;
alter table public.bookings enable row level security;
alter table public.purchases enable row level security;
alter table public.weekly_prompts enable row level security;
alter table public.member_notes enable row level security;
alter table public.engagement_streaks enable row level security;

-- ── Profiles
create policy "Profiles viewable by everyone" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Profile created via trigger" on public.profiles for insert with check (auth.uid() = id);

-- ── Communities
create policy "Communities viewable by everyone" on public.communities for select using (true);
create policy "Creator updates own community" on public.communities for update using (auth.uid() = creator_id);
create policy "Creator inserts community" on public.communities for insert with check (auth.uid() = creator_id);

-- ── Memberships (no self-reference in policy to avoid 500)
create policy "Memberships viewable by involved parties" on public.memberships for select using (
  auth.uid() = user_id
  or exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);
create policy "Users join communities" on public.memberships for insert with check (auth.uid() = user_id);
create policy "Users update own membership" on public.memberships for update using (auth.uid() = user_id);

-- ── Programs
create policy "Programs viewable by authenticated" on public.programs for select using (auth.uid() is not null);
create policy "Creator creates programs" on public.programs for insert with check (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);
create policy "Creator updates programs" on public.programs for update using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

-- ── Program Members
create policy "Program members viewable" on public.program_members for select using (auth.uid() is not null);
create policy "Users enroll" on public.program_members for insert with check (auth.uid() = user_id);
create policy "Users update enrollment" on public.program_members for update using (auth.uid() = user_id);

-- ── Posts
create policy "Posts viewable by community" on public.posts for select using (
  deleted_at is null and (
    exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
    or exists (select 1 from public.memberships m where m.community_id = posts.community_id and m.user_id = auth.uid() and m.status = 'active')
  )
);
create policy "Members create posts" on public.posts for insert with check (
  auth.uid() = author_id and (
    exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
    or exists (select 1 from public.memberships m where m.community_id = community_id and m.user_id = auth.uid() and m.status = 'active')
  )
);
create policy "Author or creator soft-deletes posts" on public.posts for update using (
  auth.uid() = author_id
  or exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

-- ── Comments
create policy "Comments viewable" on public.comments for select using (
  deleted_at is null and exists (select 1 from public.posts p where p.id = post_id and p.deleted_at is null)
);
create policy "Users comment" on public.comments for insert with check (auth.uid() = author_id);
create policy "Author or creator soft-deletes comments" on public.comments for update using (
  auth.uid() = author_id
  or exists (select 1 from public.posts p join public.communities c on c.id = p.community_id where p.id = post_id and c.creator_id = auth.uid())
);

-- ── Likes
create policy "Likes viewable" on public.likes for select using (auth.uid() is not null);
create policy "Users like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users unlike" on public.likes for delete using (auth.uid() = user_id);

-- ── Classes
create policy "Classes viewable by community" on public.classes for select using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
  or exists (select 1 from public.memberships m where m.community_id = classes.community_id and m.user_id = auth.uid() and m.status = 'active')
);
create policy "Creator manages classes" on public.classes for insert with check (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);
create policy "Creator updates classes" on public.classes for update using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

-- ── Bookings
create policy "Users see own or creator sees all" on public.bookings for select using (
  auth.uid() = user_id
  or exists (select 1 from public.classes cl join public.communities c on c.id = cl.community_id where cl.id = class_id and c.creator_id = auth.uid())
);
create policy "Users book" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users cancel own booking" on public.bookings for update using (auth.uid() = user_id);

-- ── Purchases (inserted by RC webhook edge function with service role)
create policy "Users see own purchases" on public.purchases for select using (auth.uid() = user_id);

-- ── Weekly Prompts
create policy "Prompts viewable" on public.weekly_prompts for select using (auth.uid() is not null);
create policy "Creator manages prompts" on public.weekly_prompts for insert with check (
  exists (select 1 from public.programs p join public.communities c on c.id = p.community_id where p.id = program_id and c.creator_id = auth.uid())
);

-- ── Member Notes
create policy "Creator sees own notes" on public.member_notes for select using (auth.uid() = creator_id);
create policy "Creator writes notes" on public.member_notes for insert with check (auth.uid() = creator_id);
create policy "Creator updates notes" on public.member_notes for update using (auth.uid() = creator_id);

-- ── Engagement Streaks
create policy "Streaks viewable" on public.engagement_streaks for select using (auth.uid() is not null);
create policy "Users manage own streak" on public.engagement_streaks for insert with check (auth.uid() = user_id);
create policy "Users update own streak" on public.engagement_streaks for update using (auth.uid() = user_id);


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Functions & Triggers                                        ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, avatar_url, rc_app_user_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'member'),
    new.raw_user_meta_data->>'avatar_url',
    new.id::text  -- use supabase uid as RevenueCat app user ID
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-create community for creators
create or replace function public.handle_new_creator()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  if new.role = 'creator' then
    base_slug := lower(regexp_replace(new.name, '[^a-z0-9]+', '-', 'gi'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    while exists (select 1 from public.communities where slug = final_slug) loop
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    end loop;
    insert into public.communities (creator_id, name, slug)
    values (new.id, new.name || '''s Community', final_slug);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_creator();

-- updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.communities for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.programs for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.posts for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.comments for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.classes for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.member_notes for each row execute function public.update_updated_at();


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  RPC Functions                                               ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Community feed with counts
create or replace function public.get_community_feed(
  p_community_id uuid, p_user_id uuid, p_limit integer default 20, p_cursor timestamptz default null
) returns table (
  id uuid, author_id uuid, community_id uuid, program_id uuid,
  content text, image_url text, created_at timestamptz, updated_at timestamptz,
  author_name text, author_avatar text, author_role text,
  comment_count bigint, like_count bigint, is_liked boolean
) as $$
begin
  return query
  select p.id, p.author_id, p.community_id, p.program_id,
    p.content, p.image_url, p.created_at, p.updated_at,
    pr.name, pr.avatar_url, pr.role,
    (select count(*) from public.comments c where c.post_id = p.id and c.deleted_at is null),
    (select count(*) from public.likes l where l.post_id = p.id),
    exists(select 1 from public.likes l where l.post_id = p.id and l.user_id = p_user_id)
  from public.posts p
  join public.profiles pr on pr.id = p.author_id
  where p.community_id = p_community_id and p.program_id is null and p.deleted_at is null
    and (p_cursor is null or p.created_at < p_cursor)
  order by p.created_at desc limit p_limit;
end;
$$ language plpgsql security definer;

-- Program feed
create or replace function public.get_program_feed(
  p_program_id uuid, p_user_id uuid, p_limit integer default 20, p_cursor timestamptz default null
) returns table (
  id uuid, author_id uuid, community_id uuid, program_id uuid,
  content text, image_url text, created_at timestamptz, updated_at timestamptz,
  author_name text, author_avatar text, author_role text,
  comment_count bigint, like_count bigint, is_liked boolean
) as $$
begin
  return query
  select p.id, p.author_id, p.community_id, p.program_id,
    p.content, p.image_url, p.created_at, p.updated_at,
    pr.name, pr.avatar_url, pr.role,
    (select count(*) from public.comments c where c.post_id = p.id and c.deleted_at is null),
    (select count(*) from public.likes l where l.post_id = p.id),
    exists(select 1 from public.likes l where l.post_id = p.id and l.user_id = p_user_id)
  from public.posts p
  join public.profiles pr on pr.id = p.author_id
  where p.program_id = p_program_id and p.deleted_at is null
    and (p_cursor is null or p.created_at < p_cursor)
  order by p.created_at desc limit p_limit;
end;
$$ language plpgsql security definer;

-- Dashboard metrics
create or replace function public.get_dashboard_metrics(p_creator_id uuid)
returns json as $$
declare v_community_id uuid;
begin
  select id into v_community_id from public.communities where creator_id = p_creator_id;
  if v_community_id is null then
    return json_build_object('active_members', 0, 'program_enrollments', 0, 'monthly_revenue', 0);
  end if;
  return json_build_object(
    'active_members', (select count(*) from public.memberships where community_id = v_community_id and status = 'active'),
    'program_enrollments', (select count(*) from public.program_members pm join public.programs pr on pr.id = pm.program_id where pr.community_id = v_community_id and pm.status = 'active'),
    'monthly_revenue', coalesce((select sum(amount_cents)::float / 100 from public.purchases where status = 'active' and created_at > now() - interval '30 days' and (
      (type = 'membership' and reference_id = v_community_id)
      or (type = 'program' and reference_id in (select id from public.programs where community_id = v_community_id))
    )), 0)
  );
end;
$$ language plpgsql security definer;

-- Engagement stats
create or replace function public.get_engagement_stats(p_creator_id uuid)
returns json as $$
declare v_community_id uuid;
begin
  select id into v_community_id from public.communities where creator_id = p_creator_id;
  return json_build_object(
    'posts_this_week', (select count(*) from public.posts where community_id = v_community_id and deleted_at is null and created_at > now() - interval '7 days'),
    'comments_this_week', (select count(*) from public.comments c join public.posts p on p.id = c.post_id where p.community_id = v_community_id and c.deleted_at is null and c.created_at > now() - interval '7 days')
  );
end;
$$ language plpgsql security definer;

-- Update engagement streak
create or replace function public.update_engagement_streak(p_user_id uuid, p_community_id uuid)
returns void as $$
declare v_streak record; v_today date := current_date; v_diff integer;
begin
  select * into v_streak from public.engagement_streaks where user_id = p_user_id and community_id = p_community_id;
  if v_streak is null then
    insert into public.engagement_streaks (user_id, community_id, current_streak, longest_streak, last_activity_date)
    values (p_user_id, p_community_id, 1, 1, v_today);
    return;
  end if;
  if v_streak.last_activity_date = v_today then return; end if;
  v_diff := v_today - v_streak.last_activity_date;
  if v_diff = 1 then
    update public.engagement_streaks set current_streak = current_streak + 1, longest_streak = greatest(longest_streak, current_streak + 1), last_activity_date = v_today where id = v_streak.id;
  else
    update public.engagement_streaks set current_streak = 1, last_activity_date = v_today where id = v_streak.id;
  end if;
end;
$$ language plpgsql security definer;
