import type { SpotifyApiErrorBody } from './apiTypes'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export class SpotifyApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'SpotifyApiError'
    this.status = status
  }
}

export async function spotifyFetch<T>(
  accessToken: string,
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  let response: Response

  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  } catch {
    throw new SpotifyApiError('Could not reach Spotify. Check your connection and try again.', 0)
  }

  if (!response.ok) {
    let message = `Spotify API request failed (${response.status})`

    try {
      const body = (await response.json()) as SpotifyApiErrorBody
      if (body.error?.message) {
        message = body.error.message
      }
    } catch {
      // Use default message when the error body is not JSON.
    }

    if (response.status === 401) {
      message = 'Spotify session expired. Log out and connect again.'
    }

    throw new SpotifyApiError(message, response.status)
  }

  return response.json() as Promise<T>
}
