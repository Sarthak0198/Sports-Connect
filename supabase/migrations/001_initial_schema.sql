-- ==============================================================================
-- SPORTS CONNECT - DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- File: supabase/migrations/001_initial_schema.sql
-- Description: Complete schema for sports networking and opportunity discovery.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Types & Helper Domains
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('athlete', 'coach', 'club', 'organizer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE organization_kind AS ENUM ('academy', 'club', 'school', 'college', 'institution', 'organizer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_category AS ENUM (
        'trial', 'tournament', 'competition', 'camp', 
        'coaching_program', 'scholarship', 'recruitment', 
        'academy_admission', 'event'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_status AS ENUM ('draft', 'published', 'closed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'submitted', 'under_review', 'shortlisted', 
        'accepted', 'rejected', 'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Utility Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. APPLICATION TABLES
-- ==============================================================================

-- Table 1: profiles (synchronized with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role_type NOT NULL DEFAULT 'athlete',
    city TEXT,
    state TEXT,
    bio TEXT,
    avatar_url TEXT,
    phone TEXT,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city_state ON public.profiles(city, state);

-- Table 2: sports
CREATE TABLE IF NOT EXISTS public.sports (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    category TEXT,
    icon TEXT,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sports_slug ON public.sports(slug);

-- Table 3: athlete_profiles
CREATE TABLE IF NOT EXISTS public.athlete_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_sport_id INT REFERENCES public.sports(id) ON DELETE SET NULL,
    position TEXT,
    playing_level TEXT CHECK (playing_level IN ('grassroots', 'school', 'district', 'state', 'national', 'international', 'recreational')),
    current_team TEXT,
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    dominant_hand TEXT CHECK (dominant_hand IN ('right', 'left', 'ambidextrous')),
    date_of_birth DATE,
    education TEXT,
    highlight_video_url TEXT,
    bio_extended TEXT,
    profile_completion_pct INT NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 4: coach_profiles
CREATE TABLE IF NOT EXISTS public.coach_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_sport_id INT REFERENCES public.sports(id) ON DELETE SET NULL,
    specializations TEXT[] DEFAULT '{}',
    qualifications TEXT[] DEFAULT '{}',
    experience_years INT NOT NULL DEFAULT 0,
    coaching_level TEXT,
    hourly_rate NUMERIC(10, 2),
    philosophy TEXT,
    is_accepting_trainees BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    kind organization_kind NOT NULL DEFAULT 'academy',
    description TEXT,
    logo_url TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    state TEXT,
    address TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_city_state ON public.organizations(city, state);

-- Table 6: organization_members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff', 'coach')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

-- Table 7: user_sports
CREATE TABLE IF NOT EXISTS public.user_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sport_id INT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    skill_level TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, sport_id)
);

-- Table 8: athlete_achievements
CREATE TABLE IF NOT EXISTS public.athlete_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    competition_name TEXT NOT NULL,
    year INT NOT NULL,
    sport_id INT REFERENCES public.sports(id) ON DELETE SET NULL,
    medal TEXT CHECK (medal IN ('gold', 'silver', 'bronze', 'winner', 'runner_up', 'participation', 'special_award')),
    description TEXT,
    verification_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_athlete_achievements_athlete ON public.athlete_achievements(athlete_id);

-- Table 9: athlete_certificates
CREATE TABLE IF NOT EXISTS public.athlete_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuing_body TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    credential_id TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_athlete_certs_athlete ON public.athlete_certificates(athlete_id);

-- Table 10: athlete_statistics
CREATE TABLE IF NOT EXISTS public.athlete_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sport_id INT REFERENCES public.sports(id) ON DELETE SET NULL,
    metric_name TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    metric_unit TEXT,
    season_or_year TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_athlete_stats_athlete ON public.athlete_statistics(athlete_id);

-- Table 11: opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sport_id INT REFERENCES public.sports(id) ON DELETE SET NULL,
    category opportunity_category NOT NULL DEFAULT 'trial',
    city TEXT,
    state TEXT,
    venue_address TEXT,
    starts_on DATE,
    ends_on DATE,
    registration_deadline DATE,
    eligibility TEXT,
    min_age INT,
    max_age INT,
    skill_level TEXT,
    available_positions TEXT,
    application_fee TEXT DEFAULT 'Free',
    instructions TEXT,
    status opportunity_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_opportunity_dates CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on),
    CONSTRAINT chk_opportunity_deadline CHECK (registration_deadline IS NULL OR starts_on IS NULL OR registration_deadline <= starts_on)
);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_sport ON public.opportunities(sport_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_city_state ON public.opportunities(city, state);

-- Table 12: opportunity_applications
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'submitted',
    message TEXT,
    resume_url TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(opportunity_id, applicant_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_opp ON public.opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.opportunity_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.opportunity_applications(status);

-- Table 13: application_status_history
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.opportunity_applications(id) ON DELETE CASCADE,
    status application_status NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_history_app ON public.application_status_history(application_id);

-- Table 14: saved_opportunities
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON public.saved_opportunities(user_id);

-- Table 15: connections
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status connection_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (requester_id <> receiver_id),
    UNIQUE(requester_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_connections_users ON public.connections(requester_id, receiver_id);

-- Table 16: follows
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (follower_id <> following_id),
    UNIQUE(follower_id, following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_pair ON public.follows(follower_id, following_id);

-- Table 17: coaching_programs
CREATE TABLE IF NOT EXISTS public.coaching_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sport_id INT REFERENCES public.sports(id) ON DELETE SET NULL,
    duration_weeks INT,
    price NUMERIC(10, 2),
    location TEXT,
    schedule TEXT,
    max_trainees INT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 18: coaching_inquiries
CREATE TABLE IF NOT EXISTS public.coaching_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sport_id INT REFERENCES public.sports(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'archived')),
    reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_coach ON public.coaching_inquiries(coach_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON public.coaching_inquiries(user_id);

-- Table 19: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Table 20: reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'opportunity', 'organization', 'message')),
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ==============================================================================
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_athlete_profiles_updated_at BEFORE UPDATE ON public.athlete_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_coach_profiles_updated_at BEFORE UPDATE ON public.coach_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON public.opportunity_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. APPLICATION STATUS HISTORY TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION record_application_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.application_status_history (application_id, status, notes, changed_by)
        VALUES (NEW.id, NEW.status, 'Status updated to ' || NEW.status, NEW.reviewed_by);
        
        -- Also insert notification for applicant
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            NEW.applicant_id,
            'Application Update',
            'Your application status has been updated to: ' || UPPER(NEW.status::text),
            'application_status',
            '/applications'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_application_status_history
AFTER INSERT OR UPDATE ON public.opportunity_applications
FOR EACH ROW EXECUTE FUNCTION record_application_status_history();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is member of organization
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sports: Everyone can view
CREATE POLICY "Sports are publicly viewable" ON public.sports FOR SELECT USING (true);

-- Profiles: Public can view non-private profiles, user can view and edit own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (visibility = 'public' OR auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Athlete profiles: Viewable according to parent profile visibility, owner can CRUD
CREATE POLICY "Athlete profiles viewable" ON public.athlete_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = athlete_profiles.id AND (p.visibility = 'public' OR p.id = auth.uid()))
    );
CREATE POLICY "Athletes can insert own profile" ON public.athlete_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Athletes can update own profile" ON public.athlete_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Coach profiles: Viewable by everyone, owner can CRUD
CREATE POLICY "Coach profiles viewable" ON public.coach_profiles FOR SELECT USING (true);
CREATE POLICY "Coaches can insert own profile" ON public.coach_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Coaches can update own profile" ON public.coach_profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations: Viewable by everyone, members can manage
CREATE POLICY "Organizations are publicly viewable" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create organization" ON public.organizations FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Org members can update organization" ON public.organizations
    FOR UPDATE USING (is_org_member(id, auth.uid()) OR auth.uid() = created_by);

-- Organization members: Members viewable, owners manage
CREATE POLICY "Org members viewable by all" ON public.organization_members FOR SELECT USING (true);
CREATE POLICY "Org owners manage members" ON public.organization_members
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.created_by = auth.uid())
    );

