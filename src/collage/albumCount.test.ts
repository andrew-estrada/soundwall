import { describe, expect, it } from 'vitest'
import {
  formatAlbumCountGridHint,
  getEffectiveAlbumLimit,
  getTightestGridPresetForAlbumCount,
  isValidAlbumCount,
} from './albumCount'

describe('isValidAlbumCount', () => {
  it('accepts supported album counts', () => {
    expect(isValidAlbumCount(25)).toBe(true)
    expect(isValidAlbumCount(100)).toBe(true)
  })

  it('rejects unsupported values', () => {
    expect(isValidAlbumCount(30)).toBe(false)
    expect(isValidAlbumCount('25')).toBe(false)
  })
})

describe('getTightestGridPresetForAlbumCount', () => {
  it('returns exact-fit presets when available', () => {
    expect(getTightestGridPresetForAlbumCount(25)?.id).toBe('grid-5x5')
    expect(getTightestGridPresetForAlbumCount(80)?.id).toBe('grid-8x10')
  })

  it('returns the smallest grid that can fit the album count', () => {
    expect(getTightestGridPresetForAlbumCount(50)?.id).toBe('grid-6x10')
    expect(getTightestGridPresetForAlbumCount(64)?.id).toBe('grid-8x10')
  })
})

describe('formatAlbumCountGridHint', () => {
  it('suggests a better layout when the current grid is too small', () => {
    expect(formatAlbumCountGridHint(50, 'grid-5x5')).toBe(
      'Works well with the 6 × 10 layout (60 cells).',
    )
  })

  it('returns null when the current layout already fits well', () => {
    expect(formatAlbumCountGridHint(25, 'grid-5x5')).toBeNull()
    expect(formatAlbumCountGridHint(64, 'grid-8x10')).toBeNull()
  })
})

describe('getEffectiveAlbumLimit', () => {
  it('caps albums by the smaller of album count and grid cells', () => {
    expect(getEffectiveAlbumLimit(50, 36)).toBe(36)
    expect(getEffectiveAlbumLimit(25, 80)).toBe(25)
  })
})
