# Finance Tracker

Finance Tracker is a full-stack personal finance platform designed to help people manage money with clarity, consistency, and control.

It combines a modern frontend experience with a scalable backend foundation so users can track day-to-day spending, monitor account health, plan budgets, and stay ahead of bills from one place.

## Why this project exists

Most finance apps either feel too basic or too complex. Finance Tracker is built to stay in the middle:

- Simple enough to use every day.
- Powerful enough to give meaningful financial insight.
- Structured enough to scale into a complete money operating system.

## What Finance Tracker does well

- Unified financial visibility across accounts, transactions, budgets, and bills.
- Clear dashboard and reporting workflows for monthly trends and spending patterns.
- Practical budgeting and bill tracking for real-world financial planning.
- Clean, modern UI built for both desktop and mobile use.
- Modular architecture that supports fast iteration and future expansion.

## Current capabilities

- Secure authentication and onboarding flows.
- Account management for multiple account types.
- Income and expense transaction tracking.
- Category-based financial organization.
- Budget setup, monitoring, and summary tracking.
- Bill management with recurring behavior support.
- Dashboard + reports for financial insights.
- Performance-minded caching in core backend flows.
- Rate limiting implemented in the backend for better API protection and abuse control.

## Tech stack

- Frontend: Next.js, React, Redux Toolkit, Tailwind CSS, Radix UI, NextAuth
- Backend: Express, TypeScript, Supabase, Redis
- Repository: Monorepo with separate frontend and backend applications

## Project structure

```text
.
|-- finance-tracker-backend/
|   |-- config/
|   |-- controllers/
|   |-- database/
|   |-- middleware/
|   |-- routes/
|   |-- services/
|   `-- server.ts
|-- finance-tracker-frontend/
|   |-- src/app/
|   |-- src/components/
|   |-- src/routes/
|   |-- src/service/
|   `-- src/types/
`-- design.drawio
```

## Local setup

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
npm --prefix finance-tracker-backend install
npm --prefix finance-tracker-frontend install
```

### Run backend

```bash
cd finance-tracker-backend
npx ts-node-dev --respawn --transpile-only server.ts
```

### Run frontend

```bash
cd finance-tracker-frontend
npm run dev
```

## Environment notes

For local auth-related flows, configure required frontend environment variables (for example in `.env.local`) such as:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## What to expect next

Finance Tracker is under active development. Upcoming improvements are focused on:

- smarter analytics and forecasting
- richer monthly/weekly financial insights
- better personalization of dashboard cards
- stronger notification and reminder workflows
- more automation around recurring bills and budget alerts
- continued security hardening and performance optimization

## Vision

Finance Tracker is being built as a reliable daily companion for personal finance, not just a transaction logger. The goal is to help users understand money behavior, make better financial decisions, and build long-term financial confidence.
