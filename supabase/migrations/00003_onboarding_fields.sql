
alter table public.profiles add column if not exists creator_type text check (creator_type in ('studio', 'instructor'));
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists website text;
