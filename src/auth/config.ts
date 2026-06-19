export const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
export const SPOTIFY_SCOPE = 'user-top-read'

export function getSpotifyClientId(): string {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() ?? ''
}

export function getSpotifyRedirectUri(): string {
  return import.meta.env.VITE_SPOTIFY_REDIRECT_URI?.trim() ?? ''
}
