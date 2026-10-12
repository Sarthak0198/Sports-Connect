# Sports Connect — Connect. Compete. Grow.

> **Your Talent Deserves to Be Discovered.**
> A full-stack sports networking and opportunity-discovery platform for India, connecting athletes, coaches, clubs, academies, and event organizers nationwide.

---

## 1. Project Overview

In India, millions of talented grassroots athletes in tier-2 and tier-3 towns struggle to discover selection trials, certified coaching clinics, state tournaments, and sports scholarships before registration deadlines expire. Concurrently, state selectors, academies, and clubs lack a centralized, verified digital sports résumé to evaluate physical conditioning and competition statistics.

**Sports Connect** solves this problem by creating a dedicated sports-tech platform (modeled for sports networking) where:
- **Athletes** build a verified digital sports résumé with match statistics, medals, video drills, and apply directly to selection trials.
- **Coaches** publish training programs, showcase certifications, and receive structured coaching inquiries.
- **Academies & Clubs** discover upcoming athletic talent and manage admissions.
- **Event Organizers** publish trials, tournaments, and combines, review applicants, and issue status updates in real-time.

---

## 2. Technology Stack

- **Frontend**: React.js 18, JavaScript (ES Modules), Vite 5, Tailwind CSS 3, Lucide React icons, React Router 6.
- **Backend API**: Node.js, Express.js (REST API under `/api/v1`), Helmet, CORS, Rate Limiting, Centralized Error Handling.
- **Database & Auth**: Supabase PostgreSQL with 20 normalized tables, comprehensive Row Level Security (RLS) policies, and Supabase Auth.
- **Storage**: Supabase Storage buckets for avatars, organization logos, certificates, and resumes.
- **Hosting & DevOps**:
  - **Frontend**: Vercel (SPA with URL rewrite routing)
  - **Backend**: Render Web Service
  - **Source Control**: Git & GitHub

---

## 3. Project Structure

```
sports-connect/
├── frontend/                     # React + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── api/                 # API client & Supabase auth integration
│   │   ├── context/             # AuthContext (session, login, demo profiles)
│   │   ├── components/          # Reusable UI cards, badges, navbar, modals
│   │   ├── pages/               # 20+ responsive public & authenticated pages
│   │   ├── index.css            # Tailwind & sports styling design system
│   │   ├── App.jsx              # React Router & protected route guards
│   │   └── main.jsx             # React DOM root entry
│   ├── index.html               # SEO meta tags, Google Fonts (Inter, Outfit)
│   ├── tailwind.config.js       # Curated sports-tech color palette & tokens
│   ├── vite.config.js           # Vite dev server and proxy configuration
│   ├── vercel.json              # Vercel SPA rewrite rules
│   └── .env.example             # Frontend environment variables template
│
├── backend/                      # Node.js + Express REST API Service
│   ├── src/
│   │   ├── config/              # Environment config & Supabase clients
│   │   ├── middleware/          # JWT auth verification, RBAC, error handling
│   │   ├── controllers/         # Profile, opportunity, coach, application logic
│   │   ├── routes/              # Modular versioned routes (/api/v1/...)
│   │   ├── utils/               # Response helpers & realistic mock engine
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entry point listening on 0.0.0.0:PORT
│   ├── tests/                   # End-to-end API test suite (Node test runner)
│   ├── scripts/                 # Live Supabase Cloud seed script
│   └── .env.example             # Backend environment variables template
│
├── supabase/                     # Supabase PostgreSQL Configuration
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # 20 normalized tables, constraints & RLS
│   ├── seed.sql                 # Indian sports taxonomy & sample seed data
│   └── README.md                # Supabase database setup & security manual
│
├── docs/                         # Technical Architecture & Deployment Manuals
│   ├── ARCHITECTURE.md          # Data flow diagrams, RLS rules, and security
│   └── DEPLOYMENT.md            # Exact production steps for Render & Vercel
│
├── render.yaml                   # Render Blueprint configuration
├── .gitignore                    # Git exclusions (secrets, node_modules, dist)
└── package.json                  # Root orchestration scripts
```

---

## 4. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**

---

## 5. Local Installation & Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/sports-connect.git
cd sports-connect
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### Step 3: Configure Environment Variables
Copy `.env.example` in both directories:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

*(Note: The platform features a built-in demo engine out-of-the-box, allowing immediate zero-friction evaluation and testing before connecting your live Supabase Cloud project).*

---

## 6. Supabase Project Setup (Optional for Live DB)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase Dashboard:
   - Run `supabase/migrations/001_initial_schema.sql`.
   - Run `supabase/seed.sql`.
3. Retrieve your **Project URL**, **anon key**, and **service_role key** from **Project Settings** → **API**.
4. Paste them into `backend/.env` and `frontend/.env`.

---

## 7. Running the Application Locally

### Running the Backend Service
```bash
# From workspace root:
npm run dev:backend

# Or inside backend directory:
cd backend && npm run dev
```
Backend API will start at: `http://localhost:10000`
Health check: `http://localhost:10000/api/health`

### Running the Frontend
```bash
# From workspace root:
npm run dev:frontend

# Or inside frontend directory:
cd frontend && npm run dev
```
Frontend will launch at: `http://localhost:5173`

---

## 8. Instant Demo Account Quick-Fill

For fast presentation and testing, click any of the 1-click login buttons on the Sign In page (`/login`):
- 🏃 **Athlete**: `athlete.demo@sportsconnect.in` (Aarav Sharma — Fast Bowler & All-Rounder)
- 🧢 **Coach**: `coach.vikram@sportsconnect.in` (Coach Vikram Rathore — High Performance Cricket Coach)
- 🏛️ **Academy Admin**: `satara.academy@sportsconnect.in` (Satara District Kabaddi Association)
- 🏆 **Event Organizer**: `organizer.delhi@sportsconnect.in` (Delhi Youth Sports Foundation)

---

## 9. Automated Testing

Run the automated backend test suite covering health checks, authentication verification, role permissions, and opportunity workflows:
```bash
npm run test:backend
```

---

## 10. Production Deployment

Refer to [`docs/DEPLOYMENT.md`](file:///c:/Users/Sarthak/OneDrive/Desktop/Field%20Project/docs/DEPLOYMENT.md) for full instructions:
- **Backend on Render**: Uses `render.yaml` with root directory `backend`, start command `npm start`, and health check `/api/health`.
- **Frontend on Vercel**: Connect repository, set root directory to `frontend`, output directory to `dist`, and set `VITE_API_BASE_URL`.

---

## 11. Security Notes

- **Secret Keys Isolation**: The Supabase `service_role` secret key is strictly restricted to server-side code (`backend/src/config/supabase.js`) and never packaged into frontend client bundles.
- **Cryptographic Token Verification**: The Express API verifies the Bearer token with Supabase Auth rather than trusting unverified claims in request bodies.
- **Row Level Security**: Every PostgreSQL table is protected with granular RLS policies.
- **Minor Athlete Safeguarding**: Contact details of young athletes are shielded from unauthenticated visitors.

---

## License

ISC License. Built for India's sporting community.
