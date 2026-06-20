import { describe, expect, it } from 'vitest'
import type { SpotifyApiAlbum } from './apiTypes'
import { mapSearchAlbum, parseReleaseYear, searchResultToAlbumCandidate } from './searchAlbums'

function createApiAlbum(overrides: Partial<SpotifyApiAlbum> = {}): SpotifyApiAlbum {
  return {
    id: 'album-1',
    name: 'Test Album',
    images: [{ url: 'https://example.com/cover.jpg', width: 640, height: 640 }],
    external_urls: { spotify: 'https://open.spotify.com/album/album-1' },
    artists: [{ id: 'artist-1', name: 'Test Artist' }],
    release_date: '2019-06-07',
    ...overrides,
  }
}

describe('parseReleaseYear', () => {
  it('extracts a four-digit year', () => {
    expect(parseReleaseYear('2019-06-07')).toBe('2019')
    expect(parseReleaseYear('2001')).toBe('2001')
  })

  it('returns null for missing or invalid dates', () => {
    expect(parseReleaseYear(undefined)).toBeNull()
    expect(parseReleaseYear('invalid')).toBeNull()
  })
})

describe('mapSearchAlbum', () => {
  it('maps Spotify album search items', () => {
    expect(mapSearchAlbum(createApiAlbum())).toEqual({
      id: 'album-1',
      name: 'Test Album',
      artistId: 'artist-1',
      artistName: 'Test Artist',
      imageUrl: 'https://example.com/cover.jpg',
      spotifyUrl: 'https://open.spotify.com/album/album-1',
      releaseYear: '2019',
    })
  })

  it('returns null when cover art is missing', () => {
    expect(mapSearchAlbum(createApiAlbum({ images: [] }))).toBeNull()
  })
})

describe('searchResultToAlbumCandidate', () => {
  it('creates an album candidate suitable for collage replacement', () => {
    const candidate = searchResultToAlbumCandidate({
      id: 'album-1',
      name: 'Test Album',
      artistId: 'artist-1',
      artistName: 'Test Artist',
      imageUrl: 'https://example.com/cover.jpg',
      spotifyUrl: 'https://open.spotify.com/album/album-1',
      releaseYear: '2019',
    })

    expect(candidate.albumName).toBe('Test Album')
    expect(candidate.sourceTrackNames).toEqual([])
    expect(candidate.score).toBe(0)
  })
})
