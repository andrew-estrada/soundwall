import { Disc3, Download, ListMusic, Music2 } from 'lucide-react'

interface ConnectScreenProps {
  onConnect: () => void
  isConnecting?: boolean
  authError?: string | null
  onDismissError?: () => void
}

const DECOR_TILES = [
  'linear-gradient(135deg, #f97316, #db2777)',
  'linear-gradient(135deg, #6366f1, #06b6d4)',
  'linear-gradient(135deg, #22c55e, #0ea5e9)',
  'linear-gradient(135deg, #eab308, #ef4444)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #14b8a6, #3b82f6)',
  'linear-gradient(135deg, #f43f5e, #f59e0b)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #84cc16, #14b8a6)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #f59e0b, #84cc16)',
  'linear-gradient(135deg, #3b82f6, #22c55e)',
  'linear-gradient(135deg, #db2777, #6366f1)',
  'linear-gradient(135deg, #06b6d4, #f43f5e)',
  'linear-gradient(135deg, #a855f7, #f97316)',
  'linear-gradient(135deg, #0ea5e9, #84cc16)',
]

const STEPS = [
  {
    icon: Music2,
    title: 'Connect Spotify',
    body: 'Securely sign in. Your listening data never leaves your browser.',
  },
  {
    icon: ListMusic,
    title: 'We build your wall',
    body: 'Your most-played albums fill the grid automatically.',
  },
  {
    icon: Download,
    title: 'Customize & export',
    body: 'Tune the size, layout, and spacing, then save a PNG or PDF.',
  },
]

export function ConnectScreen({
  onConnect,
  isConnecting = false,
  authError = null,
  onDismissError,
}: ConnectScreenProps) {
  return (
    <div className="connect-screen">
      <header className="connect-screen__topbar">
        <span className="brand">
          <Disc3 className="brand__icon" size={22} aria-hidden="true" />
          <span className="brand__name">Soundwall</span>
        </span>
      </header>

      <main className="connect-screen__main">
        <div className="connect-screen__hero">
          <div className="connect-screen__copy">
            <p className="connect-screen__eyebrow">Album-cover collage maker</p>
            <h1 className="connect-screen__title">
              Turn your top albums into a poster.
            </h1>
            <p className="connect-screen__subtitle">
              Soundwall reads your Spotify listening history and builds a cover-art
              collage you can export for your wall, phone, or desktop.
            </p>

            {authError ? (
              <div className="connect-screen__error" role="alert">
                <p className="connect-screen__error-text">{authError}</p>
                {onDismissError ? (
                  <button
                    type="button"
                    className="connect-screen__error-dismiss"
                    onClick={onDismissError}
                  >
                    Dismiss
                  </button>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              className="connect-button connect-button--lg"
              onClick={onConnect}
              disabled={isConnecting}
              aria-label="Connect Spotify"
            >
              <Music2 className="connect-button__icon" size={20} aria-hidden="true" />
              {isConnecting ? 'Connecting…' : 'Connect Spotify'}
            </button>

            <p className="connect-screen__privacy">
              Runs entirely in your browser. No account, no servers, nothing stored.
            </p>
          </div>

          <div className="connect-screen__visual" aria-hidden="true">
            <div className="connect-screen__collage">
              {DECOR_TILES.map((gradient, index) => (
                <span
                  key={index}
                  className="connect-screen__tile"
                  style={{ background: gradient }}
                />
              ))}
            </div>
          </div>
        </div>

        <ol className="connect-screen__steps">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.title} className="connect-screen__step">
                <span className="connect-screen__step-index">{index + 1}</span>
                <Icon className="connect-screen__step-icon" size={20} aria-hidden="true" />
                <span className="connect-screen__step-title">{step.title}</span>
                <span className="connect-screen__step-body">{step.body}</span>
              </li>
            )
          })}
        </ol>
      </main>
    </div>
  )
}
