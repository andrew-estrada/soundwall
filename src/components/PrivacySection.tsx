export function PrivacySection() {
  return (
    <section className="privacy-section" aria-labelledby="privacy-heading">
      <h2 id="privacy-heading" className="privacy-section__title">
        Privacy &amp; setup
      </h2>
      <ul className="privacy-section__list">
        <li>Soundwall runs locally in your browser.</li>
        <li>Your Spotify data is used only to generate the collage.</li>
        <li>Layout preferences (size, grid, spacing, colors) are saved in localStorage on this device.</li>
        <li>Spotify tokens stay in sessionStorage and clear when you log out or close the tab.</li>
        <li>Listening data and album lists are never saved between sessions.</li>
        <li>No database, no account, no server upload.</li>
      </ul>
      <p className="privacy-section__footer">
        Setup: create a Spotify Developer app, add the redirect URI from the README, and set{' '}
        <code className="privacy-section__code">VITE_SPOTIFY_CLIENT_ID</code> in{' '}
        <code className="privacy-section__code">.env.local</code>.{' '}
        <a
          className="privacy-section__link"
          href="https://developer.spotify.com/dashboard"
          target="_blank"
          rel="noreferrer"
        >
          Spotify Developer Dashboard
        </a>
        {' · '}
        <a className="privacy-section__link" href="/NOTICE.md" target="_blank" rel="noreferrer">
          Notice
        </a>
      </p>
    </section>
  )
}
