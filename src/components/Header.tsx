interface HeaderProps {
  description?: string
}

export function Header({
  description = 'Turn your top Spotify tracks into a cover-art collage. Connect your account to get started.',
}: HeaderProps) {
  return (
    <header className="app-shell__header">
      <div className="app-shell__brand-row">
        <div>
          <h1 className="header__title">Soundwall</h1>
          <p className="header__description">{description}</p>
        </div>
      </div>
    </header>
  )
}
