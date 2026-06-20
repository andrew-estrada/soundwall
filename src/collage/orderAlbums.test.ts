import { describe, expect, it } from 'vitest'
import type { AlbumCandidate } from '../types'
import { orderAlbums } from './orderAlbums'

function createAlbum(id: string, score: number): AlbumCandidate {
  return {
    albumId: id,
    albumName: `Album ${id}`,
    artistId: `artist-${id}`,
    artistName: `Artist ${id}`,
    imageUrl: `https://example.com/${id}.jpg`,
    spotifyUrl: `https://open.spotify.com/album/${id}`,
    score,
    sourceTrackNames: [],
    sourceTimeRanges: [],
  }
}

describe('orderAlbums', () => {
  const albums = [
    createAlbum('c', 30),
    createAlbum('a', 50),
    createAlbum('b', 40),
    createAlbum('d', 10),
  ]

  it('returns score order for rank mode', () => {
    expect(orderAlbums(albums, 'rank').map((album) => album.albumId)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
  })

  it('returns the same shuffled order for the same seed', () => {
    const first = orderAlbums(albums, 'random', 42).map((album) => album.albumId)
    const second = orderAlbums(albums, 'random', 42).map((album) => album.albumId)

    expect(first).toEqual(second)
  })

  it('returns a different shuffled order when the seed changes', () => {
    const first = orderAlbums(albums, 'random', 1).map((album) => album.albumId)
    const second = orderAlbums(albums, 'random', 2).map((album) => album.albumId)

    expect(first).not.toEqual(second)
  })

  it('ignores the incoming array order when shuffling', () => {
    const reversed = [...albums].reverse()
    const shuffled = orderAlbums(reversed, 'random', 7).map((album) => album.albumId)
    const shuffledAgain = orderAlbums(albums, 'random', 7).map((album) => album.albumId)

    expect(shuffled).toEqual(shuffledAgain)
  })
})
