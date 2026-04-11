# ReloAI — AI Relocation Advisor

> AI-powered SaaS that helps people find the best country to relocate to.

🌐 **Live Demo:** https://relo-ai-7rj3.vercel.app

---

## Problem

People spend weeks researching where to relocate — comparing visa rules,
cost of living, job markets, and climate across dozens of countries.
There's no single tool that gives a personalized, structured answer.

## Solution

ReloAI takes your profession, budget, and goals — and analyzes 195 countries
using AI. It returns a ranked shortlist with visa requirements, real cost ranges,
and a month-by-month relocation roadmap. All in under 3 minutes.

---

## Features

- 🤖 AI analysis of 195 countries based on user profile
- 📊 Scored ranking (0–100) with pros/cons per country
- 🛂 Visa type, requirements, and timeline per destination
- 💰 Real monthly cost ranges for each country
- 🗺️ Month-by-month relocation roadmap
- 👤 User authentication (JWT)
- 📋 Analysis history saved per user
- 🔒 Usage limits: Free (3/month) / Pro (unlimited)
- 💳 Stripe payments integration

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Fastify | High-performance HTTP framework |
| TypeScript | Type safety |
| Prisma | ORM |
| PostgreSQL | Database |
| OpenAI API | AI-powered country analysis |
| Stripe | Payment processing |
| JWT | Authentication |
| Zod | Input validation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |

---

## Architecture
---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Stripe account (optional for payments)

### Installation

```bash
git clone https://github.com/Tim124v/ReloAI.git
cd ReloAI
npm run setup
```

### Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/reloai
JWT_SECRET=your-secret-key-minimum-32-chars
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

Frontend: http://localhost:5000
Backend: http://localhost:8080

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | — |
| POST | /api/auth/login | Login | — |
| GET | /api/auth/me | Get current user | ✅ |
| POST | /api/ai/analyze | Run AI analysis | ✅ |
| GET | /api/requests | Get user history | ✅ |
| POST | /api/billing/checkout | Create Stripe checkout | ✅ |
| GET | /health | Health check | — |

---

## Deployment

### Frontend → Vercel
1. Import repo on vercel.com
2. Set Root Directory: `frontend`
3. Add env variable: `NEXT_PUBLIC_API_URL`

### Backend → Vercel
1. Import same repo on vercel.com
2. Set Root Directory: `backend`
3. Add all env variables from `backend/.env`

### Database
Use any PostgreSQL provider:
- [Neon](https://neon.tech) — free tier
- [Supabase](https://supabase.com) — free tier
- [Vercel Postgres](https://vercel.com/storage/postgres)

---

## Author

**Timur Bakiiev**
- GitHub: [@Tim124v](https://github.com/Tim124v)
- LinkedIn: [timur-bakiiev](https://linkedin.com/in/timur-bakiiev)

---

*ReloAI — Making relocation decisions data-driven.*
