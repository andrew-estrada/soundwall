import type { AuthState } from '../types'
import { clearAuthSession, consumeFlashAuthError } from './storage'
import { getAccessToken, isAuthenticated } from './token'

export const initialAuthState: AuthState = {
  status: 'disconnected',
}

export function readAuthState(): AuthState {
  const flashError = consumeFlashAuthError()

  if (flashError) {
    return { status: 'error', error: flashError }
  }

  if (isAuthenticated()) {
    return { status: 'connected' }
  }

  return { status: 'disconnected' }
}

export function disconnectSpotify(): void {
  clearAuthSession()
}

export function getValidAccessToken(): string | null {
  return getAccessToken()
}
