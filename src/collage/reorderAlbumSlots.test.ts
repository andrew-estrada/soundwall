import { describe, expect, it } from 'vitest'
import type { AlbumCandidate, CollageAlbumSlot } from '../types'
import {
  applyManualOrder,
  hasSameSlotOrder,
  removeSlotFromOrder,
  reorderSlots,
  slotsToOrder,
} from './reorderAlbumSlots'

function createAlbum(id: string): AlbumCandidate {
  return {
    albumId: id,
    albumName: `Album ${id}`,
    artistId: `artist-${id}`,
    artistName: 'Artist',
    imageUrl: `https://example.com/${id}.jpg`,
    spotifyUrl: `https://open.spotify.com/album/${id}`,
    score: 10,
    sourceTrackNames: [],
    sourceTimeRanges: [],
  }
}

function createSlot(id: string): CollageAlbumSlot {
  return { slotAlbumId: id, album: createAlbum(id) }
}

describe('reorderSlots', () => {
  it('moves a slot from one index to another', () => {
    const slots = [createSlot('a'), createSlot('b'), createSlot('c')]
    const reordered = reorderSlots(slots, 0, 2)

    expect(reordered.map((slot) => slot.slotAlbumId)).toEqual(['b', 'c', 'a'])
  })

  it('returns the same array when indices are equal or out of range', () => {
    const slots = [createSlot('a'), createSlot('b')]

    expect(reorderSlots(slots, 1, 1)).toBe(slots)
    expect(reorderSlots(slots, -1, 0)).toBe(slots)
    expect(reorderSlots(slots, 0, 5)).toBe(slots)
  })
})

describe('applyManualOrder', () => {
  it('orders slots by saved ids and appends any new slots', () => {
    const slots = [createSlot('a'), createSlot('b'), createSlot('c')]
    const ordered = applyManualOrder(slots, ['c', 'a'])

    expect(ordered.map((slot) => slot.slotAlbumId)).toEqual(['c', 'a', 'b'])
  })

  it('returns pipeline order when manual order is empty', () => {
    const slots = [createSlot('a'), createSlot('b')]
    expect(applyManualOrder(slots, [])).toEqual(slots)
  })
})

describe('slotsToOrder', () => {
  it('returns slot ids in display order', () => {
    const slots = [createSlot('x'), createSlot('y')]
    expect(slotsToOrder(slots)).toEqual(['x', 'y'])
  })
})

describe('removeSlotFromOrder', () => {
  it('removes a slot id from the saved order', () => {
    expect(removeSlotFromOrder(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })
})

describe('hasSameSlotOrder', () => {
  it('compares slot ids in order', () => {
    const left = [createSlot('a'), createSlot('b')]
    const right = [createSlot('a'), createSlot('b')]
    const shuffled = [createSlot('b'), createSlot('a')]

    expect(hasSameSlotOrder(left, right)).toBe(true)
    expect(hasSameSlotOrder(left, shuffled)).toBe(false)
  })
})
