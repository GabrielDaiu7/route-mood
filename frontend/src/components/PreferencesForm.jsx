import { useState } from "react";

function PreferencesForm({ preferences, busy, onChange, onSubmit }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="panel small prefs" aria-labelledby="prefs-title">
      <button
        type="button"
        id="prefs-title"
        className="panel-toggle"
        aria-expanded={open}
        aria-controls="prefs-content"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Preferences</span>
        <span>{open ? "-" : "+"}</span>
      </button>

      <div id="prefs-content" hidden={!open}>
        <form onSubmit={onSubmit} className="stack">
          <label htmlFor="favorite-moods">
            Favorite moods (comma-separated)
            <input
              id="favorite-moods"
              value={preferences.favoriteMoods.join(",")}
              onChange={(e) => onChange({ ...preferences, favoriteMoods: e.target.value.split(",").map((m) => m.trim()).filter(Boolean) })}
            />
          </label>
          <label htmlFor="default-transport">
            Default transport
            <select id="default-transport" value={preferences.defaultTransport} onChange={(e) => onChange({ ...preferences, defaultTransport: e.target.value })}>
              <option value="walking">Walking</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="transit">Transit</option>
            </select>
          </label>
          <label className="inline" htmlFor="notifications-enabled">
            <input
              id="notifications-enabled"
              type="checkbox"
              checked={preferences.notificationsEnabled}
              onChange={(e) => onChange({ ...preferences, notificationsEnabled: e.target.checked })}
            />
            Notifications enabled
          </label>
          <button className="btn" disabled={busy}>{busy ? "Saving..." : "Save Preferences"}</button>
        </form>
      </div>
    </section>
  );
}

export default PreferencesForm;
