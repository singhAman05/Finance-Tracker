# Finance Tracker

Finance Tracker is a full-stack personal finance web app focused on clarity, control, and consistency.

It helps users manage accounts, track spending, monitor budgets, and stay ahead of recurring bills with a clean, fast, mobile-friendly experience.

## Product Highlights

- Unified dashboard for net worth, cash flow, budgets, and bills
- Transaction tracking with filters, categories, and account-level context
- Budget planning with utilization insights and over-spend alerts
- Bill lifecycle support (upcoming, overdue, paid)
- Reports for trends, category mix, account performance, and exports
- Secure authentication (Google OAuth + backend auth controls)
- Automated scheduler for reminders and budget alerts

## Website Experience

The website is designed as a real product, not just a demo:

- Marketing + product pages for onboarding and trust
- Auth flow and guided profile completion
- Fully responsive dashboard UX across desktop and mobile
- Engineering blog and direct feedback pipeline

### Main Routes

- `/` - Product landing page
- `/login` - Authentication
- `/dashboard` - Financial command center
- `/dashboard/transactions` - Transaction management
- `/dashboard/budgets` - Budget planning and health
- `/dashboard/bills` - Bill tracking and payments
- `/dashboard/reports` - Financial insights and exports
- `/blog/engineering` - Build journey + feedback form

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Redux Toolkit, Tailwind CSS, Framer Motion, Recharts
- Backend: Express, TypeScript, Supabase (Postgres), Redis, Nodemailer, node-cron
- Monorepo: separate frontend and backend apps in one repository

## Repository Structure

```text
.
|-- finance-tracker-backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- routes/
|   |-- services/
|   `-- server.ts
|-- finance-tracker-frontend/
|   |-- src/app/
|   |-- src/components/
|   |-- src/service/
|   `-- src/routes/
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm --prefix finance-tracker-backend install
npm --prefix finance-tracker-frontend install
```

### Run Backend

```bash
cd finance-tracker-backend
npx ts-node-dev --respawn --transpile-only server.ts
```

### Run Frontend

```bash
cd finance-tracker-frontend
npm run dev
```

## Environment Configuration

### Backend (`finance-tracker-backend/.env`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Finance Tracker <your-email@gmail.com>"
```

### Frontend (`finance-tracker-frontend/.env.local`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="FinanceTracker Feedback <your-email@gmail.com>"
FEEDBACK_TO_EMAIL=you@example.com

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

## Current Status

Finance Tracker is actively evolving with a production-oriented roadmap:

- richer forecasting and decision-support insights
- deeper automation for recurring finance workflows
- broader customization for dashboard and reports
- continued performance and security hardening
