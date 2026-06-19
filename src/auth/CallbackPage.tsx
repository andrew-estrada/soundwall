import { useEffect, useState } from 'react'
import { handleOAuthCallback } from './callback'
import { setFlashAuthError } from './storage'

export function CallbackPage() {
  const [message, setMessage] = useState('Completing Spotify login…')

  useEffect(() => {
    let cancelled = false

    async function completeLogin() {
      const result = await handleOAuthCallback(new URLSearchParams(window.location.search))

      if (cancelled) {
        return
      }

      if (result.status === 'connected') {
        window.location.replace('/')
        return
      }

      if (result.error) {
        setFlashAuthError(result.error)
      }

      setMessage(result.error ?? 'Login failed. Redirecting…')
      window.location.replace('/')
    }

    void completeLogin()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="callback-page">
      <p className="callback-page__message">{message}</p>
    </div>
  )
}
