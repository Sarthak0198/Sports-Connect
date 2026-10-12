-- ==============================================================================
-- SPORTS CONNECT - DATABASE SEED DATA
-- File: supabase/seed.sql
-- Description: Reference sports catalog, categories, and fictional demonstration records.
-- ==============================================================================

-- 1. Sports Reference Catalog
INSERT INTO public.sports (id, name, slug, category, icon, is_popular) VALUES
    (1, 'Cricket', 'cricket', 'Team Sports', 'Award', true),
    (2, 'Football', 'football', 'Team Sports', 'Trophy', true),
    (3, 'Badminton', 'badminton', 'Racket Sports', 'Zap', true),
    (4, 'Kabaddi', 'kabaddi', 'Contact Sports', 'Flame', true),
    (5, 'Athletics (Track & Field)', 'athletics', 'Individual Sports', 'Timer', true),
    (6, 'Field Hockey', 'field-hockey', 'Team Sports', 'Shield', true),
    (7, 'Basketball', 'basketball', 'Team Sports', 'Activity', true),
    (8, 'Volleyball', 'volleyball', 'Team Sports', 'Users', true),
    (9, 'Tennis', 'tennis', 'Racket Sports', 'Target', true),
    (10, 'Table Tennis', 'table-tennis', 'Racket Sports', 'Compass', false),
    (11, 'Swimming', 'swimming', 'Aquatics', 'Droplets', true),
    (12, 'Boxing', 'boxing', 'Combat Sports', 'Swords', true),
    (13, 'Wrestling', 'wrestling', 'Combat Sports', 'Medal', true),
    (14, 'Shooting', 'shooting', 'Precision Sports', 'Crosshair', false),
    (15, 'Archery', 'archery', 'Precision Sports', 'Disc', false),
    (16, 'Chess', 'chess', 'Mind Sports', 'Brain', false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    is_popular = EXCLUDED.is_popular;

-- Reset sequence for sports if needed
SELECT setval('sports_id_seq', (SELECT MAX(id) FROM public.sports));

-- ==============================================================================
-- Note for demo users:
-- In Supabase, users must exist in `auth.users` before profiles can reference them.
-- To populate demo users without breaking foreign keys, run `node backend/scripts/seed-demo.js`
-- or use the Express backend's built-in demo mode which simulates these users.
-- ==============================================================================
