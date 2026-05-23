# Primetrade v2 — AI-Powered Task Manager

A full-stack task management app built with React + Node.js, featuring AI assistance, analytics dashboard, kanban view, and a polished dark UI.

## Live Demo
- Frontend: https://primetrade-app.netlify.app/
- Backend API: https://primetrade-api-sntq.onrender.com/health
- API Docs: https://primetrade-api-sntq.onrender.com/api/v1/docs

## Features

### Core
- JWT authentication with protected routes and RBAC
- Full task CRUD — create, read, update, delete
- Task fields: title, description, status, priority, due date, tags
- One-click task completion via checkbox
- Search tasks by title or description
- Filter by status and priority
- Pagination

### AI (Groq + Llama 3.3 70B)
- Floating AI Assistant chat panel — ask anything about productivity and task planning
- AI Task Suggestions — type a title, click AI button to auto-fill description and suggest priority
- Quick prompt chips for common queries

### Dashboard
- Summary stat cards — total, completed, high priority, overdue
- List view and Kanban board view toggle
- Animated task cards with priority color bars and due date indicators
- Skeleton loaders

### Analytics Page
- Tasks by status — donut pie chart
- Tasks by priority — bar chart
- 7-day activity — line chart (created vs completed)
- KPI cards — completion rate, overdue count

### Admin Panel
- Platform-wide stats
- All users table with avatar initials, role badges, join date

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router v6, Recharts, date-fns |
| Backend | Node.js, Express 4, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Validation | Joi |
| AI | Groq SDK, Llama 3.3 70B |
| Security | Helmet, express-rate-limit, express-mongo-sanitize |
| Logging | Winston, Morgan |
| Docs | Swagger UI |
| Deploy | Render (backend), Netlify (frontend) |

## Project Structure
primetrade/
├── backend/
│   └── src/
│       ├── controllers/     # auth, task, admin
│       ├── models/          # User, Task (with dueDate, tags)
│       ├── routes/          # auth, task, admin, ai
│       ├── middleware/       # JWT protect, error handler
│       ├── validators/      # Joi schemas
│       ├── utils/           # AppError, Winston logger
│       └── config/          # DB, Swagger
└── frontend/
└── src/
├── pages/           # Login, Register, Dashboard, Analytics, Admin
├── components/      # Navbar, TaskModal, AIAssistant, Toast
├── context/         # AuthContext
├── api/             # axios client, endpoints
└── hooks/           # useToast

## Setup — Local

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (free at console.groq.com)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

Open http://localhost:5173

## Environment Variables

### Backend `.env`
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/primetrade
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
GROQ_API_KEY=gsk_your_key_here

### Frontend `.env`
VITE_API_URL=http://localhost:5000/api/v1

## Deployment

### Backend → Render
1. Connect GitHub repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all env vars from above (use Atlas URI for MONGO_URI)

### Frontend → Netlify
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api/v1`

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login, returns JWT |
| GET | /auth/me | JWT | Get current user |
| GET | /tasks | JWT | List tasks (filter, search, paginate) |
| POST | /tasks | JWT | Create task |
| PATCH | /tasks/:id | JWT | Update task |
| DELETE | /tasks/:id | JWT | Delete task |
| GET | /tasks/stats | JWT | Aggregated user stats |
| POST | /ai/chat | JWT | AI assistant (multi-turn) |
| POST | /ai/suggest | JWT | AI task description + priority |
| POST | /ai/prioritize | JWT | AI prioritization advice |
| GET | /admin/stats | Admin | Platform stats |
| GET | /admin/users | Admin | All users list |

## Portfolio Highlights
- Production-grade REST API with RBAC, rate limiting, input sanitization
- AI/LLM integration using Groq (free tier, Llama 3.3 70B)
- Data visualization with Recharts
- Docker-ready with docker-compose
- Swagger API documentation at /api/v1/docs
- Winston structured logging
