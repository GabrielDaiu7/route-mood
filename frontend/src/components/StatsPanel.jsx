import { useState } from "react";

function StatsPanel({ stats, loading }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="panel small stats" aria-labelledby="stats-title">
      <button
        type="button"
        id="stats-title"
        className="panel-toggle"
        aria-expanded={open}
        aria-controls="stats-content"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Live Metrics</span>
        <span>{open ? "-" : "+"}</span>
      </button>

      <div id="stats-content" hidden={!open}>
        {loading ? (
          <div className="stats-skeleton" role="status" aria-label="Loading metrics">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
          </div>
        ) : (
          <pre>{stats ? JSON.stringify(stats, null, 2) : "No stats yet"}</pre>
        )}
      </div>
    </section>
  );
}

export default StatsPanel;
