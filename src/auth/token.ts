import { getSpotifyClientId, getSpotifyRedirectUri, SPOTIFY_TOKEN_URL } from './config'
import { AuthError, getAuthErrorMessage } from './errors'
import {
  AUTH_STORAGE_KEYS,
  clearAuthSession,
  getSessionItem,
  storeAccessToken,
} from './storage'

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<void> {
  const clientId = getSpotifyClientId()
  const redirectUri = getSpotifyRedirectUri()

  if (!clientId) {
    throw new AuthError('MISSING_CLIENT_ID', getAuthErrorMessage('MISSING_CLIENT_ID'))
  }

  if (!redirectUri) {
    throw new AuthError('MISSING_REDIRECT_URI', getAuthErrorMessage('MISSING_REDIRECT_URI'))
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  })

  let response: Response

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 30_000)

  try {
    response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: controller.signal,
    })
  } catch {
    throw new AuthError(
      'TOKEN_EXCHANGE_FAILURE',
      getAuthErrorMessage('TOKEN_EXCHANGE_FAILURE'),
    )
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new AuthError(
      'TOKEN_EXCHANGE_FAILURE',
      getAuthErrorMessage('TOKEN_EXCHANGE_FAILURE'),
    )
  }

  let payload: SpotifyTokenResponse

  try {
    payload = (await response.json()) as SpotifyTokenResponse
  } catch {
    throw new AuthError(
      'TOKEN_EXCHANGE_FAILURE',
      getAuthErrorMessage('TOKEN_EXCHANGE_FAILURE'),
    )
  }

  if (!payload.access_token || !payload.expires_in) {
    throw new AuthError(
      'TOKEN_EXCHANGE_FAILURE',
      getAuthErrorMessage('TOKEN_EXCHANGE_FAILURE'),
    )
  }

  storeAccessToken(payload.access_token, payload.expires_in)
}

export function getAccessToken(): string | null {
  const accessToken = getSessionItem(AUTH_STORAGE_KEYS.accessToken)
  const expiryRaw = getSessionItem(AUTH_STORAGE_KEYS.tokenExpiry)

  if (!accessToken || !expiryRaw) {
    return null
  }

  const expiresAt = Number(expiryRaw)

  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    clearAuthSession()
    return null
  }

  return accessToken
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}
