import type { RankedSpotifyTrack, SpotifyImage, SpotifyTimeRange } from '../types'
import type { AlbumCandidate, ScoreAlbumsOptions } from '../types/collage'

const TIME_RANGE_MULTIPLIERS: Record<SpotifyTimeRange, number> = {
  short_term: 0.8,
  medium_term: 1.0,
  long_term: 1.2,
}

interface AlbumAccumulator {
  albumId: string
  albumName: string
  artistId: string
  artistName: string
  imageUrl: string
  spotifyUrl: string
  score: number
  sourceTrackNames: Set<string>
  sourceTimeRanges: Set<SpotifyTimeRange>
}

function pointsForRank(rank: number): number {
  if (rank < 1 || rank > 50) {
    return 0
  }

  return 51 - rank
}

function pickBestImageUrl(images: SpotifyImage[]): string | null {
  if (images.length === 0) {
    return null
  }

  const best = [...images].sort((left, right) => {
    const leftArea = left.width * left.height
    const rightArea = right.width * right.height

    if (rightArea !== leftArea) {
      return rightArea - leftArea
    }

    return right.width - left.width
  })[0]

  return best?.url ?? null
}

function getPrimaryArtist(track: RankedSpotifyTrack): { id: string; name: string } | null {
  const albumArtist = track.album.artists[0]
  if (albumArtist) {
    return albumArtist
  }

  const trackArtist = track.artists[0]
  if (trackArtist) {
    return trackArtist
  }

  return null
}

function toAlbumCandidate(accumulator: AlbumAccumulator): AlbumCandidate {
  return {
    albumId: accumulator.albumId,
    albumName: accumulator.albumName,
    artistId: accumulator.artistId,
    artistName: accumulator.artistName,
    imageUrl: accumulator.imageUrl,
    spotifyUrl: accumulator.spotifyUrl,
    score: accumulator.score,
    sourceTrackNames: [...accumulator.sourceTrackNames],
    sourceTimeRanges: [...accumulator.sourceTimeRanges],
  }
}

function applyOneAlbumPerArtist(candidates: AlbumCandidate[]): AlbumCandidate[] {
  const bestByArtist = new Map<string, AlbumCandidate>()

  for (const candidate of candidates) {
    const existing = bestByArtist.get(candidate.artistId)

    if (!existing || candidate.score > existing.score) {
      bestByArtist.set(candidate.artistId, candidate)
    }
  }

  return [...bestByArtist.values()].sort((left, right) => right.score - left.score)
}

export function scoreAlbumsFromTracks(
  tracks: RankedSpotifyTrack[],
  options: ScoreAlbumsOptions,
): AlbumCandidate[] {
  const albums = new Map<string, AlbumAccumulator>()

  for (const track of tracks) {
    const imageUrl = pickBestImageUrl(track.album.images)
    const primaryArtist = getPrimaryArtist(track)

    if (!imageUrl || !primaryArtist) {
      continue
    }

    const trackPoints =
      pointsForRank(track.rank) * TIME_RANGE_MULTIPLIERS[track.timeRange]

    if (trackPoints <= 0) {
      continue
    }

    const existing = albums.get(track.album.id)

    if (existing) {
      existing.score += trackPoints
      existing.sourceTrackNames.add(track.name)
      existing.sourceTimeRanges.add(track.timeRange)
      continue
    }

    albums.set(track.album.id, {
      albumId: track.album.id,
      albumName: track.album.name,
      artistId: primaryArtist.id,
      artistName: primaryArtist.name,
      imageUrl,
      spotifyUrl: track.album.spotifyUrl,
      score: trackPoints,
      sourceTrackNames: new Set([track.name]),
      sourceTimeRanges: new Set([track.timeRange]),
    })
  }

  let candidates = [...albums.values()]
    .map(toAlbumCandidate)
    .sort((left, right) => right.score - left.score)

  if (options.oneAlbumPerArtist) {
    candidates = applyOneAlbumPerArtist(candidates)
  }

  if (options.returnAll) {
    return candidates
  }

  const albumCount = options.gridCols * options.gridRows
  return candidates.slice(0, albumCount)
}
