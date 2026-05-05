# TaskFlow

Full-stack project management app with RBAC. Built with React 18 + Vite + Tailwind (frontend) and Node.js + Express + Supabase (backend).

## Quick start

### Prerequisites
- Node.js 18+
- Supabase project (apply migrations in `server/migrations/` in order)

### 1. Backend

```bash
cd server
cp .env.example .env   # fill in your Supabase + JWT secrets
npm install
node server.js         # → http://localhost:3001
```

### 2. Seed database

```bash
cd server
node scripts/seed.js
```

### 3. Frontend

```bash
cd client
npm install
npm run dev            # → http://localhost:5173
```

## Test accounts

| Email | Password | Role |
|---|---|---|
| admin@taskflow.dev | Admin@123 | Admin |
| member@taskflow.dev | Member@123 | Member |

## Environment variables (server/.env)

```
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
JWT_ACCESS_SECRET=<32+ char secret>
JWT_REFRESH_SECRET=<32+ char secret>
CLIENT_URL=http://localhost:5173
```

## Database migrations

Run in Supabase SQL editor in order:

1. `server/migrations/001_enums.sql`
2. `server/migrations/002_tables.sql`
3. `server/migrations/003_indexes.sql`
4. `server/migrations/004_triggers.sql`
5. `server/migrations/005_rls.sql`

## Features

- JWT auth (access token + httpOnly refresh cookie)
- RBAC: global admin / project admin / member
- Kanban board with inline task creation
- Task detail slide-over with activity log + comments
- Dashboard with stats and My Tasks table
- Projects grid with progress bars
- Admin: Members management + Project settings
