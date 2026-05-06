# Finance Tracker — UI/UX Design Specification

## 1. Design Philosophy

* **Clarity over decoration** — Every pixel serves a purpose. Financial data demands zero ambiguity.
* **Breathing room** — Generous whitespace reduces cognitive load when dealing with numbers.
* **Progressive disclosure** — Show what matters first, details on demand.
* **Motion with intent** — Subtle animations confirm actions and guide attention, never distract.
* **Dark-first, light-ready** — Dark mode as default (reduces eye strain for daily use), light mode available.
* **Mobile-first** — Designed for phone, enhanced for desktop.

---

## 2. Design System

### 🎨 Color Palette

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| Primary | `#6366F1` (Electric Indigo) | `#6366F1` | Buttons, active states, focus rings, links |
| Success | `#10B981` (Emerald) | `#10B981` | Income, positive trends, healthy budgets |
| Danger | `#F43F5E` (Rose) | `#F43F5E` | Expenses, negative trends, exceeded budgets |
| Warning | `#F59E0B` (Amber) | `#F59E0B` | Budget warnings (80-100%), alerts |
| Background | `#0F172A` (Midnight Navy) | `#F8FAFC` (Slate Frost) | Page background |
| Surface | `#1E293B` (Dark Slate) | `#FFFFFF` (Pure White) | Cards, panels, modals |
| Border | `#334155` at 60% opacity | `#E2E8F0` at 60% opacity | Card borders, dividers |
| Text Primary | `#F8FAFC` | `#0F172A` | Headings, amounts, primary content |
| Text Secondary | `#94A3B8` | `#64748B` | Labels, descriptions, timestamps |

### 🅰️ Typography

| Element | Font | Weight | Size | Notes |
|---------|------|--------|------|-------|
| Headings | Inter | 700 (Bold) | 24-32px | Tight tracking (-0.025em) |
| Subheadings | Inter | 600 (Semi-bold) | 16-20px | — |
| Body | Inter | 400 (Regular) | 14px | Line height 1.6 |
| Labels | Inter | 600 | 11-12px | Uppercase, tracking-wider |
| Numbers / Amounts | Inter (mono features) | 700 | 24-32px | Tabular numbers, tight tracking |
| Small / Captions | Inter | 400-500 | 11-12px | Secondary color |

### 🧩 Component Tokens

| Component | Radius | Shadow | Hover |
|-----------|--------|--------|-------|
| Cards | `rounded-xl` (12px) | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Elevate shadow on hover |
| Buttons | `rounded-lg` (8px) | Subtle on default variant | Scale 0.98 on press |
| Inputs | `rounded-xl` (12px) | None | Focus ring (primary) |
| Modals | `rounded-xl` (12px) | `0 25px 50px -12px rgb(0 0 0 / 0.4)` | — |
| Badges | `rounded-full` | None | — |
| Tables | `rounded-xl` container | None | Row highlight on hover |

### 📐 Spacing & Layout

* **Grid**: 8pt base unit
* **Card gaps**: 24px (gap-6)
* **Section spacing**: 32-48px
* **Content max-width**: 1280px, centered
* **Page padding**: `px-4 md:px-8 lg:px-12`
* **Card padding**: 24px (p-6)

---

