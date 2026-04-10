# ReloAI

AI-powered relocation advisor. Users describe their profession, budget, and goals, and the app returns ranked countries with visa paths, cost estimates, and a relocation plan.

## Architecture

Monorepo with two packages:

```text
frontend/   Next.js app (UI + API routes)
backend/    Fastify API server
```

## Running locally

```bash
# Install all dependencies
npm run setup

# Frontend only
cd frontend && npm run dev

# Frontend + backend
npm run dev
```

## Environment variables

Use:
- `frontend/.env.example`
- `backend/.env.example`

Create local `.env` files based on these examples for local development.

## Deployment

### Frontend (Vercel)
1. Go to vercel.com -> New Project
2. Import your GitHub repo
3. Set Root Directory to: `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL = your backend URL`
5. Deploy

### Backend (Vercel)
1. Go to vercel.com -> New Project
2. Import the same GitHub repo
3. Set Root Directory to: `backend`
4. Add environment variables (see `backend/.env.example`)
5. Deploy

### Database

Use any PostgreSQL provider:
- Vercel Postgres
- Supabase
- Neon

Update `DATABASE_URL` in backend environment variables.
