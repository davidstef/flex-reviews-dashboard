import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicReviews, NormalizedReview } from "../lib/api";

export default function Property() {
  const { listingName } = useParams();
  const [items, setItems] = useState<NormalizedReview[]>([]);

  useEffect(() => {
    fetchPublicReviews(listingName).then(setItems);
  }, [listingName]);

  return (
    <div>
      <h2 className="section-title">{listingName}</h2>
      <p className="section-sub">
        Simplified Flex Living layout + approved reviews section.
      </p>

      <div
        className="card"
        style={{ height: 240, display: "grid", placeItems: "center" }}
      >
        <span style={{ color: "var(--muted)" }}>
          Photo gallery (placeholder)
        </span>
      </div>

      <section>
        <h3 className="section-title">Guest reviews (approved by manager)</h3>
        {items.length === 0 && (
          <p className="section-sub">
            There are no approved reviews to display yet.
          </p>
        )}
        <div className="grid">
          {items.map((r) => (
            <div key={r.id} className="card">
              <div className="review-head">
                <strong>{r.guestName ?? "Guest"}</strong>
                <span style={{ opacity: 0.7 }}>
                  {new Date(r.submittedAt).toLocaleDateString()}
                </span>
                <span className="rating">{r.overallRating ?? "—"} ★</span>
              </div>
              {r.publicReview && <p style={{ margin: 0 }}>{r.publicReview}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
