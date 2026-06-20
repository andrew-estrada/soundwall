import type { AlbumCandidate, AlbumReplacements, CollageAlbumSlot } from '../types'

export function applyAlbumReplacements(
  albums: AlbumCandidate[],
  replacements: AlbumReplacements,
): CollageAlbumSlot[] {
  return albums.map((album) => ({
    slotAlbumId: album.albumId,
    album: replacements[album.albumId] ?? album,
  }))
}

export function slotsToAlbums(slots: CollageAlbumSlot[]): AlbumCandidate[] {
  return slots.map((slot) => slot.album)
}
