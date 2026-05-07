function TripPlanner({
  from,
  to,
  moodId,
  moods,
  transport,
  pickMode,
  busy,
  onFromChange,
  onToChange,
  onMoodChange,
  onTransportChange,
  onPickMode,
  onSubmit
}) {
  return (
    <section className="panel controls" aria-labelledby="trip-planner-title">
      <h2 id="trip-planner-title">Trip Planner</h2>
      <form onSubmit={onSubmit} className="stack">
        <div className="grid2">
          <label htmlFor="from-input">
            From
            <input id="from-input" value={from} onChange={(e) => onFromChange(e.target.value)} placeholder="Address or click pick" required />
          </label>
          <button
            type="button"
            aria-pressed={pickMode === "start"}
            className={pickMode === "start" ? "btn ghost active" : "btn ghost"}
            onClick={() => onPickMode("start")}
          >
            Pick Start
          </button>
        </div>

        <div className="grid2">
          <label htmlFor="to-input">
            To
            <input id="to-input" value={to} onChange={(e) => onToChange(e.target.value)} placeholder="Address or click pick" required />
          </label>
          <button
            type="button"
            aria-pressed={pickMode === "end"}
            className={pickMode === "end" ? "btn ghost active" : "btn ghost"}
            onClick={() => onPickMode("end")}
          >
            Pick End
          </button>
        </div>

        <div className="grid2 fields">
          <label htmlFor="mood-select">
            Mood
            <select id="mood-select" value={moodId} onChange={(e) => onMoodChange(e.target.value)}>
              {moods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="transport-select">
            Transport
            <select id="transport-select" value={transport} onChange={(e) => onTransportChange(e.target.value)}>
              <option value="walking">Walking</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="transit">Transit</option>
            </select>
          </label>
        </div>

        <button className="btn" disabled={busy}>{busy ? "Finding routes..." : "Find Routes"}</button>
      </form>
    </section>
  );
}

export default TripPlanner;
