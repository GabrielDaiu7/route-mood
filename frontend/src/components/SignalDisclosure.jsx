function SignalDisclosure({ lastUpdated }) {
  const signals = [
    { label: "Route geometry", status: "Demo", detail: "Generated from known Tirana places and route variants." },
    { label: "Traffic pressure", status: "Estimated", detail: "Shown as demo pressure zones, not municipal live feed." },
    { label: "Noise pressure", status: "Estimated", detail: "Modeled from route type and selected overlays." },
    { label: "Mood trend", status: "Live API", detail: "Calculated from recent route and feedback records when the backend is connected." }
  ];

  return (
    <section className="signal-disclosure" aria-label="Signal transparency">
      <div className="signal-disclosure-head">
        <div>
          <span className="signal-eyebrow">Signal transparency</span>
          <h3>What powers the route score</h3>
        </div>
        <p>Each signal is labeled so users know what is live, estimated, or demo-only.</p>
      </div>
      <div className="signal-grid">
      {signals.map((signal, index) => (
        <article key={signal.label}>
          <span className={`signal-status status-${signal.status.toLowerCase().replace(/\s+/g, "-")}`}>{signal.status}</span>
          <strong>{signal.label}</strong>
          <p>{signal.detail}</p>
          <i aria-hidden="true">{index + 1}</i>
        </article>
      ))}
      </div>
      <p className="signal-updated">Last refreshed {lastUpdated}</p>
    </section>
  );
}

export default SignalDisclosure;