## 3. Layout Structure

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────┐
│  Sidebar (240px, fixed)  │  Main Content Area     │
│  ─ Logo                  │  ─ Page Header         │
│  ─ Navigation Links      │  ─ Content (max 1280)  │
│  ─ User avatar (bottom)  │                        │
└──────────────────────────────────────────────────┘
```

### Mobile (<1024px)
```
┌────────────────────────┐
│  Top Bar (logo + menu) │
│  ─────────────────────  │
│  Main Content (full)    │
│                         │
│  ─────────────────────  │
│  Bottom Nav (5 items)   │
└────────────────────────┘
```

### Sidebar Design
* Gradient logo icon (primary → purple)
* Navigation items with icon + label
* Active state: filled background + primary color
* Hover: subtle background shift
* Collapsed state on tablet (icons only)

---

## 4. Pages

---

## 🔐 Login / Auth Page

### Purpose
Secure entry point with minimal friction.

### Layout
* Full-screen split: decorative left (pattern/illustration) + form right
* Or centered card on dark background with subtle dot-grid pattern

### Elements
* App logo + tagline
* Email / Phone input
* OTP verification flow
* "Continue" button (full-width, primary)
* Footer links: Terms of Service, Privacy Policy

### Design References
* [Linear.app login](https://linear.app) — clean centered card, dark bg
* [Mercury.com](https://mercury.com) — fintech-grade minimal auth
* [Wise.com](https://wise.com) — clear single-field focus

### UX Notes
* Single field visible at a time (progressive)
* Auto-focus on input
* Inline validation (no page reload)
* OTP auto-advance between digits

---

## 🏠 Dashboard Page

### Purpose
At-a-glance financial health — answer "How am I doing?" in 3 seconds.

### Layout
```
┌─────────────────────────────────────────────┐
│  Summary Cards (3-4 cols)                    │
├─────────────────────────────────────────────┤
│  Chart: Income vs Expense │  Quick Stats     │
├─────────────────────────────────────────────┤
│  Recent Transactions      │  Upcoming Bills  │
└─────────────────────────────────────────────┘
```

### Summary Cards
* **Net Worth** — total balance, % change from last month
* **Cash Flow** — income minus expenses this month
* **Budget Health** — overall % used
* **Upcoming Bills** — count + total due

### Charts
* Income vs Expense (Area chart, gradient fill, smooth curves)
* Expense by category (Donut chart with center stat)

### Design References
* [Copilot Money](https://copilot.money) — summary cards with trends
* [Monarch Money](https://monarchmoney.com) — clean dashboard hierarchy
* [Lunary.ai](https://lunary.ai) — modern card-based metrics

### UX Notes
* Numbers animate on load (count-up)
* Cards stagger-animate in (0.08s delay each)
* Period selector (This Month / Last Month / Custom)
* Greeting: "Good morning, {name}" with time-based icon

---

## 💰 Accounts Page

### Purpose
Manage all bank accounts, credit cards, and track net worth.

### Layout
```
┌─────────────────────────────────────────────┐
│  Header: "Financial Assets" + Add Account    │
├─────────────────────────────────────────────┤
│  Stat Cards: Net Worth │ Liabilities │ Count │
├─────────────────────────────────────────────┤
│  Accounts Table/List                         │
│  ─ Bank logo │ Name │ Type │ Balance │ Status│
└─────────────────────────────────────────────┘
```

### Design References
* [Mercury Dashboard](https://mercury.com) — account cards with bank branding
* [Stripe Dashboard](https://dashboard.stripe.com) — clean table with status badges

### UX Notes
* Net worth shows negative in red with minus sign
* Trend badge: green if net worth growing, red if shrinking
* Bank logos for visual recognition
* Account type as subtle badge (Credit Card, Savings, etc.)
* Delete confirmation dialog with account name

---

## 💸 Transactions Page

### Purpose
Full history with powerful filtering — find any transaction instantly.

### Layout
```
┌─────────────────────────────────────────────┐
│  Header: Stats cards (income/expense/net)    │
├─────────────────────────────────────────────┤
│  Filters: Search │ Account │ Category        │
├─────────────────────────────────────────────┤
│  Transaction List (mobile: cards, desk: tbl) │
│  ─ Date │ Description │ Category │ Amount    │
├─────────────────────────────────────────────┤
│  Load More (if > 20 items)                   │
└─────────────────────────────────────────────┘
```

### Mobile Card Design
```
┌──────────────────────────────────┐
│ [icon] Description        -₹500  │
│         Date · Category          │
└──────────────────────────────────┘
```

### Design References
* [Cleo app](https://meetcleo.com) — transaction list with category icons
* [Revolut](https://revolut.com) — clean mobile transaction cards
* [N26](https://n26.com) — minimal list with amount emphasis

### UX Notes
* Amount column: monospace font, right-aligned
* Green for income (+), red for expense (-)
* Search with debounce (300ms)
* Filters as pill-shaped selects
* Add button: FAB on mobile, header button on desktop
* Delete: swipe on mobile, icon button on desktop

---

## ➕ Add Transaction Modal

### Layout
* Overlay modal (max-w-lg), centered
* Dot-grid background pattern (subtle)
* Clear hierarchy: Amount → Type → Category → Date → Description

### Fields
| Field | Type | Design |
|-------|------|--------|
| Amount | Number input | Large (text-2xl), currency prefix, bold |
| Type | Toggle pills | Income (green) / Expense (red) |
| Category | Select dropdown | With category color dots |
| Account | Select dropdown | With bank logos |
| Date | Date picker | Default today, calendar popover |
| Description | Text input | Optional, placeholder hint |
| Recurring | Switch toggle | Expands frequency options |

### Design References
* [Splitwise](https://splitwise.com) — large amount input focus
* [Notion modals](https://notion.so) — clean modal with sections

### UX Notes
* Amount field auto-focused on open
* Category shows recently used first
* Submit button disabled until required fields filled
* Success toast + modal close on submit

---

## 📅 Bills Page

### Purpose
Track recurring obligations and never miss a payment.

### Layout
```
┌─────────────────────────────────────────────┐
│  Stats: Upcoming Total │ Overdue │ Paid      │
├─────────────────────────────────────────────┤
│  Bills Grid (cards)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Netflix  │ │  Rent    │ │  Electric│    │
│  │  ₹499/mo │ │  ₹15k/mo │ │  ₹2.1k  │    │
│  │  Due: 5th │ │  Due: 1st│ │  Due: 15 │    │
│  │  [Pay]    │ │  [Pay]   │ │  [Paid✓] │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

