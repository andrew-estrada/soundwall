import { Disc3 } from 'lucide-react'

interface HeaderProps {
  isConnected?: boolean
}

export function Header({ isConnected = false }: HeaderProps) {
  return (
    <header className="topbar">
      <span className="brand">
        <Disc3 className="brand__icon" size={22} aria-hidden="true" />
        <span className="brand__name">Soundwall</span>
      </span>

      {isConnected ? (
        <span className="topbar__status">
          <span className="topbar__status-dot" aria-hidden="true" />
          Connected to Spotify
        </span>
      ) : null}
    </header>
  )
}
