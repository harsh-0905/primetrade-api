# Scalability Note

## Current Architecture

This project is a **monolith** — one Node.js process handles all concerns (auth, tasks, admin). That is the right choice for an early-stage product or intern assignment. It is simple to deploy, easy to debug, and has zero network overhead between modules.

The folder structure, however, is designed to **grow into microservices** without a rewrite.

---

## How This Scales — Step by Step

### Step 1: Vertical Scaling (now → 10k users)
- Increase server RAM/CPU on the host
- MongoDB Atlas free tier → dedicated cluster
- No code changes needed

### Step 2: Horizontal Scaling (10k → 100k users)
Run multiple instances of the Node.js app behind a **load balancer** (e.g., nginx or AWS ALB):

```
Client → nginx (load balancer)
              ├── Node instance 1
              ├── Node instance 2  →  MongoDB Atlas (shared)
              └── Node instance 3
```

**What needs to change:**
- JWT is already stateless, so any instance can verify any token — no session sharing problem
- MongoDB is already a separate service — no change needed
- Use PM2 cluster mode locally: `pm2 start src/server.js -i max`

### Step 3: Caching (reduce DB load)
Add **Redis** in front of expensive or repeated reads:

```js
// Example: cache GET /tasks for a user for 60 seconds
const cacheKey = `tasks:${userId}:${JSON.stringify(filters)}`;
const cached = await redis.get(cacheKey);
if (cached) return res.json(JSON.parse(cached));

const tasks = await Task.find(filter); // only hits DB on cache miss
await redis.setex(cacheKey, 60, JSON.stringify(tasks));
```

**What to cache:**
- Task lists (invalidate on create/update/delete)
- Admin stats (invalidate every 5 minutes)
- User profile from JWT (short TTL)

### Step 4: Microservices (100k+ users or team scaling)
Split by domain boundary — the current folder structure maps directly:

```
auth-service     → handles /auth/* (port 3001)
task-service     → handles /tasks/* (port 3002)
admin-service    → handles /admin/* (port 3003)
api-gateway      → routes to services, validates JWT (port 5000)
```

Each service:
- Has its own database (or collection)
- Deploys and scales independently
- Communicates via REST or a message queue (RabbitMQ / Kafka)

The current codebase supports this — each controller + model + route set is already isolated.

---

## Database Scaling

### Indexing (already done)
```js
taskSchema.index({ owner: 1, createdAt: -1 });
```
This makes "get all tasks for user X sorted by newest" fast even with millions of tasks.

### MongoDB Scaling Path
| Stage         | Solution                                |
|---------------|-----------------------------------------|
| 0–10k docs    | Local MongoDB or Atlas free             |
| 10k–1M docs   | Atlas M10+ with indexes                 |
| 1M+ docs      | Atlas sharding (partition by `owner`)   |

---

## Deployment Readiness

### This project is already ready for:

| Feature               | Status  | How                                     |
|-----------------------|---------|-----------------------------------------|
| Containerized         | ✅      | Dockerfile for both services            |
| Orchestrated          | ✅      | docker-compose.yml                      |
| Environment-separated | ✅      | All secrets in .env                     |
| Health check          | ✅      | `GET /health` endpoint                  |
| Non-root container    | ✅      | adduser in Dockerfile                   |
| Structured logs       | ✅      | Winston JSON logs → stdout (cloud-ready)|
| CORS configured       | ✅      | env-based CLIENT_URL                    |
| Rate limited          | ✅      | per-IP limit                            |

### Cloud Deployment Options

**Cheapest / Fastest (for demo):**
- Backend → [Render](https://render.com) (free tier, push to deploy)
- Frontend → [Vercel](https://vercel.com) (free, instant)
- Database → [MongoDB Atlas](https://cloud.mongodb.com) (free 512MB)

**Production (team/company):**
- Backend → AWS ECS or GCP Cloud Run (auto-scaling containers)
- Frontend → CloudFront + S3 or Vercel
- Database → MongoDB Atlas M10+ or DocumentDB
- Load Balancer → AWS ALB
- Cache → AWS ElastiCache (Redis)
- Logs → CloudWatch or Datadog

---

## What Would I Add Next?

1. **Redis caching** — task list cache with user-scoped invalidation
2. **Refresh tokens** — short-lived access token + long-lived refresh token stored in httpOnly cookie
3. **Email verification** — SMTP on register (already have SMTP experience from AI Skill Gap Analyzer)
4. **CI/CD** — GitHub Actions: lint → test → build Docker image → push to registry → deploy
5. **API versioning for breaking changes** — `/api/v2/` alongside v1, not replacing it