### Bill Card States
* **Upcoming**: Default border, primary accent
* **Due Soon** (≤3 days): Warning border glow
* **Overdue**: Danger border, red badge
* **Paid**: Success checkmark, muted card

### Design References
* [Prism (bill tracker)](https://prismmoney.com) — bill timeline view
* [Truebill/Rocket Money](https://rocketmoney.com) — bill cards with status

### UX Notes
* "Pay" button triggers instant mark-as-paid + balance deduction
* Reminder badge shows "Reminder in X days"
* Recurring icon for auto-repeating bills
* Add bill form: same modal pattern as transactions

---

## 📊 Budgets Page

### Purpose
Set spending limits per category and track progress.

### Layout
```
┌─────────────────────────────────────────────┐
│  Stats: Overall % │ Healthy │ Warning │ Over │
├─────────────────────────────────────────────┤
│  Budget Cards Grid                           │
│  ┌────────────────────────────────────┐      │
│  │  🍔 Food & Dining                  │      │
│  │  ████████████░░░░ 72% (₹7.2k/₹10k)│      │
│  │  ₹2,800 remaining · 12 days left   │      │
│  └────────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

### Budget Card Design
* Category icon + name
* Progress bar (green < 80%, amber 80-100%, red > 100%)
* Spent / Limit amounts
* Remaining amount + days until reset
* Percentage badge (top-right)

### Design References
* [YNAB](https://ynab.com) — category-based budget bars
* [Goodbudget](https://goodbudget.com) — envelope-style progress

### UX Notes
* Progress bars animate on load
* Exceeded budgets float to top
* "Add Budget" opens form with category picker + amount + period
* Period options: Weekly, Monthly, Quarterly, Yearly

---

## 📈 Reports Page

### Purpose
Deep financial analysis with exportable insights.

### Layout
* Tab-based navigation: Overview │ Cash Flow │ Trends │ Categories │ Budgets │ Accounts
* Period selector in header (This Month, Last 3 Months, Last 6 Months, All Time)

### Tabs Detail

**Overview**: Summary KPIs + Income vs Expense bar chart + Expense pie + Budget health + Forecast Watch

**Cash Flow**: Monthly income/expense area chart + Daily cumulative line + 90-day balance forecast

**Trends**: Savings rate line chart + Month-over-month growth bars + Summary stat cards (savings %, expense growth, months tracked)

**Categories**: Category breakdown table with share percentages + visual bars

**Budgets**: Budget utilization summary with health indicators

**Accounts**: Per-account income/expense/net breakdown

### Design References
* [Plaid Dashboard](https://plaid.com) — financial charts and metrics
* [PostHog](https://posthog.com) — tab-based analytics with clean charts
* [Linear Insights](https://linear.app) — minimal chart styling

### UX Notes
* Charts use gradient fills (not solid)
* Tooltips on hover with formatted currency
* Export buttons: CSV + JSON
* Forecast Watch: alert card if balance projected negative

---

## ⚙️ Settings Page

### Purpose
Personalize the app experience.

### Layout
```
┌─────────────────────────────────────────────┐
│  Section: Preferences                        │
│  ─ Currency (dropdown: INR, USD, EUR, GBP)   │
│  ─ Date Format (DD/MM/YYYY, MM/DD/YYYY...)   │
├─────────────────────────────────────────────┤
│  Section: Notifications                      │
│  ─ Bill Reminders (toggle)                   │
│  ─ Budget Alerts (toggle)                    │
│  ─ Recurring Transaction Alerts (toggle)     │
├─────────────────────────────────────────────┤
│  Section: Danger Zone                        │
│  ─ Clear Transaction History                 │
│  ─ Delete Account (future)                   │
└─────────────────────────────────────────────┘
```

### Design References
* [GitHub Settings](https://github.com/settings) — sectioned layout with danger zone
* [Vercel Settings](https://vercel.com) — clean toggle switches

### UX Notes
* Changes auto-save with debounce (show "Saved" toast)
* Danger actions require confirmation dialog
* Notification toggles send email based on settings

---

## 👤 Profile Page

### Purpose
View and edit personal information.

### Layout
* Avatar (large, centered or left-aligned)
* Fields: Name, Email, Phone, Profession
* "Profile Complete" indicator
* Edit mode toggle

### Design References
* [Notion profile](https://notion.so) — minimal, centered layout
* [Cal.com](https://cal.com) — clean profile card

### UX Notes
* Inline editing (click field to edit)
* Avatar upload with preview
* Completion percentage bar

---

## 📄 Terms of Service Page

### Purpose
Legal terms governing use of the Finance Tracker platform.

### Route
`/terms`

### Layout
```
┌─────────────────────────────────────────────┐
│  Header: Logo + Back to Home                 │
├─────────────────────────────────────────────┤
│  Title: "Terms of Service"                   │
│  Last updated: [date]                        │
├─────────────────────────────────────────────┤
│  Content (prose typography):                 │
│  1. Acceptance of Terms                      │
│  2. Description of Service                   │
│  3. User Accounts & Responsibilities         │
│  4. Data & Privacy                           │
│  5. Intellectual Property                    │
│  6. Limitation of Liability                  │
│  7. Termination                              │
│  8. Changes to Terms                         │
│  9. Contact Information                      │
└─────────────────────────────────────────────┘
```

### Design
* Max-width 720px, centered
* Prose typography (larger line-height, comfortable reading)
* Numbered sections with clear headings
* Subtle left border accent on key clauses
* Sticky table of contents on desktop (optional)

### Design References
* [Linear Terms](https://linear.app/terms) — clean dark prose
* [Vercel Legal](https://vercel.com/legal) — structured, scannable
* [Notion Terms](https://notion.so/terms) — minimal and readable

### UX Notes
* Accessible from login page footer and settings
* No login required to view
* Print-friendly styles

---

## 🔒 Privacy Policy Page

### Purpose
Transparent explanation of data collection, storage, and usage practices.

### Route
`/privacy`

### Layout
```
┌─────────────────────────────────────────────┐
│  Header: Logo + Back to Home                 │
├─────────────────────────────────────────────┤
│  Title: "Privacy Policy"                     │
│  Last updated: [date]                        │
├─────────────────────────────────────────────┤
│  Content:                                    │
│  1. Information We Collect                   │
│  2. How We Use Your Data                     │
│  3. Data Storage & Security                  │
│  4. Third-Party Services                     │
│  5. Cookies & Tracking                       │
│  6. Your Rights (GDPR/CCPA)                  │
│  7. Data Retention                           │
│  8. Children's Privacy                       │
│  9. Changes to This Policy                   │
│  10. Contact Us                              │
└─────────────────────────────────────────────┘
```

### Key Content Points
* We store: email, name, financial data (encrypted at rest)
* We use Supabase (PostgreSQL) with Row Level Security
* We DO NOT sell data to third parties
* We use Redis for caching (ephemeral, auto-expires)
* JWT authentication via httpOnly cookies
* Users can request data export or deletion

### Design
* Same prose layout as Terms page
* Highlight boxes for important notices (data deletion rights, etc.)
* Expandable FAQ sections at bottom

### Design References
* [Plaid Privacy](https://plaid.com/legal) — fintech-grade privacy docs
* [Apple Privacy](https://apple.com/privacy) — user-friendly language

---

## 🛠️ Engineering Blog Page

### Purpose
Document the technical journey of building Finance Tracker — architecture decisions, challenges, and learnings.

### Route
`/blog/engineering`

### Layout
```
┌─────────────────────────────────────────────┐
│  Header: Logo + Navigation                   │
├─────────────────────────────────────────────┤
│  Hero: "Building Finance Tracker"            │
│  Subtitle: "A deep dive into architecture,   │
│  decisions, and engineering behind the app"   │
├─────────────────────────────────────────────┤
│  Table of Contents (left sidebar, sticky)    │
│                                              │
│  Article Content:                            │
│  ─ Tech Stack Overview                       │
│  ─ Architecture Decisions                    │
│  ─ Database Design                           │
│  ─ Authentication & Security                 │
│  ─ Performance Optimizations                 │
│  ─ Challenges & Solutions                    │
│  ─ What's Next                               │
├─────────────────────────────────────────────┤
│  Author Card + Date                          │
└─────────────────────────────────────────────┘
```

### Suggested Sections

**1. Tech Stack Overview**
* Frontend: Next.js 15, React 19, Tailwind CSS v4, Redux Toolkit, Framer Motion, Recharts
* Backend: Express 5, TypeScript, Supabase (PostgreSQL), Redis
* Auth: JWT httpOnly cookies + CSRF double-submit pattern
* Email: Nodemailer + node-cron scheduler

**2. Architecture Decisions**
* Why Supabase over raw PostgreSQL
* Why Express over Next.js API routes for backend
* Why Redux Toolkit over Zustand/Jotai
* Why httpOnly cookies over localStorage tokens

**3. Database Design**
* Schema diagram (draw.io embed or image)
* Row Level Security policies
* Atomic balance updates via RPC functions
* Pagination strategy

**4. Authentication & Security**
* CSRF protection (double-submit cookie)
* Rate limiting (per-IP + per-user)
* Input validation & sanitization
* OWASP Top 10 considerations

**5. Performance Optimizations**
* Redis caching layer with TTL strategy
* Optimistic UI updates
* Skeleton loading (boneyard-js)
* Lazy loading pages with Next.js dynamic imports

**6. Challenges & Solutions**
* Currency formatting (INR vs USD locale handling)
* Real-time balance updates after transactions
* Cache invalidation strategies
* Large number display on mobile

**7. What's Next**
* Email notifications (bill reminders, budget alerts)
* AI-powered spending insights
* Investment tracking
* Multi-currency accounts

### Design
* Long-form article layout (max-width 780px)
* Code blocks with syntax highlighting (dark theme)
* Architecture diagrams / screenshots
* Sticky TOC on desktop
* Reading time estimate at top
* Author avatar + bio at bottom

### Design References
* [Vercel Blog](https://vercel.com/blog) — technical with clean typography
* [Linear Method](https://linear.app/method) — engineering docs as storytelling
* [Stripe Engineering Blog](https://stripe.com/blog/engineering) — fintech engineering
* [Resend Blog](https://resend.com/blog) — modern dev blog aesthetic

### UX Notes
* Syntax-highlighted code blocks
* Copy button on code snippets
* Responsive images/diagrams
* Share buttons (Twitter, LinkedIn, copy link)
* Dark mode optimized

---

## 🏠 Landing Page (Public)

### Purpose
Convert visitors to sign-ups. Communicate value proposition instantly.

### Layout
```
┌─────────────────────────────────────────────┐
│  Navbar: Logo │ Features │ Blog │ Login      │
├─────────────────────────────────────────────┤
│  Hero: Headline + Subtext + CTA              │
│  "Take control of your money."               │
│  [Get Started Free]                          │
├─────────────────────────────────────────────┤
│  Features Grid (3 cols)                      │
│  ─ Track Spending │ Set Budgets │ Insights   │
├─────────────────────────────────────────────┤
│  Social Proof / Stats                        │
│  "₹2Cr+ tracked │ 500+ users │ 99.9% uptime"│
├─────────────────────────────────────────────┤
│  Footer: Links │ Terms │ Privacy │ Blog      │
└─────────────────────────────────────────────┘
```

### Design References
* [Mercury.com](https://mercury.com) — fintech hero with clean typography
* [Copilot Money](https://copilot.money) — feature highlights
* [Cal.com](https://cal.com) — open-source project landing

### UX Notes
* Hero numbers animate (count-up)
* Dot-grid or gradient background pattern
* CTA above the fold
* Responsive: stacks vertically on mobile

---

## 5. Interaction Patterns

### Micro-animations
| Trigger | Animation | Duration |
|---------|-----------|----------|
| Page load | Stagger fade-up (cards) | 0.4s, 0.08s stagger |
| Number display | Count-up from 0 | 1.5-2s |
| Button press | Scale to 0.95 | 0.1s |
| Card hover | Translate Y -4px + shadow elevate | 0.3s |
| Modal open | Fade + scale from 0.95 | 0.2s |
| Toast | Slide in from top-right | 0.3s |
| Delete | Slide out left + fade | 0.2s |

### Loading States
* **Initial load**: Skeleton placeholders (boneyard-js) matching final layout
* **Refresh**: Subtle spinner in header (no full-page block)
* **Pagination**: "Load More" button with spinner icon

### Error States
* Inline field errors (red text below input)
* Toast for API failures (auto-dismiss 5s)
* Empty states with illustration + CTA

---

## 6. Accessibility

* Focus rings on all interactive elements (2px primary)
* Keyboard navigation for all flows
* ARIA labels on icon-only buttons
* Color contrast: minimum 4.5:1 ratio
* Reduced motion: respect `prefers-reduced-motion`
* Screen reader friendly charts (aria-label with data summary)

---

## 7. Responsive Breakpoints

| Breakpoint | Label | Layout Changes |
|------------|-------|---------------|
| < 640px | Mobile | Single column, bottom nav, card list |
| 640-768px | Tablet-sm | 2-col grid for cards |
| 768-1024px | Tablet | Collapsed sidebar (icons), 2-col |
| ≥ 1024px | Desktop | Full sidebar, 3-4 col grids, table views |

---

## 8. Performance

* Lazy load chart libraries (recharts)
* Dynamic imports for page components
* Skeleton loading for perceived speed
* Debounce search (300ms)
* Optimistic UI for creates/deletes
* Redis cache on backend (TTL: 60s transactions, 300s accounts)
* Image optimization (bank logos as small PNGs)

---

## 9. Security UX

* Confirm dialogs for destructive actions (delete account, clear history)
* Session timeout warning (before JWT expires)
* CSRF token in cookies (transparent to user)
* Rate limit feedback (toast: "Too many requests, try again in X seconds")

---

## 10. Future Enhancements

* [ ] Investment tracking page
* [ ] Multi-currency accounts with auto-conversion
* [ ] AI spending insights ("You spent 20% more on food")
* [ ] Receipt scanning (OCR)
* [ ] Shared budgets (couples/families)
* [ ] Webhook integrations (bank feeds)
* [ ] PWA support (installable, offline-capable)
* [ ] Dark/Light mode toggle in settings

---
