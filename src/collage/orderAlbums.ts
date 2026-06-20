import type { AlbumCandidate, CollageOrder } from '../types'

function shuffleAlbums(albums: AlbumCandidate[], shuffleSeed: number): AlbumCandidate[] {
  const result = [...albums]
  let seed =
    shuffleSeed +
    result.reduce((accumulator, album) => accumulator + album.albumId.length, 0)

  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (seed * 9301 + 49297) % 233280
    const swapIndex = seed % (index + 1)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }

  return result
}

export function orderAlbums(
  albums: AlbumCandidate[],
  order: CollageOrder,
  shuffleSeed = 0,
): AlbumCandidate[] {
  switch (order) {
    case 'random':
      return shuffleAlbums(albums, shuffleSeed)
    case 'rank':
    default:
      return [...albums].sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }

        return left.albumName.localeCompare(right.albumName, undefined, {
          sensitivity: 'base',
        })
      })
  }
}
