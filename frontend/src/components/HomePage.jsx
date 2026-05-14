function HomePage({
  from,
  to,
  activeMood,
  moods,
  transport,
  features,
  trustStats,
  onFromChange,
  onToChange,
  onMoodChange,
  onTransportChange,
  onSubmit,
  onDemo
}) {
  return (
    <>
      <section className="hero product-hero">
        <div className="hero-copy">
          <p className="city">Tirana mood-aware routes</p>
          <h1>Find the best route for your mood in Tirana.</h1>
          <p>Choose how you want the journey to feel, then compare route options by ETA, safety, noise, stress, and confidence.</p>
          <div className="hero-actions">
            <a className="btn ghost" href="#map" onClick={onDemo}>See Demo</a>
          </div>
        </div>

        <form className="home-planner" onSubmit={onSubmit}>
          <div className="planner-card-head">
            <span>Quick route check</span>
            <h2>Plan a mood-aware trip</h2>
            <p>Choose your start, destination, mood, and transport.</p>
          </div>
          <label className="planner-field route-point start" htmlFor="home-from">
            <span>From</span>
            <input id="home-from" value={from} onChange={(event) => onFromChange(event.target.value)} required />
          </label>
          <label className="planner-field route-point end" htmlFor="home-to">
            <span>To</span>
            <input id="home-to" value={to} onChange={(event) => onToChange(event.target.value)} required />
          </label>
          <div className="home-planner-row">
            <label className="planner-field" htmlFor="home-mood">
              <span>Mood</span>
              <select id="home-mood" value={activeMood} onChange={(event) => onMoodChange(event.target.value)}>
                {moods.map((mood) => (
                  <option key={mood.id} value={mood.id}>{mood.label}</option>
                ))}
              </select>
            </label>
            <label className="planner-field" htmlFor="home-transport">
              <span>Transport</span>
              <select id="home-transport" value={transport} onChange={(event) => onTransportChange(event.target.value)}>
                <option value="walking">Walking</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="transit">Transit</option>
              </select>
            </label>
          </div>
          <button className="btn primary" type="submit">Plan Route</button>
        </form>
      </section>

      <section className="feature-rail" aria-label="Features">
        {features.map((item) => (
          <div key={item} className="rail-item">
            <span className="rail-bar" aria-hidden="true" />
            <p>{item}</p>
          </div>
        ))}
      </section>

      <section id="story" className="story">
        <div>
          <p className="kicker">Why Route Mood</p>
          <h2>Navigation should care how you feel.</h2>
        </div>
        <p>
          Most maps only find the fastest route. Route Mood helps you choose paths that match your mood, whether you need calm streets, positive energy, quiet focus, or a more social walk through the city.
        </p>
      </section>

      <section className="stats" aria-label="Trust metrics">
        {trustStats.map((item, index) => (
          <article key={item.label}>
            <span className="stat-mark" aria-hidden="true">{index + 1}</span>
            <h3>{item.value}</h3>
            <strong>{item.label}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="team-section" aria-labelledby="team-title">
        <div className="team-copy">
          <p className="kicker">Project Team</p>
          <h2 id="team-title">Built by the Route Mood team.</h2>
          <p>Four contributors shaped the idea, design, and experience behind mood-aware navigation.</p>
        </div>
        <div className="team-grid">
          {[
            { name: "Gabriel Daiu", role: "UI/UX and Frontend", focus: "Interface design, route page experience, visual polish" },
            { name: "Livja Hoxha", role: "UI/UX and Frontend", focus: "User flows, homepage design, responsive experience" },
            { name: "Sara Keputa", role: "Backend", focus: "API structure, data handling, route logic support" },
            { name: "Orhan Thomaraj", role: "Backend", focus: "Server features, integrations, admin and feedback logic" }
          ].map((member) => (
            <article key={member.name} className="team-card">
              <span className="team-avatar" aria-hidden="true">{member.name.split(" ").map((part) => part[0]).join("")}</span>
              <div className="team-details">
                <span className="team-role">{member.role}</span>
                <h3>{member.name}</h3>
                <p>{member.focus}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
