import type { AlbumCandidate } from '../types'

export function buildVisibleAlbums(
  orderedPool: AlbumCandidate[],
  removedAlbumIds: ReadonlySet<string>,
  limit: number,
): AlbumCandidate[] {
  if (limit <= 0) {
    return []
  }

  const visible: AlbumCandidate[] = []

  for (const album of orderedPool) {
    if (removedAlbumIds.has(album.albumId)) {
      continue
    }

    visible.push(album)

    if (visible.length >= limit) {
      break
    }
  }

  return visible
}

export function getRemovedAlbumIds(removedAlbums: AlbumCandidate[]): Set<string> {
  return new Set(removedAlbums.map((album) => album.albumId))
}
