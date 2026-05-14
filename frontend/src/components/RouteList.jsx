function RouteSkeleton() {
  return (
    <div className="route-skeleton" aria-hidden="true">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

function RouteList({ suggestions, activeRoute, currentMood, loading, onSelect }) {
  return (
    <section className="panel suggestions" aria-labelledby="route-suggestions-title">
      <div className="row">
        <h2 id="route-suggestions-title">Suggestions</h2>
        {currentMood && (
          <a href={`https://open.spotify.com/search/${encodeURIComponent(currentMood.musicKeywords)}/playlists`} target="_blank" rel="noreferrer">
            {currentMood.label} Spotify playlist
          </a>
        )}
      </div>

      {loading && (
        <div className="stack" role="status" aria-label="Loading route suggestions">
          <RouteSkeleton />
          <RouteSkeleton />
          <RouteSkeleton />
        </div>
      )}

      {!loading && !suggestions.length && <p className="empty">No route suggestions yet.</p>}

      {!loading && (
        <div className="stack" role="listbox" aria-label="Route options">
          {suggestions.map((item, index) => (
            <article
              key={item.id}
              role="option"
              tabIndex={0}
              aria-selected={index === activeRoute}
              className={index === activeRoute ? "route-card active" : "route-card"}
              onClick={() => onSelect(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(index);
                }
              }}
            >
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p className="meta">ETA {item.etaMinutes} min | Stress {item.stressScore}/5</p>
              <a href={item.googleMapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                Open in Google Maps
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default RouteList;
