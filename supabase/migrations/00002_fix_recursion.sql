-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Fix: Infinite Recursion on Memberships                     ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- 1. Drop the old, buggy policy if it exists
drop policy if exists "Memberships viewable by involved parties" on public.memberships;
drop policy if exists "Memberships viewable by users and creators" on public.memberships; -- checking for alternate name

-- 2. Create the corrected, non-recursive policy
-- This allows:
-- (a) Users to see their OWN membership
-- (b) Creators to see memberships for the communities THEY created (via communities table, not memberships)
create policy "Memberships viewable by involved parties" on public.memberships
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.communities c 
    where c.id = community_id 
    and c.creator_id = auth.uid()
  )
);
