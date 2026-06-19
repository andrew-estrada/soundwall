export function PrivacySection() {
  return (
    <section className="privacy-section" aria-labelledby="privacy-heading">
      <h2 id="privacy-heading" className="privacy-section__title">
        Privacy &amp; setup
      </h2>
      <ul className="privacy-section__list">
        <li>Soundwall runs locally in your browser.</li>
        <li>Your Spotify data is used only to generate the collage.</li>
        <li>No database, no account, no server upload.</li>
        <li>You can log out anytime to clear the local token.</li>
      </ul>
    </section>
  )
}
