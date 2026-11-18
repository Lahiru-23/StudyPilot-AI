# StudyPilot AI

A student study-planning and productivity management system built for ITS2020 RAD coursework.

## Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, Redux Toolkit
- Backend: Node.js, Express, TypeScript
- Database: MongoDB + Mongoose
- Security: bcryptjs, JWT access tokens, refresh tokens stored as HTTP-only cookies
- Advanced feature: provider-independent study-plan generation interface with a deterministic mock provider

## Requirements
- Node.js 20+
- npm
- MongoDB local instance or MongoDB Atlas connection string

## Setup

### 1. Install dependencies
From the project root:
```bash
npm install
npm run install:all
```

### 2. Configure backend environment
Copy `server/.env.example` to `server/.env` and update `MONGODB_URI`.
Use long, random secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

### 3. Start both applications
From project root:
```bash
npm run dev
```
Frontend: http://localhost:5173  
Backend: http://localhost:5000  
Health check: http://localhost:5000/api/health

Alternatively run frontend and backend in separate terminals:
```bash
cd server && npm run dev
cd client && npm run dev
```

## Main features
- Student registration and login
- Role field (`student` / `admin`) with role authorization middleware
- Subject CRUD
- Task CRUD linked to subjects
- Study-session creation and listing
- Dashboard summary
- Intelligent provider-independent study planning using subject difficulty, task priority, deadlines, and daily available hours
- Redux Toolkit global auth state
- Responsive Tailwind UI

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET|POST /api/subjects`
- `GET|PUT|DELETE /api/subjects/:id`
- `GET|POST /api/tasks`
- `GET|PUT|DELETE /api/tasks/:id`
- `GET|POST /api/study-sessions`
- `POST /api/ai/study-plans/generate`
- `GET /api/study-plans`
- `GET /api/dashboard/summary`

## Important security notes
- Never commit `.env`.
- Refresh tokens are stored as HTTP-only cookies; access tokens are held in frontend memory.
- For production, set `COOKIE_SECURE=true`, configure HTTPS, set a strict CORS origin, and use strong secrets.
- Registration always creates a student account. Admin users must be provisioned manually; do not expose public admin registration.
- The mock AI provider does not call an external AI service. Replace it with a real provider adapter later while keeping provider API keys on the backend.

## Coursework note
This is a functional starter/MVP, not a claim that every coursework deliverable is complete. Before submission, add tests, screenshots, final documentation, deploy frontend/backend, configure MongoDB Atlas, and prepare to explain the implementation in the viva.


## Intelligent study planner

The planner is currently a deterministic, provider-independent scheduling algorithm (it does not call an external AI service or require an API key).

When a student generates a plan, the backend:
1. Validates the selected daily study hours (1–12) and plan duration (1–14 days).
2. Loads only that student's subjects and incomplete tasks.
3. Scores each pending task using its deadline urgency, task priority, and linked subject difficulty.
4. Places the highest-scoring unscheduled task into the next available study slot.
5. Uses the remaining slots for balanced revision, favouring harder subjects and subjects used less often in the current plan.
6. Creates sequential, non-overlapping sessions from 09:00, with each session lasting up to 60 minutes and the final session shortened when necessary.
7. Returns a summary showing how many pending tasks were scheduled and how many did not fit.

Each generated schedule item can include the linked task, task priority, subject difficulty, and a short explanation of why it was prioritised. If the plan does not have enough study slots for every pending task, the API reports the number left unscheduled.

The algorithm is a transparent rule-based planner rather than a generative AI model. A real AI provider can be added later behind the same API without exposing provider keys in the browser.
