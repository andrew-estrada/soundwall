import { describe, expect, it } from 'vitest'
import type { RankedSpotifyTrack, SpotifyTimeRange } from '../types'
import { scoreAlbumsFromTracks } from './albumScoring'

const defaultOptions = {
  gridCols: 10,
  gridRows: 10,
  oneAlbumPerArtist: false,
  returnAll: true,
} as const

interface TrackInput {
  albumId: string
  albumName?: string
  artistId?: string
  artistName?: string
  trackName?: string
  rank: number
  timeRange: SpotifyTimeRange
  images?: { url: string; width: number; height: number }[]
}

function createTrack(input: TrackInput): RankedSpotifyTrack {
  const artistId = input.artistId ?? `artist-${input.albumId}`
  const artistName = input.artistName ?? `Artist ${input.albumId}`

  return {
    id: `track-${input.albumId}-${input.rank}-${input.timeRange}`,
    name: input.trackName ?? `Track ${input.rank}`,
    timeRange: input.timeRange,
    rank: input.rank,
    artists: [{ id: artistId, name: artistName }],
    album: {
      id: input.albumId,
      name: input.albumName ?? `Album ${input.albumId}`,
      spotifyUrl: `https://open.spotify.com/album/${input.albumId}`,
      artists: [{ id: artistId, name: artistName }],
      images: input.images ?? [{ url: `https://example.com/${input.albumId}.jpg`, width: 640, height: 640 }],
    },
  }
}

describe('scoreAlbumsFromTracks', () => {
  it('combines duplicate albums from multiple tracks', () => {
    const tracks = [
      createTrack({
        albumId: 'album-a',
        trackName: 'Song One',
        rank: 1,
        timeRange: 'medium_term',
      }),
      createTrack({
        albumId: 'album-a',
        trackName: 'Song Two',
        rank: 5,
        timeRange: 'short_term',
      }),
    ]

    const albums = scoreAlbumsFromTracks(tracks, { ...defaultOptions })

    expect(albums).toHaveLength(1)
    expect(albums[0]?.albumId).toBe('album-a')
    expect(albums[0]?.score).toBe(50 * 1.0 + 46 * 0.8)
    expect(albums[0]?.sourceTrackNames).toEqual(['Song One', 'Song Two'])
    expect(albums[0]?.sourceTimeRanges).toEqual(
      expect.arrayContaining(['medium_term', 'short_term']),
    )
  })

  it('scores higher-ranked tracks above lower-ranked tracks', () => {
    const tracks = [
      createTrack({ albumId: 'album-low', rank: 10, timeRange: 'medium_term' }),
      createTrack({ albumId: 'album-high', rank: 1, timeRange: 'medium_term' }),
    ]

    const albums = scoreAlbumsFromTracks(tracks, { ...defaultOptions })

    expect(albums.map((album) => album.albumId)).toEqual(['album-high', 'album-low'])
    expect(albums[0]?.score).toBe(50)
    expect(albums[1]?.score).toBe(41)
  })

  it('applies time range multipliers', () => {
    const tracks = [
      createTrack({ albumId: 'album-short', rank: 1, timeRange: 'short_term' }),
      createTrack({ albumId: 'album-medium', rank: 1, timeRange: 'medium_term' }),
      createTrack({ albumId: 'album-long', rank: 1, timeRange: 'long_term' }),
    ]

    const albums = scoreAlbumsFromTracks(tracks, { ...defaultOptions })
    const scores = Object.fromEntries(albums.map((album) => [album.albumId, album.score]))

    expect(scores['album-short']).toBe(40)
    expect(scores['album-medium']).toBe(50)
    expect(scores['album-long']).toBe(60)
  })

  it('skips albums with no image', () => {
    const tracks = [
      createTrack({
        albumId: 'album-no-image',
        rank: 1,
        timeRange: 'medium_term',
        images: [],
      }),
      createTrack({
        albumId: 'album-with-image',
        rank: 2,
        timeRange: 'medium_term',
      }),
    ]

    const albums = scoreAlbumsFromTracks(tracks, { ...defaultOptions })

    expect(albums).toHaveLength(1)
    expect(albums[0]?.albumId).toBe('album-with-image')
  })

  it('oneAlbumPerArtist keeps only the highest-scoring album per artist', () => {
    const tracks = [
      createTrack({
        albumId: 'album-strong',
        artistId: 'artist-shared',
        rank: 1,
        timeRange: 'long_term',
      }),
      createTrack({
        albumId: 'album-weak',
        artistId: 'artist-shared',
        rank: 20,
        timeRange: 'short_term',
      }),
      createTrack({
        albumId: 'album-other',
        artistId: 'artist-other',
        rank: 2,
        timeRange: 'medium_term',
      }),
    ]

    const albums = scoreAlbumsFromTracks(tracks, {
      ...defaultOptions,
      oneAlbumPerArtist: true,
    })

    expect(albums).toHaveLength(2)
    expect(albums.map((album) => album.albumId)).toEqual(['album-strong', 'album-other'])
    expect(albums.some((album) => album.albumId === 'album-weak')).toBe(false)
  })

  it('returns albums sorted by score descending', () => {
    const tracks = [
      createTrack({ albumId: 'album-c', rank: 15, timeRange: 'medium_term' }),
      createTrack({ albumId: 'album-a', rank: 3, timeRange: 'long_term' }),
      createTrack({ albumId: 'album-b', rank: 8, timeRange: 'medium_term' }),
    ]

    const albums = scoreAlbumsFromTracks(tracks, { ...defaultOptions })
    const scores = albums.map((album) => album.score)

    expect(scores).toEqual([...scores].sort((left, right) => right - left))
    expect(albums[0]?.albumId).toBe('album-a')
    expect(albums.at(-1)?.albumId).toBe('album-c')
  })
})
