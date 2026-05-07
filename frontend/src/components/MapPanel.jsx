function MapPanel({ mapRef, pickMode }) {
  return (
    <section className="panel map-wrap" aria-label="Interactive map">
      <div className="map-hint" role="status" aria-live="polite">
        {pickMode ? `Map pick mode: ${pickMode}. Click on the map.` : "Use Pick Start/End to place markers."}
      </div>
      <div ref={mapRef} id="map" />
    </section>
  );
}

export default MapPanel;
