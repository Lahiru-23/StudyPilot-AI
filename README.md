# StudyPilot AI

StudyPilot AI is a full-stack student study-planning and productivity management system developed for the ITS2020 Rapid Application Development (RAD) coursework.

It helps students organize subjects, manage academic tasks, track study sessions, generate personalized study schedules, and receive AI-powered study guidance.

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **UI:** Tailwind CSS
- **State Management:** Redux Toolkit
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT access tokens and refresh tokens
- **Password Security:** bcryptjs
- **AI Integration:** Google Gemini API
- **HTTP Client:** Axios

## Requirements

- Node.js 20 or later
- npm
- MongoDB local instance or MongoDB Atlas account
- Google Gemini API key

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Lahiru-23/StudyPilot-AI.git
cd StudyPilot-AI
```

### 2. Install dependencies

```bash
npm install
npm run install:all
```

### 3. Configure backend environment

Create a `.env` file inside the `server` directory by copying `.env.example`.

Configure the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/studypilot_ai
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_long_random_access_secret
JWT_REFRESH_SECRET=your_different_long_random_refresh_secret
COOKIE_SECURE=false
GEMINI_API_KEY=your_gemini_api_key
```

Use strong, different random secrets for JWT access and refresh tokens. Never commit `.env` files or expose API keys in frontend code.

### 4. Start the application

Run both frontend and backend from the project root:

```bash
npm run dev
```

Application URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

Alternatively, run each application in a separate terminal:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

## Main Features

- Student registration and login.
- JWT-based authentication with refresh-token support.
- Subject management with create, read, update and delete operations.
- Task management linked to subjects.
- Study-session creation and listing.
- Dashboard summary.
- Intelligent study planning based on subject difficulty, task priority, deadlines and available study hours.
- AI-powered study recommendations using Google Gemini.
- AI Chat Assistant with conversation-history support.
- Reports and analytics.
- Redux Toolkit global authentication state.
- Responsive user interface built with Tailwind CSS.

## AI Features

### Intelligent Study Planner

The study planner uses a rule-based scheduling algorithm to organize study activities.

It considers:
- Subject difficulty.
- Task priority.
- Task deadlines.
- Daily available study hours.
- Balanced revision opportunities.

The generated schedule is then passed to Google Gemini for AI-powered analysis and personalized study recommendations.

### AI Study Assistant

The AI Chat Assistant uses Google Gemini to answer academic questions and help students understand technical subjects.

Features include:
- Academic explanations.
- Programming and technical guidance.
- Practical examples.
- Conversation history context.
- Focused study recommendations.

The backend handles Gemini API requests so that the API key is not exposed in the frontend.

## API Overview

All API endpoints use the `/api` prefix.

### Authentication

| Method | Endpoint |
|---|---|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/auth/refresh` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/me` |

### Subjects

| Method | Endpoint |
|---|---|
| GET | `/api/subjects` |
| POST | `/api/subjects` |
| GET | `/api/subjects/:id` |
| PUT | `/api/subjects/:id` |
| DELETE | `/api/subjects/:id` |

### Tasks

| Method | Endpoint |
|---|---|
| GET | `/api/tasks` |
| POST | `/api/tasks` |
| GET | `/api/tasks/:id` |
| PUT | `/api/tasks/:id` |
| DELETE | `/api/tasks/:id` |

### Study Planning and Reports

| Method | Endpoint |
|---|---|
| GET | `/api/study-sessions` |
| POST | `/api/study-sessions` |
| POST | `/api/ai/study-plans/generate` |
| GET | `/api/study-plans` |
| GET | `/api/dashboard/summary` |
| GET | `/api/reports/summary` |

### AI Chat

| Method | Endpoint |
|---|---|
| POST | `/api/ai/chat` |

Protected endpoints require authentication.

## Security

- Passwords are hashed using bcryptjs.
- JWT access tokens expire after 15 minutes.
- Refresh tokens expire after 7 days.
- Refresh tokens are stored using HTTP-only cookies.
- Refresh tokens are hashed before database storage.
- Authentication middleware protects private API routes.
- User-specific database operations are scoped to the authenticated user.
- Environment variables are used for sensitive configuration.
- Login and registration endpoints use rate limiting.

For production deployment:
- Set `NODE_ENV=production`.
- Set `COOKIE_SECURE=true`.
- Configure HTTPS.
- Use strong JWT secrets.
- Configure the correct frontend CORS origin.
- Use MongoDB Atlas for cloud database hosting.

## Deployment

Deployment is not yet completed.

Planned deployment services:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

Deployed URLs will be added after successful deployment.

## Screenshots

Application screenshots will be added after the final UI review.

## GitHub Repository

https://github.com/Lahiru-23/StudyPilot-AI

## Coursework Note

This project is developed as an individual full-stack application for the ITS2020 Rapid Application Development coursework. Final submission preparation includes deployment, screenshots, testing, documentation and viva preparation.