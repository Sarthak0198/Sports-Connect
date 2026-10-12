-- ==============================================================================
-- SPORTS CONNECT - DATABASE SEED DATA
-- File: supabase/seed.sql
-- Description: Reference sports catalog, categories, and demonstration records.
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

-- Reset sequence for sports
SELECT setval('sports_id_seq', (SELECT MAX(id) FROM public.sports));

-- ==============================================================================
-- 2. DEMO USERS, COACH PROFILES & TRAINING CAMPS
-- Note: In Supabase, foreign keys on profiles reference `auth.users(id)`.
-- To seed auth users, run the automated seeder:
--   node --env-file=.env backend/scripts/seed-demo.js
--
-- The seeder populates:
--
-- A. COACH PROFILES:
--   1. Coach Vikram Rathore (coach.vikram@sportsconnect.in)
--      - Sport: Cricket
--      - Specializations: Fast Bowling Biomechanics, Match Tactics, Mental Conditioning
--      - Qualifications: BCCI Level 2, NSNIS Diploma
--      - Experience: 14 Years | Rate: ₹1,500/hr
--      - Program: Elite Pace Bowling & Match Tactics Academy (8 weeks)
--
--   2. Coach Ananya Roy (coach.ananya@sportsconnect.in)
--      - Sport: Badminton
--      - Specializations: Footwork & Agility, Tactical Strokeplay, Tournament Readiness
--      - Qualifications: BWF Level 1, Former National Champion
--      - Experience: 8 Years | Rate: ₹1,200/hr
--      - Program: Youth Badminton High-Performance Clinic (6 weeks)
--
-- B. TRAINING CAMPS & OPPORTUNITIES:
--   1. All-India National Athletics Summer Camp & Scholarship Combine
--      - Category: 'camp' | Sport: Athletics | City: New Delhi
--      - 4-Week intensive sprint, hurdle, and jump conditioning camp
--
--   2. Western Maharashtra Elite Kabaddi High-Altitude Training Camp
--      - Category: 'camp' | Sport: Kabaddi | City: Satara
--      - 2-Week stamina, mat agility, and core endurance camp
--
--   3. High Performance Fast Bowlers Summer Conditioning Camp 2026
--      - Category: 'camp' | Sport: Cricket | City: Mumbai
--      - Workload monitoring, biomechanics, and reverse swing camp
--
--   4. Junior Grassroots Badminton Development Camp & Coaching
--      - Category: 'camp' | Sport: Badminton | City: Hyderabad
--      - Court agility and tournament simulation camp
--
--   5. U-19 Maharashtra Kabaddi State Selection Trials 2026 (Category: 'trial')
--   6. Mumbai Premier Junior Cricket Trophy (Category: 'tournament')
--   7. Badminton Excellence Academy Admissions (Category: 'academy_admission')
-- ==============================================================================
