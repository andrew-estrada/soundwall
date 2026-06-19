import {
  getSpotifyClientId,
  getSpotifyRedirectUri,
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_SCOPE,
} from './config'
import { AuthError, getAuthErrorMessage } from './errors'
import {
  generateAuthState,
  generateCodeChallenge,
  generateCodeVerifier,
} from './pkce'
import { AUTH_STORAGE_KEYS, setSessionItem } from './storage'

export async function connectSpotify(): Promise<never> {
  const clientId = getSpotifyClientId()

  if (!clientId) {
    throw new AuthError('MISSING_CLIENT_ID', getAuthErrorMessage('MISSING_CLIENT_ID'))
  }

  const redirectUri = getSpotifyRedirectUri()

  if (!redirectUri) {
    throw new AuthError('MISSING_REDIRECT_URI', getAuthErrorMessage('MISSING_REDIRECT_URI'))
  }

  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateAuthState()

  setSessionItem(AUTH_STORAGE_KEYS.codeVerifier, codeVerifier)
  setSessionItem(AUTH_STORAGE_KEYS.authState, state)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPE,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state,
  })

  window.location.assign(`${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`)

  return new Promise(() => {
    // Redirect leaves the page; this promise never resolves.
  })
}
