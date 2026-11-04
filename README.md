# Klean Max Pro QMS — Enterprise Multi-Company Architecture
### Unified Cloud Stack: Supabase (PostgreSQL) + Railway (FastAPI Backend) + Vercel (React Frontend)

A full-stack Commercial Quotation Automation and Area-Based Pricing System tailored for 4 operating subsidiaries with a Unified Master Admin and 5 specialized dashboards.

---

## 🏢 Integrated Companies

1. **⚡ Klean Max Pro** (`KMP`): Commercial Floor Scrubbing, Mechanized Warehouse Deep Cleaning & Area-Based Slabs.
2. **🔧 Kleanmax** (`KLM`): Equipment Sales (Ride-On & Walk-Behind Scrubbers), Machine Maintenance & Spare Parts Catalog.
3. **🎨 Unique Painters** (`UNP`): Interior Luxury Emulsions, Exterior Weatherproof Coatings, 1000-Micron Epoxy Flooring & Waterproofing.
4. **🌿 Cleantech Services** (`CTS`): Robotic Solar Panel Array Wash, High-Rise Glass Facade Cradles, Kitchen Duct Degreasing & Annual Maintenance Contracts (AMC).
5. **🌐 Unified Admin (Master Hub)**: Consolidated pipeline, 5 dashboards, cross-company quotation approvals, and centralized editable company configuration.

---

## ☁️ Cloud Deployment Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │               VERCEL (Frontend)               │
                    │   React 18 + Vite + TailwindCSS + TS          │
                    │   Deployed from /frontend or root             │
                    └───────────────────────┬───────────────────────┘
                                            │ API Requests (REST/JSON)
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │               RAILWAY (Backend)               │
                    │   FastAPI Python 3.11 Container (Dockerfile)  │
                    │   Health check: /api/health                   │
                    │   Dynamic $PORT binding                       │
                    └───────────────────────┬───────────────────────┘
                                            │ PostgreSQL SSL / Pooler
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │              SUPABASE (Database)              │
                    │   PostgreSQL 15+ with pgvector & RLS          │
                    │   Multi-Company Schemas & Seed Data           │
                    │   Transaction Pooler (Port 6543)              │
                    └───────────────────────────────────────────────┘
```

---

## 🚀 Step-by-Step Production Deployment Guide

### Phase 1: Supabase Setup (Database)
1. Log in to [Supabase](https://supabase.com) and create a new project (e.g., `kleanmax-qms`).
2. Go to **Project Settings** ➔ **Database** ➔ **Connection string** ➔ **URI**.
3. Copy the URI string using either:
   - **Transaction Pooler** (Recommended for Railway/Serverless, port `6543`):
     `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require`
   - **Session Pooler** (port `5432`).
4. (Optional) Run the SQL migrations in the Supabase SQL Editor:
   - Copy `supabase/migrations/20261015000001_initial_schema.sql`
   - Copy `supabase/migrations/20261104000001_multi_company.sql`
   - Copy `supabase/seed.sql`
   *(Note: The FastAPI backend automatically runs table creation and multi-company seeding on startup if the database is fresh!)*

---

### Phase 2: Railway Setup (Backend API)
1. Log in to [Railway](https://railway.com) and click **New Project** ➔ **Deploy from GitHub repo**.
2. Select this repository.
3. Railway automatically detects `railway.json` and `backend/Dockerfile`.
4. Go to the service **Variables** tab in Railway and add:
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   SECRET_KEY=your-secure-random-64-character-secret-key
   BACKEND_CORS_ORIGINS=["https://*.vercel.app", "http://localhost:5173", "*"]
   ```
5. Click **Deploy**. Railway will build the Docker container and start the backend.
6. Under **Settings** ➔ **Networking**, click **Generate Domain** (e.g., `https://kleanmax-backend.up.railway.app`).
7. Verify by visiting `https://your-backend.up.railway.app/api/health` ➔ should return `{"status": "healthy"}`.

---

### Phase 3: Vercel Setup (Frontend Web UI)
1. Log in to [Vercel](https://vercel.com) and click **Add New** ➔ **Project**.
2. Import this repository.
3. Configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (uses root `vercel.json` and builds `frontend`) OR set Root Directory to `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (or `frontend/dist`)
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://your-backend.up.railway.app/api
   ```
5. Update `vercel.json` rewrites destination with your Railway domain:
   ```json
   {
     "source": "/api/(.*)",
     "destination": "https://your-backend.up.railway.app/api/$1"
   }
   ```
6. Click **Deploy**. Vercel will build and deploy the frontend with global CDN routing.

---

## 💻 Local Development (Quick Start)

Double-click **`run.bat`** on Windows to launch both Backend and Frontend in parallel. It will open `http://localhost:5173` in your browser.

To stop running servers, close their windows or run **`stop.bat`**.

---

## ⚙️ Environment Variables Reference

See [`.env.example`](file:///.env.example) and [`frontend/.env.example`](file:///frontend/.env.example) for the full list of configuration options.
