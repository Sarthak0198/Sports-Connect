# Sports Connect — Technical Architecture

This document details the architectural design, security mechanisms, data flows, and component responsibilities of the **Sports Connect** platform.

---

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT TIER                                      |
|                                                                                   |
|  React 18 + Vite + Tailwind CSS (Deployed on Vercel)                              |
|  - Digital Sports Résumé & Print/PDF Engine                                      |
|  - Role-Aware Dashboards (Athlete, Coach, Club/Academy, Organizer)                |
|  - Opportunities Marketplace & Discovery Filters                                  |
|  - Supabase Auth Client (Session & JWT handling)                                  |
+-----------------------------------------------------------------------------------+
                               |                         |
               1. Auth Request |                         | 2. API Calls with JWT
               & JWT Issuance  |                         |    Authorization: Bearer <token>
                               v                         v
+-------------------------------+       +-------------------------------------------+
|         SUPABASE AUTH         |       |               BACKEND API                 |
|                               |       |                                           |
|  - Email/Password Management  |       |  Node.js + Express (Deployed on Render)   |
|  - JWT Issuance & Refresh     |       |  - CORS & Helmet Security Headers         |
|  - User Metadata Synchronization<--------- Token Verification (getUser)           |
+-------------------------------+       |  - Role-Based Access Control (RBAC)       |
                                        |  - Business Logic & Opportunity Tracking  |
                                        |  - Centralized Error & Audit Logging      |
                                        +-------------------------------------------+
                                                              |
                                                              | 3. Database Operations
                                                              |    (Request-Scoped Client)
                                                              v
+-----------------------------------------------------------------------------------+
|                                 DATABASE TIER                                     |
|                                                                                   |
|  Supabase PostgreSQL (Hosted Cloud DB)                                            |
|  - 20 Normalized Tables with Foreign Keys & Constraints                           |
|  - Strict Row Level Security (RLS) on all public tables                           |
|  - Automatic audit triggers (application status history, timestamps)              |
|  - Storage Buckets: avatars, org-logos, certificates, resumes                     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Authentication & Authorization Flow

### The Request Pipeline
1. **User Authentication**:
   - The user registers or signs in via Supabase Auth (`supabase.auth.signInWithPassword` or `signUp`).
   - Supabase cryptographically signs and returns a secure JWT access token.
2. **Profile Synchronization**:
   - The frontend calls Express `/api/v1/auth/sync` with `Authorization: Bearer <token>`.
   - The server verifies the token with Supabase and synchronizes `public.profiles` (mapping directly to `auth.users.id`).
3. **API Request Verification**:
   - For every protected REST call, the frontend attaches the Bearer token via the central `api` client (`frontend/src/api/client.js`).
   - Express authentication middleware (`backend/src/middleware/auth.js`) verifies the token cryptographically via `supabase.auth.getUser(token)`.
   - Never trusts arbitrary user IDs or roles passed in request bodies.
4. **Role Enforcement**:
   - Authorization middleware (`backend/src/middleware/role.js`) checks `req.user.role`.
   - Athletes can only apply to opportunities and edit their own achievements.
   - Organizers and Clubs can publish opportunities and update applicant statuses.

---

## 3. Database Schema Design (20 Normalized Tables)

| Domain | Table Name | Purpose | Key Relations |
|---|---|---|---|
| **Identity** | `profiles` | Base user profiles (synchronized with auth) | 1:1 with `auth.users(id)` |
| | `athlete_profiles` | Athletic stats, playing position, level | Foreign key to `profiles(id)` |
| | `coach_profiles` | Coaching credentials, hourly rates | Foreign key to `profiles(id)` |
| | `organizations` | Academies, clubs, institutions | Created by `profiles(id)` |
| | `organization_members` | Staff & club membership | Connects `organizations` & `profiles` |
| **Taxonomy** | `sports` | Master sports catalog (Cricket, Kabaddi, etc.) | Referenced by profiles & opps |
| | `user_sports` | User sports mapping & skill levels | Connects `profiles` & `sports` |
| **Athletic Résumé** | `athlete_achievements` | Medals, trophies, competition records | Belongs to `profiles(id)` |
| | `athlete_certificates` | Verified certificates & licenses | Belongs to `profiles(id)` |
| | `athlete_statistics` | Match & physical metrics (speed, yo-yo) | Belongs to `profiles(id)` |
| **Marketplace** | `opportunities` | Selection trials, tournaments, camps | Belongs to `organizations(id)` |
| | `opportunity_applications` | Applications submitted by athletes | Unique per `(opportunity_id, applicant_id)` |
| | `application_status_history` | Audit log of status transitions | Trigger-populated |
| | `saved_opportunities` | User bookmarked trials & camps | Unique per `(user_id, opportunity_id)` |
| **Networking** | `connections` | Athlete-coach connection requests | Unique pair `(requester_id, receiver_id)` |
| | `follows` | Public social follows | Unique pair `(follower_id, following_id)` |
| | `coaching_programs` | Structured training programs | Belongs to `coach_profiles(id)` |
| | `coaching_inquiries` | Direct inquiries between athlete & coach | Belongs to `coach_id` & `user_id` |
| **Platform** | `notifications` | In-app notification alerts | Belongs to `user_id` |
| | `reports` | Safeguarding & content reports | Submitter & target |

---

## 4. Row Level Security (RLS) Strategy

- **Least Privilege Principle**: By default, no table allows public modifications without verified authentication.
- **Data Encapsulation**: Private contact information is isolated from unauthenticated visitors.
- **Integrity Constraints**:
  - `auth.uid() = id` allows users to edit only their own achievements and statistics.
  - Applicants can never view another athlete's submitted application.
  - Organizers can only review applications for opportunities they created or are authorized members of.

---

## 5. Storage Architecture

Four dedicated Supabase Storage buckets:
- `avatars` (Public): Public profile photos stored under `avatars/<userId>/...`.
- `org-logos` (Public): Academy and club branding assets.
- `certificates` (Private): Training diplomas and accreditation documents.
- `resumes` (Private): Sensitive physical assessment records accessible only to applicant and reviewing selector.
