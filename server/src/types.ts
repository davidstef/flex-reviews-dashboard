export type ReviewType = "guest-to-host" | "host-to-guest" | "unknown";
export type ReviewChannel = "hostaway" | "google";

export interface CategoryRating { category: string; rating: number; }

export interface NormalizedReview {
  id: string;
  sourceId?: string | number;
  listingId?: string | number;
  listingName?: string;
  channel: ReviewChannel;
  type: ReviewType;
  status?: string;
  overallRating?: number | null;
  categoryRatings?: CategoryRating[];
  publicReview?: string | null;
  submittedAt: string;
  guestName?: string | null;
  approved?: boolean;
}

export interface ListReviewsQuery {
  listingId?: string;
  channel?: ReviewChannel;
  from?: string;
  to?: string;
  minRating?: number;
}
