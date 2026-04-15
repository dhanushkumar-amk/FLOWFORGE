---
trigger: always_on
---

# FlowForge – Project Rules

## What Is This Project?
FlowForge is a **production-grade, real-time collaborative DAG workflow orchestration platform**.
It is a portfolio-focused MERN full-stack project that demonstrates HLD, LLD, DSA, and system design depth.

---

## Tech Stack (Use EXACTLY These — No Substitutions)

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui + React Flow |
| Backend | Node.js + Express.js (TypeScript) |
| Auth | Clerk (`@clerk/nextjs`, `@clerk/express`) |
| Database | MongoDB Atlas (Mongoose) |
| Cache / Locks | Redis via ioredis (Upstash free tier) |
| Background Jobs | Inngest (primary) + BullMQ (fallback) |
| Storage | Cloudflare R2 |
| Payments | Razorpay (Test Mode) |
| AI | Gemini 2.5 Flash |
| State (frontend) | Zustand (client state) + TanStack Query (server state) |
| Validation | Zod (both frontend and backend) |
| CI/CD | GitHub Actions |
| Deployment | Railway or Render (free tier) + Docker |

---

## Monorepo Structure
This is a Turborepo monorepo. Always work within this structure:

```
flowforge/
├── apps/
│   ├── frontend/     ← Next.js 15
│   └── backend/      ← Express.js
├── packages/
│   ├── shared-types/ ← Shared TS interfaces
│   └── config/       ← Shared constants
├── docker-compose.yml
└── turbo.json
```

- Shared types live in `packages/shared-types/src/index.ts`
- Import shared types as `@flowforge/shared-types`
- Import shared config as `@flowforge/config`

---

## Backend Architecture Rules

1. **Always use the Repository Pattern** — controllers never call models directly
2. **Always use the Service Layer** — business logic stays in services, not controllers
3. **Every route must have**:
   - Auth middleware (`requireAuth`)
   - Input validation via Zod schema + `validate()` middleware
   - Error handling via `AppError` class
4. **API response shape is always**:
   - Success: `{ success: true, data: ... }`
   - Error: `{ success: false, error: '...', statusCode: ... }`
5. **Use Redis caching** on all frequently-read GET endpoints (TTL: 5–15 min)
6. **Invalidate cache** whenever a resource is mutated

### Folder convention (backend):
```
src/
├── controllers/    ← HTTP layer only
├── services/       ← Business logic
├── repositories/   ← DB queries only
├── routes/         ← Route registration
├── middleware/     ← auth, validate, rateLimiter, errorHandler
├── models/         ← Mongoose schemas
├── utils/
│   └── dsa/        ← topologicalSort, cycleDetection, priorityQueue, tokenBucket
├── inngest/        ← Inngest functions
└── socket/         ← Socket.io handlers
```

---

## DSA Implementations (Must Be In The Codebase)

These must exist in `apps/backend/src/utils/dsa/` with full unit tests:

| DSA | File | Purpose |
|---|---|---|
| Kahn's Topological Sort | `topologicalSort.ts` | DAG execution order |
| DFS Cycle Detection | `cycleDetection.ts` | Validate DAGs (no cycles) |
| Binary Heap Priority Queue | `priorityQueue.ts` | Priority task scheduling |
| Token Bucket Rate Limiter | `tokenBucket.ts` | Per-user/workspace rate limiting |
| Distributed Token Bucket | `distributedTokenBucket.ts` | Redis-backed, multi-instance safe |

All DSA must have Big-O comments and tests in `__tests__/` next to each file.

---

## Frontend Rules

1. Use **App Router** (Next.js 15) — no Pages Router
2. Route groups:
   - `(auth)/` — sign-in, sign-up pages
   - `(dashboard)/` — all protected pages
3. **shadcn/ui** is the only UI component library — do not mix in other component libs
4. **Lucide React** for all icons
5. **React Hook Form + Zod** for all forms
6. Dark mode is required — use CSS variables, class strategy

### Folder convention (frontend):
```
src/
├── app/
│   ├── (auth)/
│   └── (dashboard)/
│       ├── dashboard/
│       ├── workflows/
│       │   └── [id]/builder/
│       └── settings/
├── components/
│   ├── dag-builder/    ← React Flow canvas + custom nodes
│   ├── layout/         ← Sidebar, TopBar, WorkspaceSwitcher
│   └── ui/             ← shadcn/ui
├── hooks/
│   └── api/            ← useQuery / useMutation hooks
├── stores/             ← Zustand stores
└── lib/
    ├── apiClient.ts    ← Axios with Clerk auth headers
    └── queryClient.ts  ← TanStack Query config
```

---

## Environment Variables

Backend `.env` must contain:
```
PORT, MONGODB_URI, REDIS_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY,
CLOUDFLARE_R2_BUCKET, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY,
INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY, GEMINI_API_KEY,
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
```

Frontend `.env.local` must contain:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY,
NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL
```

Never hardcode secrets — always read from `process.env`. On startup, validate all required vars using Zod and throw if any are missing.

---

## Phase Order — Follow Strictly

Work phases in order. Do NOT skip phases. Each phase has a clear OUTCOME to verify before moving on.

| Section | Phases | Topic |
|---|---|---|
| 1 – Foundation | 1–8 | Monorepo, shared packages, Express, MongoDB, Next.js, Clerk, Docker |
| 2 – Data Layer | 9–13 | Schemas, Repository pattern, User/Workspace APIs, Validation, Redis cache |
| 3 – DSA | 14–17 | Topological sort, Priority queue, Token bucket, DAG validator API |
| 4 – Workflow Builder | 18–24 | API client, Dashboard, React Flow canvas, Node types, Toolbox |
| 5 – Real-time | 25–29 | Socket.io, live cursors, presence, optimistic updates |
| 6 – Execution Engine | 30–36 | Inngest functions, step execution, retry, rollback, cron |
| 7 – Monitoring | 37–42 | Execution dashboard, logs, analytics, Inngest integration |
| 8 – Advanced Backend | 43–49 | File upload, R2 storage, AI generation (Gemini), Webhooks, Circuit breaker |
| 9 – Payments | 50–52 | Razorpay, plan enforcement, billing UI |
| 10 – Security & Testing | 53–56 | Audit logs, RBAC, Jest unit tests, integration tests |
| 11 – DevOps | 57–59 | GitHub Actions CI/CD, Docker production build, deployment |
| 12 – Polish | 60 | Performance, accessibility, README, portfolio prep |

---

## Security Rules (Non-Negotiable)

- Clerk middleware on ALL protected backend routes
- Helmet.js applied globally
- CORS configured per environment (not wildcard in prod)
- Rate limiting on every route via Token Bucket middleware
- Input validation via Zod on every POST/PATCH/PUT endpoint
- No sensitive data in logs
- RBAC enforced: Owner > Admin > Member > Viewer

---

## HLD Patterns In Use

Document these in the README (the interviewer will ask):
- Event-Driven Architecture (Redis Pub/Sub + Inngest + Socket.io)
- CQRS (light — separate read/write paths)
- Circuit Breaker (custom implementation)
- Distributed Locking (Redis Redlock)
- Bulkhead Pattern (isolated Inngest queues per workspace)
- Idempotency (unique request IDs + DB checks)

---

## Coding Standards

- TypeScript strict mode everywhere
- ESLint + Prettier enforced
- No `any` types — use proper interfaces from `@flowforge/shared-types`
- All async functions use try/catch and throw `AppError` on failure
- All controllers are thin — delegate to services
- Tests live in `__tests__/` folders next to the code they test
- Every new route must be tested with at least one happy-path + one error-path test
