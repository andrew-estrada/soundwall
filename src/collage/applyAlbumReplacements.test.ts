import { describe, expect, it } from 'vitest'
import type { AlbumCandidate } from '../types'
import { applyAlbumReplacements, slotsToAlbums } from './applyAlbumReplacements'

function createAlbum(id: string, name: string): AlbumCandidate {
  return {
    albumId: id,
    albumName: name,
    artistId: `artist-${id}`,
    artistName: 'Artist',
    imageUrl: `https://example.com/${id}.jpg`,
    spotifyUrl: `https://open.spotify.com/album/${id}`,
    score: 10,
    sourceTrackNames: [],
    sourceTimeRanges: [],
  }
}

describe('applyAlbumReplacements', () => {
  it('replaces albums by slot id while preserving slot keys', () => {
    const originalA = createAlbum('a', 'Original A')
    const replacement = createAlbum('replacement', 'Replacement Album')
    const slots = applyAlbumReplacements([originalA, createAlbum('b', 'B')], {
      a: replacement,
    })

    expect(slots[0]?.slotAlbumId).toBe('a')
    expect(slots[0]?.album.albumName).toBe('Replacement Album')
    expect(slots[1]?.album.albumName).toBe('B')
  })
})

describe('slotsToAlbums', () => {
  it('returns the visible album list for export', () => {
    const slots = applyAlbumReplacements([createAlbum('a', 'A')], {})
    expect(slotsToAlbums(slots)[0]?.albumName).toBe('A')
  })
})
