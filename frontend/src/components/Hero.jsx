function Hero({ notice }) {
  return (
    <section className="panel hero" aria-live="polite">
      <p className="eyebrow">Mood-driven Navigation</p>
      <h1>Route Mood</h1>
      <p>Plan your trip with routes that match how you feel right now.</p>
      <p className={`notice ${notice.type}`}>{notice.text}</p>
    </section>
  );
}

export default Hero;
