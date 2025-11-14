import fetch from 'node-fetch';
import { NormalizedReview } from './types.js';
import { getApproval } from './store.js';

export async function fetchGoogleReviews(placeId: string): Promise<NormalizedReview[]> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return [];

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=review,formatted_address,name&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: any = await res.json();
  const reviews = data?.result?.reviews ?? [];

  return (reviews as any[]).map((r, idx) => {
    const id = `google_${r.time ?? idx}`;
    return {
      id,
      sourceId: r.time ?? idx,
      listingName: data?.result?.name,
      channel: 'google',
      type: 'guest-to-host',
      status: 'published',
      overallRating: typeof r.rating === 'number' ? Math.max(0, Math.min(5, r.rating)) : null,
      categoryRatings: [],
      publicReview: r.text ?? null,
      submittedAt: new Date((r.time ?? Date.now()) * 1000).toISOString(),
      guestName: r.author_name ?? null,
      approved: getApproval(id) ?? false,
    } satisfies NormalizedReview;
  });
}
