# Sports Connect — Deployment Guide

This guide details step-by-step instructions to deploy **Sports Connect** to production using **Supabase** (Database & Auth), **Render** (Node/Express API), and **Vercel** (React Frontend).

---

## 1. Supabase Cloud Setup (Database & Auth)

1. Sign up or log in at [supabase.com](https://supabase.com).
2. Click **New Project** and name it `sports-connect`. Choose a region close to your target users (e.g., `South Asia (Mumbai)`).
3. Once provisioned, open **SQL Editor**:
   - Copy the entire SQL contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
   - Copy the SQL contents of `supabase/seed.sql` and click **Run**.
4. Go to **Project Settings** → **API**:
   - Copy **Project URL** (e.g. `https://xyzcompany.supabase.co`).
   - Copy **anon public key**.
   - Copy **service_role secret key** (keep confidential).
5. Go to **Authentication** → **URL Configuration**:
   - Set Site URL to your Vercel deployment URL (e.g. `https://sports-connect.vercel.app`).
   - Add redirect URLs: `http://localhost:5173/**`, `https://your-vercel-domain.vercel.app/**`.

---

## 2. Deploy Backend to Render (Web Service)

1. Push your repository to GitHub (see Section 4 below).
2. Log in to [render.com](https://render.com) and click **New** → **Web Service**.
3. Select your GitHub repository.
4. Configure the Web Service:
   - **Name**: `sports-connect-api`
   - **Language**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Server port |
   | `FRONTEND_URL` | `https://your-app.vercel.app` | Production frontend domain |
   | `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Cloud URL |
   | `SUPABASE_PUBLISHABLE_KEY` | `your_anon_key` | Public anon key |
   | `SUPABASE_SECRET_KEY` | `your_service_role_key` | Secret service role key |
6. Click **Deploy Web Service**.
7. Once deployed, verify live operational health:
   ```bash
   curl https://your-backend-render-url.onrender.com/api/health
   ```
   Should respond with `{"success": true, "data": {"status": "healthy"}}`.

---

## 3. Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://your-backend-render-url.onrender.com/api/v1` |
   | `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `your_anon_key` |
5. Click **Deploy**.
6. When deployment finishes, test direct navigation to routes like `/opportunities` and `/athletes` to verify that `frontend/vercel.json` SPA rewrites are working.

---

## 4. Connecting Git & GitHub

If Git is not initialized on your local machine:
```bash
# 1. Initialize repository
git init

# 2. Add files (respects .gitignore)
git add .

# 3. Create initial commit
git commit -m "Initial commit: Complete Sports Connect full-stack application"

# 4. Link to your GitHub repository
git remote add origin https://github.com/<your-username>/sports-connect.git

# 5. Push main branch
git branch -M main
git push -u origin main
```

---

## 5. Deployment Verification Checklist

- [ ] Supabase migrations executed successfully without SQL errors.
- [ ] Render backend health check returns `200 OK` on `/api/health`.
- [ ] Vercel frontend loads cleanly with full Tailwind typography and custom styles.
- [ ] Direct browser refresh on `/opportunities` does not return 404 (handled by `vercel.json`).
- [ ] Cross-Origin Resource Sharing (CORS) permits requests from Vercel domain to Render backend.
