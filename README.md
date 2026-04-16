# Primetrade Task API

A scalable REST API built with **Node.js + Express + MongoDB Atlas**, featuring JWT authentication, role-based access control (user/admin), full task CRUD, and a React frontend — submitted as part of the Backend Developer Intern assignment.

---

## Assignment Checklist

| Requirement | Status |
|---|---|
| User Registration & Login with bcrypt + JWT | ✅ |
| Role-Based Access (user vs admin) | ✅ |
| CRUD APIs for Tasks | ✅ |
| API Versioning (`/api/v1/`) | ✅ |
| Input Validation (Joi) | ✅ |
| Centralized Error Handling | ✅ |
| Swagger API Documentation | ✅ |
| MongoDB Schema Design | ✅ |
| React Frontend (Register/Login/Dashboard/CRUD) | ✅ |
| JWT Secure Handling | ✅ |
| Input Sanitization (NoSQL injection prevention) | ✅ |
| Scalable Folder Structure | ✅ |
| Rate Limiting | ✅ |
| Logging (Winston) | ✅ |
| Docker Deployment | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Validation | Joi |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Logging | Winston + Morgan |
| Security | Helmet, express-rate-limit, express-mongo-sanitize |
| Frontend | React 18 + Vite + React Router v6 |
| Deployment | Docker + Docker Compose |

---

## Project Structure

```
primetrade-api/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB Atlas connection
│   │   │   └── swagger.js            # Swagger config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # register, login, getMe
│   │   │   ├── task.controller.js    # CRUD + filter + pagination
│   │   │   └── admin.controller.js   # stats, users, delete user
│   │   ├── middleware/
│   │   │   └── auth.middleware.js    # protect (JWT) + restrictTo (RBAC)
│   │   ├── models/
│   │   │   ├── User.model.js         # User schema with bcrypt hook
│   │   │   └── Task.model.js         # Task schema with owner ref
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── admin.routes.js
│   │   ├── utils/
│   │   │   ├── logger.js             # Winston logger
│   │   │   └── AppError.js           # Custom error class
│   │   ├── validators/
│   │   │   └── schemas.js            # Joi schemas + validate middleware
│   │   ├── app.js                    # Express app + all middleware
│   │   └── server.js                 # Entry point
│   ├── logs/                         # Auto-created by Winston
│   ├── .env.example                  # Copy this to .env
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js             # Axios instance + interceptors
│   │   │   └── endpoints.js          # All API call functions
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx    # Redirects if not logged in
│   │   │   ├── TaskModal.jsx         # Create / Edit task modal
│   │   │   └── Toast.jsx             # Success / error notifications
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global user state + token
│   │   ├── hooks/
│   │   │   └── useToast.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx         # Task list + CRUD UI
│   │   │   └── Admin.jsx             # Admin panel (stats + users)
│   │   ├── App.jsx                   # Router setup
│   │   ├── main.jsx
│   │   └── index.css                 # Global design system
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
├── SCALABILITY.md
└── README.md
```

---

## Prerequisites

Make sure these are installed before running anything:

- [Node.js v18+](https://nodejs.org/) — check with `node -v`
- [npm v9+](https://www.npmjs.com/) — check with `npm -v`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — only needed for Docker method
- A [MongoDB Atlas](https://cloud.mongodb.com) account with a cluster created

---

## Environment Setup (Do This First)

```bash
# 1. Clone the repo
git clone https://github.com/harsh-0905/primetrade-api
cd primetrade-api

# 2. Create your .env file from the template
cp backend/.env.example backend/.env
```

Now open `backend/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# Your MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/primetrade_db

# Any long random string — keep this secret, never share it
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

> ⚠️ **Never commit `.env` to GitHub.** It is already in `.gitignore`.

**MongoDB Atlas — Allow Network Access:**
Atlas dashboard → Network Access → Add IP Address → add `0.0.0.0/0`
This is required for Docker and cloud deployment to connect to Atlas.

---

## Option 1: Run Locally (Without Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

Expected terminal output:
```
[2024-01-15 10:30:00] info: MongoDB connected: cluster0.xxxxx.mongodb.net
[2024-01-15 10:30:00] info: Server running on port 5000 [development]
[2024-01-15 10:30:00] info: Swagger docs: http://localhost:5000/api/v1/docs
```

### Frontend (open a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Expected terminal output:
```
  VITE v5.x ready in 300ms
  ➜  Local:   http://localhost:3000/
```

**URLs:**
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api/v1 |
| Swagger Docs | http://localhost:5000/api/v1/docs |
| Health Check | http://localhost:5000/health |

---

## Option 2: Run with Docker

```bash
# From the project root (where docker-compose.yml lives)
docker-compose up --build
```

Run in background:
```bash
docker-compose up --build -d
```

View logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

Stop everything:
```bash
docker-compose down
```

Same URLs as local apply.

---

## Testing the Application (Step by Step)

### Step 1 — Health Check (confirms server is running)

```bash
curl http://localhost:5000/health
```

Expected:
```json
{ "status": "ok", "timestamp": "2024-01-15T10:30:00.000Z" }
```

---

### Step 2 — Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Harsh","email":"harsh@example.com","password":"secret123"}'
```

Expected:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64f1a...",
      "name": "Harsh",
      "email": "harsh@example.com",
      "role": "user"
    }
  }
}
```

---

### Step 3 — Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"harsh@example.com","password":"secret123"}'
```

Copy the `token` value from the response — you need it for all protected routes below.

---

### Step 4 — Create a Task

Replace `YOUR_TOKEN` with the token from Step 3:

```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Build the API","description":"Complete intern assignment","priority":"high"}'
```

