import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SpotifyApiTopTracksResponse, SpotifyApiTrack } from './apiTypes'
import { spotifyFetch } from './client'
import { fetchTopTracks } from './topTracks'

vi.mock('./client', () => ({
  spotifyFetch: vi.fn(),
}))

function createApiTrack(id: string, name: string): SpotifyApiTrack {
  return {
    id,
    name,
    artists: [{ id: `artist-${id}`, name: 'Artist' }],
    album: {
      id: `album-${id}`,
      name: `Album ${id}`,
      external_urls: { spotify: `https://open.spotify.com/album/${id}` },
      artists: [{ id: `artist-${id}`, name: 'Artist' }],
      images: [{ url: `https://example.com/${id}.jpg`, width: 640, height: 640 }],
    },
  }
}

describe('fetchTopTracks', () => {
  beforeEach(() => {
    vi.mocked(spotifyFetch).mockReset()
  })

  it('fetches short, medium, and long term ranges in parallel', async () => {
    vi.mocked(spotifyFetch).mockImplementation(async (_token, _path, params) => {
      const timeRange = params?.time_range ?? 'medium_term'
      const response: SpotifyApiTopTracksResponse = {
        items: [createApiTrack(`${timeRange}-track`, `${timeRange} track`)],
      }

      return response
    })

    const tracks = await fetchTopTracks('access-token')

    expect(spotifyFetch).toHaveBeenCalledTimes(3)
    expect(spotifyFetch).toHaveBeenCalledWith('access-token', '/me/top/tracks', {
      time_range: 'short_term',
      limit: '50',
    })
    expect(spotifyFetch).toHaveBeenCalledWith('access-token', '/me/top/tracks', {
      time_range: 'medium_term',
      limit: '50',
    })
    expect(spotifyFetch).toHaveBeenCalledWith('access-token', '/me/top/tracks', {
      time_range: 'long_term',
      limit: '50',
    })
    expect(tracks).toHaveLength(3)
    expect(tracks.map((track) => track.timeRange)).toEqual([
      'short_term',
      'medium_term',
      'long_term',
    ])
  })
})
