import type { RankedSpotifyTrack, SpotifyTimeRange } from '../types'
import type { SpotifyApiTopTracksResponse, SpotifyApiTrack } from './apiTypes'
import { spotifyFetch } from './client'

const TIME_RANGES: SpotifyTimeRange[] = ['short_term', 'medium_term', 'long_term']
const TRACKS_PER_RANGE = 50

function mapTrack(
  track: SpotifyApiTrack,
  timeRange: SpotifyTimeRange,
  rank: number,
): RankedSpotifyTrack {
  return {
    id: track.id,
    name: track.name,
    timeRange,
    rank,
    artists: track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    album: {
      id: track.album.id,
      name: track.album.name,
      spotifyUrl: track.album.external_urls.spotify,
      artists: track.album.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      images: track.album.images.map((image) => ({
        url: image.url,
        width: image.width ?? 0,
        height: image.height ?? 0,
      })),
    },
  }
}

async function fetchTopTracksForRange(
  accessToken: string,
  timeRange: SpotifyTimeRange,
): Promise<RankedSpotifyTrack[]> {
  const response = await spotifyFetch<SpotifyApiTopTracksResponse>(
    accessToken,
    '/me/top/tracks',
    {
      time_range: timeRange,
      limit: String(TRACKS_PER_RANGE),
    },
  )

  return response.items.map((track, index) => mapTrack(track, timeRange, index + 1))
}

export async function fetchTopTracks(accessToken: string): Promise<RankedSpotifyTrack[]> {
  const tracks: RankedSpotifyTrack[] = []

  for (const timeRange of TIME_RANGES) {
    const rangeTracks = await fetchTopTracksForRange(accessToken, timeRange)
    tracks.push(...rangeTracks)
  }

  return tracks
}