-- User sports: Viewable by all, editable by owner
CREATE POLICY "User sports viewable by all" ON public.user_sports FOR SELECT USING (true);
CREATE POLICY "Users manage own sports" ON public.user_sports FOR ALL USING (auth.uid() = user_id);

-- Achievements & Stats & Certificates: Viewable by all, editable by athlete
CREATE POLICY "Achievements viewable by all" ON public.athlete_achievements FOR SELECT USING (true);
CREATE POLICY "Athletes manage own achievements" ON public.athlete_achievements FOR ALL USING (auth.uid() = athlete_id);

CREATE POLICY "Certificates viewable by all" ON public.athlete_certificates FOR SELECT USING (true);
CREATE POLICY "Athletes manage own certificates" ON public.athlete_certificates FOR ALL USING (auth.uid() = athlete_id);

CREATE POLICY "Statistics viewable by all" ON public.athlete_statistics FOR SELECT USING (true);
CREATE POLICY "Athletes manage own statistics" ON public.athlete_statistics FOR ALL USING (auth.uid() = athlete_id);

-- Opportunities: Published viewable by all, org members can see and manage draft/closed
CREATE POLICY "Published opportunities are viewable by all" ON public.opportunities
    FOR SELECT USING (
        status = 'published' OR 
        auth.uid() = created_by OR 
        (org_id IS NOT NULL AND is_org_member(org_id, auth.uid()))
    );