Expected:
```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "task": {
      "_id": "65a2b...",
      "title": "Build the API",
      "status": "todo",
      "priority": "high"
    }
  }
}
```

---

### Step 5 — Get All Tasks (with filters)

```bash
# All tasks
curl http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl "http://localhost:5000/api/v1/tasks?status=todo&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Step 6 — Update a Task

Replace `TASK_ID` with the `_id` from Step 4:

```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"in-progress"}'
```

---

### Step 7 — Delete a Task

```bash
curl -X DELETE http://localhost:5000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Step 8 — Test RBAC (should return 403 for normal users)

```bash
curl http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected:
```json
{ "success": false, "message": "You do not have permission for this action." }
```

---

### Step 9 — Test via Swagger UI (easiest method)

1. Open http://localhost:5000/api/v1/docs
2. Run `POST /auth/register` to create an account
3. Copy the token from the response
4. Click **Authorize** button (top right of Swagger page)
5. Enter: `Bearer YOUR_TOKEN`
6. All protected routes are now unlocked — test everything in the browser

---

## How to Create an Admin User

Admin registration is intentionally not exposed via API (security best practice).
After a normal user registers, promote them in MongoDB Atlas:

**Atlas UI:** Collections → `primetrade_db` → `users` → find your document → Edit:
```json
{ "$set": { "role": "admin" } }
```

**Or via MongoDB Compass / Shell:**
```js
db.users.updateOne(
  { email: "harsh@example.com" },
  { $set: { role: "admin" } }
)
```

Log in again to get a fresh token. The Admin panel will now appear in the frontend navbar.

---

## API Endpoints Reference

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, returns JWT |
| GET | `/me` | Yes | Get current user profile |

### Tasks — `/api/v1/tasks`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/` | Yes | Get all tasks (supports filters + pagination) |
| POST | `/` | Yes | Create a task |
| GET | `/:id` | Yes | Get a single task by ID |
| PATCH | `/:id` | Yes | Update a task |
| DELETE | `/:id` | Yes | Delete a task |

Query params: `?status=todo&priority=high&page=1&limit=10`

### Admin — `/api/v1/admin` (admin role only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Total users, tasks, breakdown by status |
| GET | `/users` | List all registered users |
| DELETE | `/users/:id` | Delete user + all their tasks |

---

## Database Schema

### User Collection
```
_id          ObjectId    auto-generated
name         String      required, max 50 chars
email        String      required, unique, lowercase
password     String      bcrypt hashed, never returned in queries
role         String      "user" | "admin"  (default: "user")
createdAt    Date        auto
updatedAt    Date        auto
```

### Task Collection
```
_id          ObjectId    auto-generated
title        String      required, max 100 chars
description  String      optional, max 500 chars
status       String      "todo" | "in-progress" | "done"  (default: "todo")
priority     String      "low" | "medium" | "high"  (default: "medium")
owner        ObjectId    ref: User._id  (indexed for fast per-user queries)
createdAt    Date        auto
updatedAt    Date        auto
```

---

## Do I Need `.dockerignore` Files?

**Yes — and they are already included** (`backend/.dockerignore` and `frontend/.dockerignore`).

Without them:
- Docker copies `node_modules` (hundreds of MB) into the build context → very slow builds
- Your `.env` file could accidentally be baked into the Docker image → security risk

The `.dockerignore` files prevent both problems.

---

## Deploying to Cloud (Free)

### Backend → Render.com

```
1. Push this repo to GitHub (confirm .env is NOT in the repo)
2. render.com → New → Web Service → connect your repo
3. Settings:
   Root Directory : backend
   Build Command  : npm install
   Start Command  : node src/server.js
4. Add Environment Variables in Render dashboard (same keys as .env)
5. Deploy → copy the Render URL (e.g. https://primetrade-api.onrender.com)
```

### Frontend → Vercel

```
1. vercel.com → New Project → Import from GitHub
2. Settings:
   Root Directory : frontend
   Framework      : Vite
3. Deploy → copy the Vercel URL
4. Go back to Render → update CLIENT_URL env var to your Vercel URL
5. Redeploy backend
```

### Database

MongoDB Atlas is already your database — no extra steps needed for deployment.

---

## Security Measures

- **bcrypt** (cost factor 12) — passwords hashed, never stored plain text
- **JWT** — stateless, signed with secret, expires in 7 days
- **Helmet** — sets 11 secure HTTP response headers
- **express-mongo-sanitize** — strips `$` and `.` to prevent NoSQL injection
- **Rate limiting** — 100 requests per 15 min per IP
- **Generic auth errors** — same message for wrong email or wrong password (prevents user enumeration)
- **`select: false`** on password field — never returned in any DB query
- **Non-root user** in Docker container

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `MongooseServerSelectionError` | Atlas IP not whitelisted | Atlas → Network Access → Add `0.0.0.0/0` |
| `Cannot GET /api/v1/...` | Wrong URL | All routes start with `/api/v1/` |
| `401 Unauthorized` | Missing or expired token | Login again, use fresh token |
| `403 Forbidden` | Not admin role | Promote user to admin in Atlas |
| CORS error in browser | `CLIENT_URL` mismatch | Set `CLIENT_URL=http://localhost:3000` in `.env` |
| Docker `port already in use` | Port 5000 or 3000 busy | Run `lsof -ti:5000 \| xargs kill` |
| `JWT malformed` | Token copied incorrectly | Do not include "Bearer" in the token value itself |

---

## Scalability Note

See [SCALABILITY.md](./SCALABILITY.md) for full breakdown covering horizontal scaling, Redis caching, microservices split, and cloud deployment architecture.
