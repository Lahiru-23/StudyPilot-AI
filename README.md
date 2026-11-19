# StudyPilot AI

StudyPilot AI is a full-stack study-planning and student productivity application developed for the **ITS2020 – Rapid Application Development (RAD)** coursework.

The application helps students organize academic subjects and tasks, record study sessions, generate study plans, review progress, and receive AI-powered academic guidance.

## Live Application

- **Frontend:** https://studypilot-ai-frontend.vercel.app
- **Backend API:** https://study-pilot-ai-theta.vercel.app
- **API health check:** https://study-pilot-ai-theta.vercel.app/api/health

The frontend and backend are deployed on Vercel. MongoDB Atlas is used for the cloud database.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| State management | Redux Toolkit, React Redux |
| HTTP communication | Axios |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JWT access tokens and refresh tokens |
| Password hashing | bcryptjs |
| AI integration | Google Gemini API |
| Security middleware | Helmet, CORS, express-rate-limit |

## Main Features

### Authentication and authorization
- Student registration and login.
- JWT access-token authentication.
- Refresh-token-based session renewal.
- Logout functionality.
- Password hashing using bcryptjs.
- Role-based access control for student and admin roles.
- Protected API routes.
- Rate limiting for login and registration endpoints.

### Subject management
- Create, view, update, and delete subjects.
- Store subject information for the authenticated user.

### Task management
- Create, view, update, and delete academic tasks.
- Associate tasks with subjects.
- Organize tasks using priority, status, and due-date information.

### Study sessions and dashboard
- Create and view study sessions.
- View dashboard summaries.
- Review study information through reports and analytics.

### Intelligent study planner
- Generate study plans using subject difficulty, task priority, deadlines, and available study hours.
- Use the generated plan as the basis for personalized study guidance.

### AI study assistant
- Ask academic and technical questions.
- Receive explanations and study recommendations from Google Gemini.
- Send recent conversation messages as context for follow-up responses.

**Conversation history note:** The current AI Chat API accepts recent messages from the frontend as request context. The backend controller does not currently persist AI chat conversations in MongoDB. Therefore, chat history is not guaranteed to remain available after leaving or reloading the page.

## Application Architecture

The application follows a client-server architecture:

1. The React frontend provides the user interface.
2. The frontend communicates with the Express backend through REST API endpoints.
3. The backend validates requests and applies authentication and authorization middleware.
4. Mongoose models provide access to MongoDB.
5. The backend communicates with Google Gemini for AI-powered features.

## API Overview

All API routes use the `/api` prefix.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/refresh` | Refresh the access-token session |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the authenticated user's details |

### Administration

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/overview` | Get the admin overview (admin role required) |

### Subjects

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/subjects` | List subjects |
| POST | `/api/subjects` | Create a subject |
| GET | `/api/subjects/:id` | Get one subject |
| PUT | `/api/subjects/:id` | Update a subject |
| DELETE | `/api/subjects/:id` | Delete a subject |

### Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get one task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Study planning, sessions, dashboard, and reports

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/study-sessions` | List study sessions |
| POST | `/api/study-sessions` | Create a study session |
| POST | `/api/ai/study-plans/generate` | Generate an AI-assisted study plan |
| GET | `/api/study-plans` | List study plans |
| GET | `/api/dashboard/summary` | Get dashboard summary |
| GET | `/api/reports/summary` | Get report summary |

### AI Chat

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/ai/chat` | Send a message and recent conversation context to the AI assistant |

Protected endpoints require a valid access token. The admin overview endpoint additionally requires the `admin` role.

## Project Structure

```text
StudyPilot-AI/
├── client/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── pages/
│       ├── services/
│       └── types.ts
├── server/
│   ├── scripts/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── utils/
├── package.json
└── README.md
```

## Requirements

- Node.js 20 or later
- npm
- MongoDB local instance or MongoDB Atlas account
- Google Gemini API key

## Installation and Local Setup

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

### 3. Configure backend environment variables

Create a `.env` file inside the `server` directory. Use `server/.env.example` as the template.

Example for local development:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/studypilot_ai
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_refresh_secret
COOKIE_SECURE=false
GEMINI_API_KEY=your_gemini_api_key
```

Use strong, different random values for the JWT secrets. Keep `.env` files and API keys private. Do not commit secrets to GitHub or place private API keys in frontend code.

### 4. Run the application

From the project root:

```bash
npm run dev
```

The frontend and backend run concurrently.

Alternatively, start them separately in two terminals:

**Backend**
```bash
cd server
npm run dev
```

**Frontend**
```bash
cd client
npm run dev
```

### 5. Local URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Build Commands

Build the frontend:

```bash
cd client
npm run build
```

Build the backend:

```bash
cd server
npm run build
```

## Security

The project includes the following security measures in its implementation:

- Password hashing with bcryptjs.
- Short-lived JWT access tokens and refresh-token session renewal.
- HTTP-only cookies for refresh tokens.
- Hashed refresh-token storage.
- Authentication middleware for protected routes.
- Role-based authorization middleware.
- User-specific data access in protected features.
- Request-origin verification for refresh and logout routes.
- Rate limiting for login and registration.
- Security headers through Helmet.
- Environment variables for database credentials and API secrets.

For production deployment:
- Use HTTPS.
- Set `NODE_ENV=production`.
- Set `COOKIE_SECURE=true`.
- Configure `CLIENT_URL` to the deployed frontend origin.
- Use strong, different JWT secrets.
- Keep database credentials and the Gemini API key private.
- Configure MongoDB Atlas network access and database-user permissions appropriately.

## Deployment

The current deployment uses:

- **Frontend hosting:** Vercel
- **Backend hosting:** Vercel
- **Database hosting:** MongoDB Atlas

Live links are listed in the [Live Application](#live-application) section.

## Screenshots

Add current screenshots of the deployed application here before final submission. Suggested screenshots:

1. Login and registration page.
2. Dashboard.
3. Subject management.
4. Task management.
5. Study planner.
6. AI Chat Assistant.
7. Reports page.

## Version Control

GitHub repository:

https://github.com/Lahiru-23/StudyPilot-AI

## Coursework

This project was developed as an individual full-stack application for the **ITS2020 – Rapid Application Development (RAD)** coursework.
