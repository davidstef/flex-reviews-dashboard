export interface NormalizedReview {
  id: string;
  listingName?: string;
  channel: "hostaway" | "google";
  type: "guest-to-host" | "host-to-guest" | "unknown";
  status?: string;
  overallRating?: number | null;
  categoryRatings?: { category: string; rating: number }[];
  publicReview?: string | null;
  submittedAt: string;
  guestName?: string | null;
  approved?: boolean;
}

export async function fetchReviews(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/reviews?${q}`);
  const data = await res.json();
  return data.result as NormalizedReview[];
}

export async function fetchHostaway(params?: Record<string, string | number>) {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/reviews/hostaway?${q}`);
  const data = await res.json();
  return data.result as NormalizedReview[];
}

export async function setApproval(reviewId: string, approved: boolean) {
  const res = await fetch("/api/reviews/approval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewId, approved }),
  });
  return res.ok;
}

export async function fetchPublicReviews(listingName?: string) {
  const q = listingName
    ? `?listingName=${encodeURIComponent(listingName)}`
    : "";
  const res = await fetch(`/api/public/reviews${q}`);
  const data = await res.json();
  return data.result as NormalizedReview[];
}
