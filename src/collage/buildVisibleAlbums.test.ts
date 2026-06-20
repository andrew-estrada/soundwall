import { describe, expect, it } from 'vitest'
import type { AlbumCandidate } from '../types'
import { buildVisibleAlbums } from './buildVisibleAlbums'

function createAlbum(id: string): AlbumCandidate {
  return {
    albumId: id,
    albumName: `Album ${id}`,
    artistId: `artist-${id}`,
    artistName: `Artist ${id}`,
    imageUrl: `https://example.com/${id}.jpg`,
    spotifyUrl: `https://open.spotify.com/album/${id}`,
    score: Number(id),
    sourceTrackNames: [],
    sourceTimeRanges: [],
  }
}

describe('buildVisibleAlbums', () => {
  const pool = ['1', '2', '3', '4', '5', '6'].map(createAlbum)

  it('returns the first N albums when nothing is removed', () => {
    expect(buildVisibleAlbums(pool, new Set(), 3).map((album) => album.albumId)).toEqual([
      '1',
      '2',
      '3',
    ])
  })

  it('backfills with the next ranked album after a removal', () => {
    expect(
      buildVisibleAlbums(pool, new Set(['2']), 3).map((album) => album.albumId),
    ).toEqual(['1', '3', '4'])
  })

  it('returns fewer albums when the pool is exhausted', () => {
    expect(buildVisibleAlbums(pool, new Set(['1', '2', '3', '4', '5']), 3)).toHaveLength(1)
  })
})
