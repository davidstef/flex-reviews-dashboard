import { NormalizedReview } from "../lib/api";

export default function ReviewCard({
  r,
  onToggle,
}: {
  r: NormalizedReview;
  onToggle?: (id: string, next: boolean) => void;
}) {
  return (
    <div className="card review">
      <div className="review-head">
        <strong>{r.guestName ?? "Anonymous"}</strong>
        <span style={{ opacity: 0.7 }}>
          {new Date(r.submittedAt).toLocaleDateString()}
        </span>
        <span className="rating">{r.overallRating ?? "—"} ★</span>
      </div>
      {r.publicReview && <p style={{ margin: 0 }}>{r.publicReview}</p>}
      <div
        style={{
          display: "flex",
          gap: 12,
          fontSize: 12,
          color: "var(--text-dim)",
        }}
      >
        <span className={`badge ${r.channel}`}>
          <span className="dot" /> {r.channel}
        </span>
        <span className="tag">Type: {r.type}</span>
        {r.listingName && (
          <span className="tag">Property: {r.listingName}</span>
        )}
      </div>
      {onToggle && (
        <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={!!r.approved}
            onChange={(e) => onToggle(r.id, e.target.checked)}
          />{" "}
          Approved for website
        </label>
      )}
      <hr className="sep" />
    </div>
  );
}
