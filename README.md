# Flex Living – Reviews Dashboard

Stack: **TypeScript**, **Node.js/Express**, **React + Vite**.

## Install
```bash
# terminal 1
cd server && npm i    # or pnpm i / yarn
# terminal 2
cd web && npm i       # or pnpm i / yarn
```

## Config
Copy `.env.example` în `server/.env` and add keys.`GOOGLE_API_KEY` is optional

## Run in dev
```bash
# terminal 1
cd server && npm run dev
# terminal 2
cd web && npm run dev
```

Drontend proxy `/api` to `http://localhost:5179`.

## Important Routes
- `GET /api/reviews/hostaway` – normalize (mock) Hostaway, query filters.
- `GET /api/reviews?placeId=...` – Hostaway + Google (if exists)
- `POST /api/reviews/approval` – { reviewId, approved }.
- `GET /api/public/reviews?listingName=...` – only approved reviews

## Note
Sandbox Hostaway does not has reviews -> use `server/src/mock/hostaway.sample.json`.
