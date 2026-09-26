# Demo Kiosk: self-service ordering

Full-stack portfolio project: a restaurant self-service kiosk with a kitchen display and an admin panel.

**Stack:** Next.js 16 (App Router) · TypeScript · CSS Modules · Prisma 7 · PostgreSQL 17 (Docker)

## Getting started

Requirements: Node.js ≥ 22.12, Docker Desktop.

```bash
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm install               # also runs `prisma generate`
npm run db:up             # start Postgres in Docker
npm run dev               # http://localhost:3000
```

## Scripts

| Script | What it does |
|--------|--------------|
| `dev` / `build` / `start` | Next.js dev server / production build / run build |
| `lint` / `typecheck` | ESLint / TypeScript without emitting |
| `db:up` / `db:down` | Start / stop the Postgres container |
| `db:migrate` | Create + apply a migration from schema changes |
| `db:generate` | Regenerate the Prisma client |
| `db:studio` | Browse the DB in Prisma Studio |