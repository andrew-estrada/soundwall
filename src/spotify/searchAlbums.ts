import type { AlbumCandidate } from '../types'
import type { SpotifyApiAlbum, SpotifyApiImage } from './apiTypes'
import { spotifyFetch } from './client'

export interface SpotifySearchAlbum {
  id: string
  name: string
  artistId: string
  artistName: string
  imageUrl: string
  spotifyUrl: string
  releaseYear: string | null
}

function pickBestImageUrl(images: SpotifyApiImage[]): string | null {
  if (images.length === 0) {
    return null
  }

  const best = [...images].sort((left, right) => {
    const leftArea = (left.width ?? 0) * (left.height ?? 0)
    const rightArea = (right.width ?? 0) * (right.height ?? 0)

    if (rightArea !== leftArea) {
      return rightArea - leftArea
    }

    return (right.width ?? 0) - (left.width ?? 0)
  })[0]

  return best?.url ?? null
}

export function parseReleaseYear(releaseDate: string | undefined): string | null {
  if (!releaseDate) {
    return null
  }

  const year = releaseDate.slice(0, 4)
  return /^\d{4}$/.test(year) ? year : null
}

export function mapSearchAlbum(album: SpotifyApiAlbum): SpotifySearchAlbum | null {
  const imageUrl = pickBestImageUrl(album.images)

  if (!imageUrl) {
    return null
  }

  const primaryArtist = album.artists[0]

  return {
    id: album.id,
    name: album.name,
    artistId: primaryArtist?.id ?? album.id,
    artistName: album.artists.map((artist) => artist.name).join(', '),
    imageUrl,
    spotifyUrl: album.external_urls.spotify,
    releaseYear: parseReleaseYear(album.release_date),
  }
}

export function searchResultToAlbumCandidate(result: SpotifySearchAlbum): AlbumCandidate {
  return {
    albumId: result.id,
    albumName: result.name,
    artistId: result.artistId,
    artistName: result.artistName,
    imageUrl: result.imageUrl,
    spotifyUrl: result.spotifyUrl,
    score: 0,
    sourceTrackNames: [],
    sourceTimeRanges: [],
  }
}

export async function searchSpotifyAlbums(
  accessToken: string,
  query: string,
  limit = 12,
): Promise<SpotifySearchAlbum[]> {
  const trimmed = query.trim()

  if (!trimmed) {
    return []
  }

  const response = await spotifyFetch<{ albums: { items: SpotifyApiAlbum[] } }>(
    accessToken,
    '/search',
    {
      q: trimmed,
      type: 'album',
      limit: String(limit),
    },
  )

  return response.albums.items
    .map(mapSearchAlbum)
    .filter((album): album is SpotifySearchAlbum => album !== null)
}
