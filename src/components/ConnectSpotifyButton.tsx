import { Music2 } from 'lucide-react'

interface ConnectSpotifyButtonProps {
  isConnected?: boolean
  isConnecting?: boolean
  onConnect?: () => void
}

export function ConnectSpotifyButton({
  isConnected = false,
  isConnecting = false,
  onConnect,
}: ConnectSpotifyButtonProps) {
  if (isConnected) {
    return <span className="connect-actions__status">Connected to Spotify</span>
  }

  return (
    <button
      type="button"
      className="connect-button"
      onClick={onConnect}
      disabled={isConnecting}
      aria-label="Connect Spotify"
    >
      <Music2 className="connect-button__icon" size={18} aria-hidden="true" />
      {isConnecting ? 'Redirecting…' : 'Connect Spotify'}
    </button>
  )
}
