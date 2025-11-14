import { useEffect, useMemo, useState } from "react";
import Filters, { FiltersValue } from "../components/Filters";
import ReviewCard from "../components/ReviewCard";
import { fetchReviews, setApproval, NormalizedReview } from "../lib/api";

export default function Dashboard() {
  const [filters, setFilters] = useState<FiltersValue>({});
  const [items, setItems] = useState<NormalizedReview[]>([]);
  const [sort, setSort] = useState<"date_desc" | "rating_desc" | "rating_asc">(
    "date_desc"
  );

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.channel) params.channel = filters.channel;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.minRating != null) params.minRating = String(filters.minRating);
    fetchReviews(params).then(setItems);
  }, [filters]);

  const sorted = useMemo(() => {
    const arr = [...items];
    if (sort === "date_desc")
      arr.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    if (sort === "rating_desc")
      arr.sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0));
    if (sort === "rating_asc")
      arr.sort((a, b) => (a.overallRating ?? 0) - (b.overallRating ?? 0));
    return arr;
  }, [items, sort]);

  async function toggleApproval(id: string, next: boolean) {
    await setApproval(id, next);
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: next } : r))
    );
  }

  const byProperty = useMemo(() => {
    const map = new Map<string, { name: string; avg: number; count: number }>();
    for (const r of items) {
      const key = r.listingName ?? "No name";
      const entry = map.get(key) ?? { name: key, avg: 0, count: 0 };
      entry.avg =
        (entry.avg * entry.count + (r.overallRating ?? 0)) / (entry.count + 1);
      entry.count += 1;
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
  }, [items]);

  return (
    <div>
      <h2 className="section-title">Manager Dashboard</h2>
      <p className="section-sub">
        Filter, sort, approve reviews and track performance per property.
      </p>

      <Filters onChange={setFilters} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label>Sort: </label>
        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="date_desc">Most recent</option>
          <option value="rating_desc">Highest rating</option>
          <option value="rating_asc">Lowest rating</option>
        </select>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h3 className="section-title">Property summary</h3>
        <div className="grid fit">
          {byProperty.map((p) => (
            <div key={p.name} className="card kpi">
              <strong>{p.name}</strong>
              <div className="muted">{p.count} reviews</div>
              <div className="value">{(p.avg || 0).toFixed(1)} ★</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="section-title">Reviews:</h3>
        <div className="grid">
          {sorted.map((r) => (
            <ReviewCard key={r.id} r={r} onToggle={toggleApproval} />
          ))}
        </div>
      </section>
    </div>
  );
}
