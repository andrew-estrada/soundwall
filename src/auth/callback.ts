import type { AuthState } from '../types'
import { AuthError, getAuthErrorMessage, getSpotifyAuthErrorMessage, toAuthErrorMessage } from './errors'
import { clearPkceSession, getSessionItem, AUTH_STORAGE_KEYS } from './storage'
import { exchangeAuthorizationCode, isAuthenticated } from './token'

let callbackHandlingPromise: Promise<AuthState> | null = null

export function resetOAuthCallbackOnce(): void {
  callbackHandlingPromise = null
}

export function runOAuthCallbackOnce(searchParams: URLSearchParams): Promise<AuthState> {
  if (!callbackHandlingPromise) {
    callbackHandlingPromise = handleOAuthCallback(searchParams)
  }

  return callbackHandlingPromise
}

export async function handleOAuthCallback(searchParams: URLSearchParams): Promise<AuthState> {
  const spotifyError = searchParams.get('error')

  if (spotifyError) {
    clearPkceSession()
    return {
      status: 'error',
      error: getSpotifyAuthErrorMessage(spotifyError, searchParams.get('error_description')),
    }
  }

  if (isAuthenticated()) {
    clearPkceSession()
    return { status: 'connected' }
  }

  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const storedState = getSessionItem(AUTH_STORAGE_KEYS.authState)

  if (!code) {
    clearPkceSession()
    return {
      status: 'error',
      error: getAuthErrorMessage('MISSING_CODE'),
    }
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    clearPkceSession()
    return {
      status: 'error',
      error: getAuthErrorMessage('STATE_MISMATCH'),
    }
  }

  const codeVerifier = getSessionItem(AUTH_STORAGE_KEYS.codeVerifier)

  if (!codeVerifier) {
    clearPkceSession()
    return {
      status: 'error',
      error: getAuthErrorMessage('MISSING_CODE_VERIFIER'),
    }
  }

  try {
    await exchangeAuthorizationCode(code, codeVerifier)
    clearPkceSession()

    return { status: 'connected' }
  } catch (error) {
    clearPkceSession()

    if (error instanceof AuthError) {
      return { status: 'error', error: error.message }
    }

    return {
      status: 'error',
      error: toAuthErrorMessage(error),
    }
  }
}
