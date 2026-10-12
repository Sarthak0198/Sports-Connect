# Sports Connect — Supabase Database & Security Guide

This folder contains the complete PostgreSQL database configuration, schema migrations, Row Level Security (RLS) policies, and reference seed data for **Sports Connect**.

## Architecture Overview

Sports Connect uses **Supabase PostgreSQL** as its primary data store:
- **Authentication**: `auth.users` manages user credentials, JWT issuance, and email confirmations.
- **Application Profiles**: `public.profiles` maps 1-to-1 with `auth.users.id` (UUID).
- **Security**: Strict Row Level Security (RLS) is enabled on all 20 public tables.
- **Storage**: Buckets for avatars, organization logos, resumes, and certificates.

---

## 1. Quick Setup in Supabase Cloud

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to your project's **SQL Editor**.
3. Open `migrations/001_initial_schema.sql`, copy all contents, paste into the SQL editor, and click **Run**.
4. Open `seed.sql`, copy all contents, paste into the SQL editor, and click **Run**.
5. Go to **Project Settings** → **API**:
   - Copy **Project URL** (`https://<project-ref>.supabase.co`)
   - Copy **anon public key** (for frontend)
   - Copy **service_role secret key** (for backend only; NEVER commit or expose in browser)

---

## 2. Table Catalog (20 Tables)

| # | Table Name | Purpose | Primary Access Policy |
|---|---|---|---|
| 1 | `profiles` | Base user profiles (synced with auth) | Public for visible profiles, self-edit |
| 2 | `sports` | Master sports taxonomy | Public read-only |
| 3 | `athlete_profiles` | Athletic stats, position, playing level | Public read if profile visible, owner CRUD |
| 4 | `coach_profiles` | Coaching credentials, rates, specializations | Public read, owner CRUD |
| 5 | `organizations` | Clubs, academies, schools, organizers | Public read, member update |
| 6 | `organization_members` | Staff and roles inside organizations | Public read, owner manage |
| 7 | `user_sports` | Sports played or coached by users | Public read, owner manage |
| 8 | `athlete_achievements` | Medals, trophies, competition records | Public read, athlete manage |
| 9 | `athlete_certificates` | Verified coaching/playing certifications | Public read, athlete manage |
| 10 | `athlete_statistics` | Game and season metrics (runs, goals, etc.) | Public read, athlete manage |
| 11 | `opportunities` | Trials, tournaments, camps, scholarships | Published public; drafts org-only |
| 12 | `opportunity_applications` | Applications submitted by athletes | Applicant & Opportunity Organizer only |
| 13 | `application_status_history` | Audit log of status transitions | Applicant & Opportunity Organizer only |
| 14 | `saved_opportunities` | User bookmarks for opportunities | Owner only |
| 15 | `connections` | Athlete-coach-peer networking graph | Requesting/receiving parties only |
| 16 | `follows` | Public social follows for updates | Public read, follower manage |
| 17 | `coaching_programs` | Structured courses and packages | Public read, coach manage |
| 18 | `coaching_inquiries` | Direct inquiries to coaches | Inquiring user and coach only |
| 19 | `notifications` | In-app notification center | Recipient only |
| 20 | `reports` | Safeguarding & content reporting | Submitter & admin |

---

## 3. Storage Buckets & Policies

- `avatars` (Public): Allows authenticated users to upload to their own UUID folder (`avatars/<userId>/...`).
- `org-logos` (Public): Allows authenticated org creators to upload logos.
- `certificates` (Private): Requires authenticated access or signed URLs.
- `resumes` (Private): Only accessible by the applicant and reviewing organizer.

---

## 4. Local Seed Script

To seed complete fictional demonstration profiles and opportunities in a live Supabase instance:
```bash
cd backend
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SECRET_KEY=your-service-role-key \
DEMO_PASSWORD=ChooseStrongPassword123! \
npm run seed:demo
```
