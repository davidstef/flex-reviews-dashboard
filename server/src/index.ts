import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { fetchHostawayMock } from './hostaway.js';
import { fetchGoogleReviews } from './google.js';
import { setApproval } from './store.js';
import { ListReviewsQuery, NormalizedReview } from './types.js';

const app = express();
app.use(cors());
app.use(express.json());

const QuerySchema = z.object({
  listingId: z.string().optional(),
  channel: z.enum(['hostaway', 'google']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  minRating: z.coerce.number().optional(),
  placeId: z.string().optional(),
});

function applyFilters(items: NormalizedReview[], q: ListReviewsQuery) {
  let out = items;
  if (q.channel) out = out.filter(r => r.channel === q.channel);
  if (q.from) out = out.filter(r => r.submittedAt >= new Date(q.from!).toISOString());
  if (q.to) out = out.filter(r => r.submittedAt <= new Date(q.to!).toISOString());
  if (typeof q.minRating === 'number') out = out.filter(r => (r.overallRating ?? 0) >= q.minRating!);
  return out;
}

// Mandatory Hostaway route
app.get('/api/reviews/hostaway', async (req, res) => {
  try {
    QuerySchema.parse(req.query);
    const all = await fetchHostawayMock();
    const q: ListReviewsQuery = {
      channel: 'hostaway',
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
    };
    const out = applyFilters(all, q);
    res.json({ status: 'success', count: out.length, result: out });
  } catch (e: any) {
    res.status(400).json({ status: 'error', message: e?.message ?? 'Bad request' });
  }
});

// Aggregate Hostaway + Google
app.get('/api/reviews', async (req, res) => {
  try {
    const parsed = QuerySchema.parse(req.query);
    const [hostaway, google] = await Promise.all([
      fetchHostawayMock(),
      parsed.placeId ? fetchGoogleReviews(parsed.placeId) : Promise.resolve([]),
    ]);
    let merged = [...hostaway, ...google];
    merged = applyFilters(merged, parsed);
    res.json({ status: 'success', count: merged.length, result: merged });
  } catch (e: any) {
    res.status(400).json({ status: 'error', message: e?.message ?? 'Bad request' });
  }
});

// Review approval
app.post('/api/reviews/approval', async (req, res) => {
  const body = z.object({ reviewId: z.string(), approved: z.boolean() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ status: 'error', message: 'Invalid body' });
  await setApproval(body.data.reviewId, body.data.approved);
  res.json({ status: 'success' });
});

// Public (approved only)
app.get('/api/public/reviews', async (req, res) => {
  try {
    const listing = (req.query.listingName as string | undefined) ?? undefined;
    const all = await fetchHostawayMock();
    const google: NormalizedReview[] = []; // for simplicity, use /api/reviews?placeId=... when key exists
    const merged = [...all, ...google].filter(r => r.approved);
    const filtered = listing ? merged.filter(r => r.listingName === listing) : merged;
    res.json({ status: 'success', count: filtered.length, result: filtered });
  } catch (e: any) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

const PORT = Number(process.env.PORT ?? 5179);
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
