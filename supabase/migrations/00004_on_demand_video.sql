-- On-demand video library schema

create table if not exists public.video_categories (
  id                  uuid primary key default uuid_generate_v4(),
  community_id        uuid not null references public.communities(id) on delete cascade,
  name                text not null,
  description         text,
  featured            boolean not null default false,
  hidden              boolean not null default false,
  preview_image_url   text,
  preview_image_name  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index if not exists idx_video_categories_unique_name
  on public.video_categories(community_id, lower(name));

create index if not exists idx_video_categories_community_created
  on public.video_categories(community_id, created_at desc);

create table if not exists public.on_demand_videos (
  id                  uuid primary key default uuid_generate_v4(),
  community_id        uuid not null references public.communities(id) on delete cascade,
  class_id            uuid references public.classes(id) on delete set null,
  instructor_id       uuid references public.profiles(id) on delete set null,
  name                text not null,
  video_type          text not null check (video_type in ('video_file', 'vimeo_link', 'youtube_link')),
  video_link          text,
  video_file_name     text,
  preview_image_url   text,
  preview_image_name  text,
  playlist_link       text,
  description         text,
  rental_price_cents  integer not null default 0,
  status              text not null default 'live' check (status in ('live', 'hidden', 'draft')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_on_demand_videos_community_created
  on public.on_demand_videos(community_id, created_at desc);

create table if not exists public.on_demand_video_categories (
  on_demand_video_id  uuid not null references public.on_demand_videos(id) on delete cascade,
  video_category_id   uuid not null references public.video_categories(id) on delete cascade,
  created_at          timestamptz not null default now(),
  primary key (on_demand_video_id, video_category_id)
);

create index if not exists idx_on_demand_video_categories_category
  on public.on_demand_video_categories(video_category_id);

alter table public.video_categories enable row level security;
alter table public.on_demand_videos enable row level security;
alter table public.on_demand_video_categories enable row level security;

-- video_categories policies
create policy "Video categories visible to community"
on public.video_categories for select
using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
  or exists (
    select 1
    from public.memberships m
    where m.community_id = video_categories.community_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

create policy "Creator inserts video categories"
on public.video_categories for insert
with check (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

create policy "Creator updates video categories"
on public.video_categories for update
using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

create policy "Creator deletes video categories"
on public.video_categories for delete
using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

-- on_demand_videos policies
create policy "On-demand videos visible to community"
on public.on_demand_videos for select
using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
  or exists (
    select 1
    from public.memberships m
    where m.community_id = on_demand_videos.community_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

create policy "Creator inserts on-demand videos"
on public.on_demand_videos for insert
with check (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

create policy "Creator updates on-demand videos"
on public.on_demand_videos for update
using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

create policy "Creator deletes on-demand videos"
on public.on_demand_videos for delete
using (
  exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);

-- on_demand_video_categories policies
create policy "Video-category links visible to community"
on public.on_demand_video_categories for select
using (
  exists (
    select 1
    from public.on_demand_videos v
    where v.id = on_demand_video_categories.on_demand_video_id
      and (
        exists (select 1 from public.communities c where c.id = v.community_id and c.creator_id = auth.uid())
        or exists (
          select 1
          from public.memberships m
          where m.community_id = v.community_id
            and m.user_id = auth.uid()
            and m.status = 'active'
        )
      )
  )
);

create policy "Creator inserts video-category links"
on public.on_demand_video_categories for insert
with check (
  exists (
    select 1
    from public.on_demand_videos v
    join public.communities c on c.id = v.community_id
    where v.id = on_demand_video_categories.on_demand_video_id
      and c.creator_id = auth.uid()
  )
);

create policy "Creator deletes video-category links"
on public.on_demand_video_categories for delete
using (
  exists (
    select 1
    from public.on_demand_videos v
    join public.communities c on c.id = v.community_id
    where v.id = on_demand_video_categories.on_demand_video_id
      and c.creator_id = auth.uid()
  )
);

create trigger set_updated_at_video_categories
  before update on public.video_categories
  for each row execute function public.update_updated_at();

create trigger set_updated_at_on_demand_videos
  before update on public.on_demand_videos
  for each row execute function public.update_updated_at();
