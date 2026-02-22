# Finance Tracker

A full-stack personal finance management application with a **Next.js frontend** and an **Express + TypeScript backend**. It helps users track accounts, transactions, budgets, bills, categories, and profile information in one dashboard-driven experience.

## What this repository contains

This monorepo includes two main applications:

- `finance-tracker-frontend` — Next.js 15 app (React 19, Redux Toolkit, Tailwind, Radix UI, NextAuth).
- `finance-tracker-backend` — Express API server (TypeScript) with Supabase and Redis integration.

There are also SQL files under `finance-tracker-backend/database/` for bill and budget schema/aggregation setup.

## Core features

- Authentication flows:
  - Phone-based login (custom backend endpoint)
  - Google OAuth login via NextAuth
- User profile onboarding/completion
- Account management (create, list, delete)
- Transaction management (add, list, delete)
- Category management (create custom categories + fetch system categories)
- Budget management (create, list, update, delete, summary)
- Bills and bill instances (create bills, list bills, list bill instances, mark paid)
- Dashboard and reporting views in the frontend

## High-level architecture

### Frontend

- Built using the Next.js App Router.
- Uses Redux Toolkit for client-side state slices (`auth`, `accounts`, `transactions`, `budgets`, `bills`, `categories`, and modal state).
- Uses component-driven UI under `src/components/*` (dashboard, reports, budgets, bills, transactions, profile, auth, shared UI).
- Uses NextAuth for Google sign-in (`src/app/api/auth/[...nextauth]/route.ts`).

### Backend

- Express server exposed on port `8000`.
- JWT middleware protects most API resources.
- Route/controller/service layering under:
  - `routes/`
  - `controllers/`
  - `services/`
- Integrates Supabase client and Redis client through `config/`.

## API route groups (backend)

Base URL: `http://localhost:8000`

- `/api/auth` — phone login, Google login exchange
- `/api/profile` — profile completion
- `/api/accounts` — account CRUD actions
- `/api/category` — category endpoints
- `/api/transactions` — transaction endpoints
- `/api/budgets` — budget endpoints
- `/api/bills` — bill + bill-instance endpoints

## Quick start

## 1) Prerequisites

- Node.js 18+
- npm

## 2) Install dependencies

From repository root:

```bash
npm install
npm --prefix finance-tracker-backend install
npm --prefix finance-tracker-frontend install
```

## 3) Run backend

From repo root:

```bash
cd finance-tracker-backend
npx ts-node-dev --respawn --transpile-only server.ts
```

Backend starts on `http://localhost:8000`.

## 4) Run frontend

In a separate terminal:

```bash
cd finance-tracker-frontend
npm run dev
```

Frontend starts on `http://localhost:3000`.

## Environment configuration notes

The codebase currently references several config values directly in source and also expects OAuth-related environment variables in the frontend.

For local setup, you will typically need to define NextAuth-related variables in the frontend environment (for example `.env.local` in `finance-tracker-frontend`):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

You may also want to move backend credentials/secrets to environment variables for safer configuration management.

## Repository structure

```text
.
├── finance-tracker-backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── server.ts
├── finance-tracker-frontend/
│   ├── src/app/
│   ├── src/components/
│   ├── src/routes/
│   ├── src/service/
│   └── src/types/
└── design.drawio
```

## Current status

This appears to be an actively developed project with a solid feature base for personal finance tracking, organized around a clear frontend/backend separation and modular domain-based routes/services.
