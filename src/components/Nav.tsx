export function Nav() {
  return (
    <header className="nav film-nav">
      <a className="nav-brand" href="#top" aria-label="POPÉ home">
        <img
          src="/brand/pope_logo_dark_background.svg"
          alt="POPÉ"
          width={110}
          height={32}
        />
      </a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#worlds">Worlds</a>
        <a className="nav-cta" href="#finale">
          Get in early
        </a>
      </nav>
    </header>
  )
}