CREATE POLICY "Org managers can insert opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND 
        (org_id IS NULL OR is_org_member(org_id, auth.uid()) OR EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND created_by = auth.uid()))
    );
CREATE POLICY "Org managers can update opportunities" ON public.opportunities
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        (org_id IS NOT NULL AND is_org_member(org_id, auth.uid()))
    );
CREATE POLICY "Org managers can delete opportunities" ON public.opportunities
    FOR DELETE USING (
        auth.uid() = created_by OR 
        (org_id IS NOT NULL AND is_org_member(org_id, auth.uid()))
    );

-- Applications: Applicants see own, organizers see for their opportunities
CREATE POLICY "Applicants see own applications" ON public.opportunity_applications
    FOR SELECT USING (
        auth.uid() = applicant_id OR 
        EXISTS (
            SELECT 1 FROM public.opportunities o 
            WHERE o.id = opportunity_applications.opportunity_id 
            AND (o.created_by = auth.uid() OR (o.org_id IS NOT NULL AND is_org_member(o.org_id, auth.uid())))
        )
    );
CREATE POLICY "Athletes can apply once" ON public.opportunity_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicants can withdraw own application" ON public.opportunity_applications
    FOR UPDATE USING (auth.uid() = applicant_id AND status = 'submitted');
CREATE POLICY "Organizers can update application status" ON public.opportunity_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.opportunities o 
            WHERE o.id = opportunity_applications.opportunity_id 
            AND (o.created_by = auth.uid() OR (o.org_id IS NOT NULL AND is_org_member(o.org_id, auth.uid())))
        )
    );

-- Saved Opportunities: Owner only
CREATE POLICY "Users view own saved opportunities" ON public.saved_opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved opportunities" ON public.saved_opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved opportunities" ON public.saved_opportunities FOR DELETE USING (auth.uid() = user_id);

-- Connections: Participants can view and manage
CREATE POLICY "Participants view connections" ON public.connections
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users initiate connection requests" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Receiver manages connection" ON public.connections
    FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = requester_id);
CREATE POLICY "Participants delete connection" ON public.connections
    FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Follows: Viewable by all, follower manages
CREATE POLICY "Follows are viewable" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Follower can insert follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Follower can delete follow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Coaching Inquiries: Coach and sender can view/reply
CREATE POLICY "Participants view coaching inquiries" ON public.coaching_inquiries
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = coach_id);
CREATE POLICY "Users send coaching inquiries" ON public.coaching_inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Coach updates inquiry" ON public.coaching_inquiries
    FOR UPDATE USING (auth.uid() = coach_id);

-- Notifications: User only
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('org-logos', 'org-logos', true),
    ('certificates', 'certificates', false),
    ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Public avatars & logos can be viewed by anyone
CREATE POLICY "Public avatars are viewable by anyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public org logos are viewable by anyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'org-logos');
CREATE POLICY "Authenticated users can upload org logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'org-logos' AND auth.role() = 'authenticated');
