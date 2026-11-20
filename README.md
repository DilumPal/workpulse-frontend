# WorkPulse HRMS — Frontend

The React web client for **WorkPulse HRMS**, a full-stack Human Resource Management System featuring role-based dashboards, attendance tracking, leave workflows, employee lifecycle management, and cloud profile photo uploads.

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **HTTP Client:** Axios (with JWT `Bearer` interceptor)
- **Auth Decoding:** `jwt-decode` (session managed in `sessionStorage`)
- **Cloud Storage:** Supabase Storage (`profile-photos` bucket)
- **Production Server:** Nginx (SPA fallback + `/api/` reverse proxy)

## Key Features

- **Role-Based Access & Navigation:** Tailored sidebar and landing routes for **Employee** (`/dashboard`), **HR Manager** (`/hr-dashboard`), and **System Admin** (`/manage-departments`).
- **Authentication:** Login flow with JWT expiration checks, protected route guards, and automatic session cleanup on tab close.
- **HR Dashboard:** Non-scrollable executive overview with live KPIs (Total Employees, Pending Leaves, On Leave Today), recent pending leave requests, department headcount progress bars, and employment type summaries.
- **Employee & Department Management:** Full CRUD operations with real-time search/filtering, self-deletion prevention, and Admin-only role controls.
- **Self-Service Profile & Leave Workflows:** Employees can submit leave requests, browse the staff directory, mark attendance, and update personal info/avatars with instant sidebar sync.

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── api/            # Axios instance and interceptors
│   ├── components/     # Pages & layout (Login, EmployeeLayout, HrDashboard, Profile, etc.)
│   ├── context/        # AuthContext (JWT handling & role routing)
│   ├── supabaseClient.js
│   └── App.jsx
├── .env                # Local environment variables (not committed)
├── Dockerfile          # Multi-stage Node -> Nginx build
├── nginx.conf          # SPA routing & /api/ proxy config
└── package.json
```

## Environment Variables

Create a `.env` file in the `frontend/` root (keep `.env` out of Git):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Running Instructions

### Option A: Run Full Stack with Docker (Recommended)

Ensure your workspace folder is organized as follows:

```text
hrms/
├── docker-compose.yml
├── frontend/          # This repository
└── workpulse/         # Backend repository
```

From the parent `hrms/` directory:

```bash
# 1. Build and start PostgreSQL, Spring Boot backend, and Nginx frontend
docker compose up -d --build

# 2. Check container status
docker compose ps

# 3. View live logs (Ctrl + C to exit logs)
docker compose logs -f

# 4. Stop and remove containers (preserves database volume)
docker compose down

# 5. Clean start (removes containers & volumes, then rebuilds)
docker compose down -v && docker compose up --build
```

- **Frontend (Nginx):** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`
- **PostgreSQL:** `localhost:5435` (`hrms_db`)

### Option B: Run Locally (Development Mode)

1. **Start PostgreSQL** and ensure the `hrms_db` database is running.
2. **Start the Backend** (from the `workpulse/` directory):
   ```bash
   ./mvnw spring-boot:run
   ```
   *(On Windows Command Prompt, run `mvnw.cmd spring-boot:run`.)*
3. **Start the Frontend** (from this `frontend/` directory):
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.