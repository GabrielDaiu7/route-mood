function SiteNav({
  activePage,
  currentUser,
  joinLabel,
  showMobileNav,
  uiTheme,
  onToggleMobileNav,
  onToggleTheme,
  onLogout
}) {
  const pageLinkClass = (page) => (activePage === page ? "active" : "");
  const isDark = uiTheme === "dark";

  return (
    <header className="nav">
      <a className="brand" href="#home">Route Mood</a>
      <button className="nav-toggle" type="button" onClick={onToggleMobileNav} aria-expanded={showMobileNav}>
        Menu
      </button>
      <nav className={showMobileNav ? "open" : ""}>
        <a className={pageLinkClass("home")} href="#home">Home</a>
        <a className={pageLinkClass("map")} href="#map">Map</a>
        <a className={pageLinkClass("trust")} href="#trust">Trust</a>
        <a className={pageLinkClass("insights")} href="#insights">Insights</a>
      </nav>
      <div className="nav-actions">
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-pressed={isDark}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb" />
          </span>
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
        {currentUser ? (
          <details className="user-menu">
            <summary>
              <span className="user-pill">{currentUser.name}</span>
            </summary>
            <div className="user-menu-panel">
              <span>{currentUser.email}</span>
              {currentUser.role === "admin" && <a href="#admin">Admin Dashboard</a>}
              <a href="#insights">Preferences</a>
              <button type="button" onClick={onLogout}>Log out</button>
            </div>
          </details>
        ) : (
          <a className={activePage === "login" ? "nav-link-action active" : "nav-link-action"} href="#login">Log In</a>
        )}
        <a className={activePage === "join" ? "nav-cta active" : "nav-cta"} href="#join">{joinLabel}</a>
      </div>
    </header>
  );
}

export default SiteNav;
