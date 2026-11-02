# Klean Max Pro — Quotation Management System (QMS)

A full-stack Commercial Quotation Automation and Area-Based Pricing System tailored for Klean Max Pro operations.

---

## 🚀 Features

- **Area-Based Pricing Engine**: Automatic calculation of rate slabs, minimum charge thresholds, and service area dimensions.
- **Commercial Quotation Generation**: Create, approve, issue, revise, and track commercial quotations with full audit trails.
- **GST & Multi-State Tax Compliance**: Automated calculation of CGST, SGST, and IGST based on customer and company state codes.
- **Dynamic Print & PDF Generation**: Professional quotation layouts and instant PDF generation.
- **Role-Based Access Control**: Secure authentication and permissions management.
- **Modern Responsive UI**: Clean UI built with React, Vite, TypeScript, and TailwindCSS.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Uvicorn, Jinja2, Pydantic v2
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons
- **Database**: SQLite (Local development) / PostgreSQL / Supabase
- **Authentication**: JWT & Supabase Auth integration

---

## 💻 Quick Start (Windows)

Double-click **`run.bat`** to start both Backend and Frontend in parallel! It will automatically open `http://localhost:5173` in your browser.

To stop the servers, close their console windows or run **`stop.bat`**.

---

## 🔧 Manual Setup

### 1. Backend Setup

```bash
# Navigate to project root
cd "Kleanmax pro QMS"

# Create and activate virtual environment
python -m venv backend\.venv
backend\.venv\Scripts\activate

# Install requirements
pip install -r backend\requirements.txt

# Run backend API server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd "frontend"

# Install dependencies
npm install

# Run frontend development server
npm run dev
```
Frontend Web UI will be available at: [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```
