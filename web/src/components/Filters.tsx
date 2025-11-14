import { useState } from "react";

export type FiltersValue = {
  channel?: "hostaway" | "google" | "";
  minRating?: number;
  from?: string;
  to?: string;
};

export default function Filters({
  onChange,
}: {
  onChange: (v: FiltersValue) => void;
}) {
  const [val, setVal] = useState<FiltersValue>({});

  function set<K extends keyof FiltersValue>(k: K, v: FiltersValue[K]) {
    const next = { ...val, [k]: v };
    setVal(next);
    onChange(next);
  }

  return (
    <div className="controls">
      <select
        className="select"
        value={val.channel ?? ""}
        onChange={(e) => set("channel", e.target.value as any)}
      >
        <option value="">All channels</option>
        <option value="hostaway">Hostaway</option>
        <option value="google">Google</option>
      </select>
      <input
        className="input"
        type="number"
        min={0}
        max={5}
        step={0.5}
        placeholder="Minimum rating (0..5)"
        onChange={(e) => set("minRating", Number(e.target.value))}
      />
      <input
        className="input"
        type="date"
        onChange={(e) => set("from", e.target.value)}
      />
      <input
        className="input"
        type="date"
        onChange={(e) => set("to", e.target.value)}
      />
      <button
        className="button"
        onClick={() => {
          setVal({});
          onChange({});
        }}
      >
        Reset
      </button>
    </div>
  );
}
