# ReloAI — AI Relocation Advisor

> Find the best country to relocate to — powered by AI.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://relo-ai-7rj3.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-4-green)](https://fastify.io)

🌐 **Live:** https://relo-ai-7rj3.vercel.app

---

## The problem

People spend weeks researching where to relocate — comparing visa rules,
cost of living, job markets, tax systems, and climate across dozens of countries.
There is no single tool that gives a personalized, structured answer fast.

## The solution

ReloAI takes your profession, monthly budget, and goals.
It uses AI to analyze 195 countries and returns:
- Ranked shortlist of top 5 countries scored 0–100
- Visa type, requirements, and realistic timeline
- Real monthly cost ranges per destination
- Month-by-month relocation roadmap
- Step-by-step pre-move checklist

All in under 3 minutes.

---

## Features

- AI analysis of 195 countries based on user profile
- Scored ranking with pros and cons per country
- Visa and cost data per destination
- Month-by-month relocation roadmap
- JWT authentication (register / login)
- Analysis history saved per user
- Usage limits: Free 3/month · Pro unlimited
- Stripe payments integration
- Freemium SaaS model

---

## Tech stack

### Backend
| Technology | Role |
|-----------|------|
| Fastify 4 | High-performance HTTP server |
| TypeScript | Type safety |
| Prisma | ORM |
| PostgreSQL | Database |
| OpenAI API | AI-powered analysis |
| Stripe | Payment processing |
| JWT | Authentication |
| Zod | Input validation |
| bcryptjs | Password hashing |

### Frontend
| Technology | Role |
|-----------|------|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| lucide-react | Icons |

### Infrastructure
| Technology | Role |
|-----------|------|
| Vercel | Frontend + backend hosting |
| PostgreSQL | Managed database |

---

## Architecture
---

## Local setup

### Requirements
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Install

```bash
git clone https://github.com/Tim124v/ReloAI.git
cd ReloAI
npm run setup
```

### Environment variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/reloai
JWT_SECRET=your-secret-key-min-32-chars
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5000
PORT=8080
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Run

```bash
npm run dev
```

- Frontend → http://localhost:5000
- Backend → http://localhost:8080
- Health check → http://localhost:8080/health

---

## API reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | JWT | Get current user |
| POST | /api/ai/analyze | JWT | Run AI analysis |
| GET | /api/requests | JWT | Get user history |
| GET | /api/requests/:id | JWT | Get single analysis |
| POST | /api/billing/checkout | JWT | Create Stripe session |
| GET | /health | — | Health check |

---

## Deployment

### Deploy frontend to Vercel
1. Go to vercel.com → New Project
2. Import this repo
3. Set Root Directory: `frontend`
4. Add env variable: `NEXT_PUBLIC_API_URL=<your backend URL>`
5. Deploy

### Deploy backend to Vercel
1. Go to vercel.com → New Project
2. Import this repo (second project)
3. Set Root Directory: `backend`
4. Add all env variables from `backend/.env`
5. Deploy

### Database options (free tier)
- [Neon](https://neon.tech) — recommended
- [Supabase](https://supabase.com)
- [Vercel Postgres](https://vercel.com/storage/postgres)

---

## Author

**Timur Bakiiev**

- GitHub: [@Tim124v](https://github.com/Tim124v)
- LinkedIn: [timur-bakiiev](https://linkedin.com/in/timur-bakiiev)
- Demo: [relo-ai-7rj3.vercel.app](https://relo-ai-7rj3.vercel.app)

---

*ReloAI — Making relocation decisions data-driven.*
