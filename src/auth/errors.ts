export type AuthErrorCode =
  | 'MISSING_CLIENT_ID'
  | 'MISSING_REDIRECT_URI'
  | 'STATE_MISMATCH'
  | 'AUTH_ERROR'
  | 'MISSING_CODE'
  | 'MISSING_CODE_VERIFIER'
  | 'TOKEN_EXCHANGE_FAILURE'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  MISSING_CLIENT_ID:
    'Spotify client ID is missing. Add VITE_SPOTIFY_CLIENT_ID to your .env.local file.',
  MISSING_REDIRECT_URI:
    'Spotify redirect URI is missing. Add VITE_SPOTIFY_REDIRECT_URI to your .env.local file.',
  STATE_MISMATCH:
    'Login verification failed (state mismatch). Your session may have expired — try connecting again.',
  AUTH_ERROR: 'Spotify authorization was denied or failed. Please try connecting again.',
  MISSING_CODE: 'No authorization code was returned from Spotify. Please try connecting again.',
  MISSING_CODE_VERIFIER:
    'Login session expired before the callback completed. Please connect to Spotify again.',
  TOKEN_EXCHANGE_FAILURE:
    'Could not exchange the authorization code for an access token. Please try connecting again.',
}

export function getAuthErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code]
}

export function getSpotifyAuthErrorMessage(error: string, description?: string | null): string {
  if (description) {
    return `Spotify authorization failed (${error}): ${description}`
  }

  return `${AUTH_ERROR_MESSAGES.AUTH_ERROR} (${error})`
}

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return AUTH_ERROR_MESSAGES.TOKEN_EXCHANGE_FAILURE
}
