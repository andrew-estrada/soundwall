import type { AuthState } from '../types'
import { clearAuthSession, consumeFlashAuthError } from './storage'
import { getAccessToken, isAuthenticated } from './token'

export const initialAuthState: AuthState = {
  status: 'disconnected',
}

export function readAuthState(): AuthState {
  if (isAuthenticated()) {
    consumeFlashAuthError()
    return { status: 'connected' }
  }

  const flashError = consumeFlashAuthError()

  if (flashError) {
    return { status: 'error', error: flashError }
  }

  return { status: 'disconnected' }
}

export function disconnectSpotify(): void {
  clearAuthSession()
}

export function getValidAccessToken(): string | null {
  return getAccessToken()
}
