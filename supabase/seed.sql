-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Seed Data - Run after auth users are created                ║
-- ║  NOTE: In Supabase, create users via the Auth API first,    ║
-- ║  then this seed data populates the remaining tables.         ║
-- ║                                                              ║
-- ║  Test accounts (create via Supabase Dashboard > Auth):       ║
-- ║    creator@arketa.dev / password123                          ║
-- ║      metadata: { "name": "Sarah Wellness", "role": "creator" }
-- ║    member1@arketa.dev / password123                          ║
-- ║      metadata: { "name": "Priya Sharma", "role": "member" }  ║
-- ║    member2@arketa.dev / password123                          ║
-- ║      metadata: { "name": "Arjun Patel", "role": "member" }   ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- After creating auth users in the Supabase dashboard, profiles
-- and communities will be auto-created by the database triggers.
--
-- You can then run the following to populate test data:

-- (Uncomment and adjust UUIDs after creating test users)

-- INSERT INTO public.programs (community_id, name, description, start_date, end_date, price_cents, capacity, visibility, rc_product_id)
-- SELECT c.id, '8-Week Mindfulness Journey',
--   'Transform your daily life with mindfulness practices.',
--   '2026-03-01', '2026-04-26', 99900, 20, 'public', 'program_mindfulness_8wk'
-- FROM public.communities c LIMIT 1;

-- INSERT INTO public.programs (community_id, name, description, start_date, end_date, price_cents, capacity, visibility)
-- SELECT c.id, 'Free Wellness Challenge',
--   'A free 2-week wellness challenge open to all members.',
--   '2026-03-01', '2026-03-15', 0, NULL, 'public'
-- FROM public.communities c LIMIT 1;
