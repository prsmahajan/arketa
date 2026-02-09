-- Fix memberships SELECT policy: remove self-reference that causes 500
drop policy if exists "Memberships viewable by involved parties" on public.memberships;
create policy "Memberships viewable by involved parties" on public.memberships for select using (
  auth.uid() = user_id
  or exists (select 1 from public.communities c where c.id = community_id and c.creator_id = auth.uid())
);
