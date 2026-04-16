# Primetrade Task API

A production-ready REST API with JWT authentication, role-based access control, and a React frontend. Built as part of a Backend Developer Intern assignment.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Node.js, Express.js               |
| Database   | MongoDB (Mongoose ODM)            |
| Auth       | JWT + bcryptjs                    |
| Validation | Joi                               |
| Docs       | Swagger (swagger-jsdoc)           |
| Logging    | Winston + Morgan                  |
| Security   | Helmet, express-rate-limit, mongo-sanitize |
| Frontend   | React + Vite, React Router        |
| Deploy     | Docker + Docker Compose           |

---

## Project Structure

```
primetrade-api/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, Swagger config
│   │   ├── controllers/    # Business logic (auth, tasks, admin)
│   │   ├── middleware/     # JWT auth, RBAC
│   │   ├── models/         # Mongoose schemas (User, Task)
│   │   ├── routes/         # Express routers with Swagger JSDoc
│   │   ├── utils/          # Logger, AppError class
│   │   ├── validators/     # Joi schemas + validation middleware
│   │   ├── app.js          # Express setup, middleware, routes
│   │   └── server.js       # Entry point
│   ├── logs/               # Winston log files (auto-created)
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + API endpoint functions
│   │   ├── components/     # Navbar, TaskModal, Toast, ProtectedRoute
│   │   ├── context/        # AuthContext (global user state)
│   │   ├── hooks/          # useToast
│   │   ├── pages/          # Login, Register, Dashboard, Admin
│   │   ├── App.jsx         # Router setup
│   │   ├── main.jsx
│   │   └── index.css       # Global styles + design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml
```

---

## Quick Start (Local — No Docker)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/primetrade-api.git
cd primetrade-api
```

### 2. Set up Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`  
Swagger docs at: `http://localhost:5000/api/v1/docs`

### 3. Set up Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Quick Start (Docker — Recommended)

```bash
# From the project root
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Swagger: `http://localhost:5000/api/v1/docs`

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable                | Description                          | Example                        |
|-------------------------|--------------------------------------|--------------------------------|
| `PORT`                  | Server port                          | `5000`                         |
| `NODE_ENV`              | Environment                          | `development` / `production`   |
| `MONGO_URI`             | MongoDB connection string            | `mongodb://localhost:27017/db` |
| `JWT_SECRET`            | Secret key for signing JWTs          | `a_long_random_string`         |
| `JWT_EXPIRES_IN`        | Token expiry                         | `7d`                           |
| `CLIENT_URL`            | Frontend URL (for CORS)              | `http://localhost:3000`        |
| `RATE_LIMIT_WINDOW_MS`  | Rate limit window in ms              | `900000` (15 min)              |
| `RATE_LIMIT_MAX`        | Max requests per window              | `100`                          |

> **Never commit your `.env` file.** It is in `.gitignore`.

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint    | Auth Required | Description          |
|--------|-------------|---------------|----------------------|
| POST   | `/register` | No            | Create a new account |
| POST   | `/login`    | No            | Login, returns JWT   |
| GET    | `/me`       | Yes           | Get current user     |

### Tasks — `/api/v1/tasks`

| Method | Endpoint  | Auth Required | Description                         |
|--------|-----------|---------------|-------------------------------------|
| GET    | `/`       | Yes           | Get all tasks (filter + paginate)   |
| POST   | `/`       | Yes           | Create a task                       |
| GET    | `/:id`    | Yes           | Get a single task                   |
| PATCH  | `/:id`    | Yes           | Update a task                       |
| DELETE | `/:id`    | Yes           | Delete a task                       |

**Query params for GET /tasks:** `?status=todo&priority=high&page=1&limit=10`

### Admin — `/api/v1/admin` (role: admin only)

| Method | Endpoint      | Description                   |
|--------|---------------|-------------------------------|
| GET    | `/stats`      | Platform stats                |
| GET    | `/users`      | List all users                |
| DELETE | `/users/:id`  | Delete a user + their tasks   |

---

## Sample API Request / Response

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Harsh",
  "email": "harsh@example.com",
  "password": "secret123"
}
```

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

### Create Task (with JWT)
```http
POST /api/v1/tasks
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "Build the API",
  "description": "Complete intern assignment",
  "priority": "high"
}
```

```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "task": {
      "_id": "65a2b...",
      "title": "Build the API",
      "description": "Complete intern assignment",
      "status": "todo",
      "priority": "high",
      "owner": "64f1a...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Response (example: wrong password)
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

## Database Schema

### User
```
_id         ObjectId   (auto)
name        String     required, max 50
email       String     required, unique, lowercase
password    String     hashed with bcrypt (select: false)
role        String     "user" | "admin", default "user"
createdAt   Date       auto
updatedAt   Date       auto
```

### Task
```
_id          ObjectId   (auto)
title        String     required, max 100
description  String     optional, max 500
status       String     "todo" | "in-progress" | "done"
priority     String     "low" | "medium" | "high"
owner        ObjectId   ref: User (indexed)
createdAt    Date       auto
updatedAt    Date       auto
```

---

## How to Create an Admin User

MongoDB does not expose a registration endpoint for admins (by design — security).  
To promote a user to admin, run this in your MongoDB shell or Compass:

```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## Scalability Note

See [SCALABILITY.md](./SCALABILITY.md)

---

## API Documentation (Swagger)

Once the backend is running, visit:  
**`http://localhost:5000/api/v1/docs`**

All endpoints are documented with request/response schemas.  
Click "Authorize" and paste your Bearer token to test protected routes.

---

## Security Measures

- Passwords hashed with **bcrypt** (cost factor 12)
- **JWT** signed with a secret, expires in 7 days
- **Helmet** sets secure HTTP headers (XSS, clickjacking protection)
- **express-mongo-sanitize** strips `$` and `.` from inputs (NoSQL injection prevention)
- **Rate limiting**: 100 req / 15 min per IP
- Generic error messages on auth failure (no "user not found" leaks)
- Passwords excluded from all DB queries by default (`select: false`)
- Non-root user in Docker container
