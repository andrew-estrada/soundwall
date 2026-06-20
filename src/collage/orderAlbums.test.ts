import { describe, expect, it } from 'vitest'
import type { AlbumCandidate } from '../types'
import { orderAlbums } from './orderAlbums'

function createAlbum(
  albumId: string,
  score: number,
  albumName = albumId,
): AlbumCandidate {
  return {
    albumId,
    albumName,
    artistId: `artist-${albumId}`,
    artistName: 'Artist',
    imageUrl: `https://example.com/${albumId}.jpg`,
    spotifyUrl: `https://open.spotify.com/album/${albumId}`,
    score,
    sourceTrackNames: [],
    sourceTimeRanges: [],
  }
}

describe('orderAlbums', () => {
  it('sorts albums by score descending when order is rank', () => {
    const albums = [
      createAlbum('low', 10),
      createAlbum('high', 50),
      createAlbum('mid', 30),
    ]

    const ordered = orderAlbums(albums, 'rank')

    expect(ordered.map((album) => album.albumId)).toEqual(['high', 'mid', 'low'])
  })

  it('breaks score ties by album name', () => {
    const albums = [
      createAlbum('b-album', 40, 'Bravo'),
      createAlbum('a-album', 40, 'Alpha'),
    ]

    const ordered = orderAlbums(albums, 'rank')

    expect(ordered.map((album) => album.albumId)).toEqual(['a-album', 'b-album'])
  })

  it('does not mutate the input array', () => {
    const albums = [createAlbum('one', 10), createAlbum('two', 20)]

    orderAlbums(albums, 'rank')

    expect(albums.map((album) => album.albumId)).toEqual(['one', 'two'])
  })

  it('produces deterministic shuffle output for the same seed', () => {
    const albums = [
      createAlbum('a', 10),
      createAlbum('b', 20),
      createAlbum('c', 30),
      createAlbum('d', 40),
    ]

    const first = orderAlbums(albums, 'random', 7)
    const second = orderAlbums(albums, 'random', 7)

    expect(first.map((album) => album.albumId)).toEqual(second.map((album) => album.albumId))
    expect(first.map((album) => album.albumId)).not.toEqual(['a', 'b', 'c', 'd'])
  })

  it('changes shuffle output when the seed changes', () => {
    const albums = [
      createAlbum('a', 10),
      createAlbum('b', 20),
      createAlbum('c', 30),
      createAlbum('d', 40),
      createAlbum('e', 50),
    ]

    const seedOne = orderAlbums(albums, 'random', 1).map((album) => album.albumId)
    const seedTwo = orderAlbums(albums, 'random', 2).map((album) => album.albumId)

    expect(seedOne).not.toEqual(seedTwo)
  })
})
