# Flex Living – Reviews Dashboard (Brief Documentation)

## 1) Tech Stack

- **Frontend:** React 18 + Vite + TypeScript. Lightweight components, custom CSS theme (forest-green), CSS variables.
- **Backend:** Node.js + Express + TypeScript.
- **Data & State:** In-memory + `lowdb` JSON file for approvals (MVP-friendly persistence).
- **Validation:** `zod` for query/body validation.
- **Utilities:** `node-fetch` for external calls, `dotenv` for env config.
- **Build/Dev:** `tsx` for TS runtime in dev, `tsc` for builds, Vite as dev server (proxy to backend).

## 2) Key Design & Logic Decisions

- **Normalized Review Model** (frontend/backend shared semantics):
  ```ts
  {
    id: string;
    sourceId?: string|number;
    listingName?: string;
    channel: 'hostaway'|'google';
    type: 'guest-to-host'|'host-to-guest'|'unknown';
    status?: string;
    overallRating?: number|null;  // unified 0..5 scale
    categoryRatings?: { category: string; rating: number }[]; // raw (0..10 where applicable)
    publicReview?: string|null;
    submittedAt: string;          // ISO 8601
    guestName?: string|null;
    approved?: boolean;           // controlled by manager in the dashboard
  }
  ```
- **Rating Normalization:**
  - If a numeric rating exists (e.g., Google), clamp to **0..5**.
  - If only category ratings are present (e.g., Hostaway mock `0..10`), compute the mean and map to **0..5** (`avg10/2`, rounded to 1 decimal).

- **MVP Persistence:** Approvals are stored in `lowdb` (`data.db.json`) keyed by `reviewId`. This keeps the MVP simple and testable without requiring a DB.

- **Separation of Concerns:** Backend handles normalization + filtering; frontend focuses on filtering UI, sorting, and approval toggles.

- **Public vs Internal Views:**
  - **Dashboard** shows _all_ reviews (filtered/sorted) with approval toggles.
  - **Property page** shows **approved-only** reviews to align brand control with public display.

## 3) API Behaviors

> Base URL during dev: frontend proxies `/api` to backend (default `http://localhost:5179`).

### `GET /api/reviews/hostaway`

**Purpose:** Required route; returns normalized Hostaway reviews from a mock file (sandbox contains no reviews).  
**Query params:** `from` (ISO), `to` (ISO), `minRating` (0..5).  
**Response:** `{ status: 'success'|'error', count?: number, result?: NormalizedReview[], message?: string }`  
**Notes:** Sorted by `submittedAt` desc.

### `GET /api/reviews`

**Purpose:** Aggregated feed (Hostaway + Google when `placeId` and `GOOGLE_API_KEY` are set).  
**Query params:** `channel`, `from`, `to`, `minRating`, `placeId`.  
**Behavior:** Fetches Hostaway (mock) and, if provided, Google reviews; merges, filters, and returns normalized results.

### `POST /api/reviews/approval`

**Body:** `{ reviewId: string, approved: boolean }`.  
**Effect:** Persists approval state in `lowdb`.  
**Response:** `{ status: 'success' }` or `{ status: 'error', message }`.

### `GET /api/public/reviews`

**Purpose:** Public-facing endpoint for property pages.  
**Query params:** `listingName` (optional).  
**Behavior:** Returns **approved-only** reviews (Hostaway + Google if configured).

## 4) Google Reviews – Findings & Approach

- **Feasibility:** Yes for a **basic integration** via **Google Places API (Place Details – New)**.
- **Implementation in project:** `GET /api/reviews?placeId=...` calls `fetchGoogleReviews(placeId)` which uses Places Details to fetch up to ~**5 most relevant** reviews, then normalizes them to the shared model.
- **Constraints:**
  - Only **~5 reviews** are available via Places Details; **no pagination** to fetch “all reviews”.
  - Must respect **attribution** (display author name; avoid misusing data per Google policies).
  - **Billing/Quotas** apply; recommend response **caching** (e.g., 6–24h) and graceful fallbacks.
- **If you need the full review feed or replying capabilities:** consider **Google Business Profile APIs** (requires ownership/verification of the business locations and separate onboarding).

## 5) Project Setup (Dev)

```bash
# Backend
cd server
cp .env.example .env   # fill GOOGLE_API_KEY optionally
npm i
npm run dev

# Frontend
cd web
npm i
npm run dev
# Open http://localhost:5173  (Vite proxies /api to http://localhost:5179)
```

**Test the required route:**

```bash
curl 'http://localhost:5179/api/reviews/hostaway?minRating=3.5'
```

## 6) UX/ UI Overview

- **Manager Dashboard:**
  - Filters (channel, date range, minimum rating), sorting (recent/highest/lowest), per-property KPIs.
  - Approve/unapprove switch on each review; approved reviews become eligible for the public page.
- **Property Page:**
  - Simplified property layout with an **Approved Reviews** section only.

## 7) Future Enhancements

- Database-backed storage (SQLite/Postgres) and incremental imports.
- Per-listing `placeId` management, server-side caching, and prefetch (cron).
- Tagging and trend insights (top complaint categories, alerts for low ratings).
- CSV export, pagination, role-based access control.

@ChatGPT 5.1 (AI) helped me with clarifications, ideas, and implementation throughout the project.