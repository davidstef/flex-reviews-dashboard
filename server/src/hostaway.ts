import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { NormalizedReview, ReviewType } from './types.js';
import { getApproval } from './store.js';

function toISO(input: string): string {
  return new Date(input.replace(' ', 'T') + 'Z').toISOString();
}

function normalizeType(t: string | null | undefined): ReviewType {
  if (t === 'guest-to-host' || t === 'host-to-guest') return t;
  return 'unknown';
}

function computeOverallFromCategories(categories?: {category: string; rating: number}[], fallback?: number | null): number | null {
  if (typeof fallback === 'number') return Math.max(0, Math.min(5, fallback));
  if (!categories || categories.length === 0) return null;
  const avg10 = categories.reduce((s, c) => s + (c.rating ?? 0), 0) / categories.length;
  return Math.round((avg10 / 2) * 10) / 10;
}

export async function fetchHostawayMock(): Promise<NormalizedReview[]> {
  const file = path.join(process.cwd(), 'src', 'mock', 'hostaway.sample.json');
  const raw = await fs.readFile(file, 'utf8');
  const data = JSON.parse(raw) as { status: string; result: any[] };

  const normalized: NormalizedReview[] = (data.result ?? []).map((r) => {
    const id = `hostaway_${r.id ?? nanoid(8)}`;
    const overall = computeOverallFromCategories(r.reviewCategory, r.rating ?? null);
    return {
      id,
      sourceId: r.id,
      listingName: r.listingName ?? undefined,
      channel: 'hostaway',
      type: normalizeType(r.type),
      status: r.status ?? undefined,
      overallRating: overall,
      categoryRatings: r.reviewCategory ?? [],
      publicReview: r.publicReview ?? null,
      submittedAt: toISO(r.submittedAt),
      guestName: r.guestName ?? null,
      approved: getApproval(id) ?? false,
    } satisfies NormalizedReview;
  });

  normalized.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return normalized;
}
