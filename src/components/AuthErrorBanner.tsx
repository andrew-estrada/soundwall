interface AuthErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export function AuthErrorBanner({ message, onDismiss }: AuthErrorBannerProps) {
  return (
    <div className="auth-error-banner" role="alert">
      <p className="auth-error-banner__message">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          className="auth-error-banner__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  )
}
