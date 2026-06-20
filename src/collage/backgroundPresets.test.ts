import { describe, expect, it } from 'vitest'
import {
  BACKGROUND_PRESETS,
  colorsMatch,
  findBackgroundPreset,
  normalizeHexColor,
} from './backgroundPresets'

describe('backgroundPresets', () => {
  it('defines six named presets with valid hex colors', () => {
    expect(BACKGROUND_PRESETS).toHaveLength(6)
    expect(BACKGROUND_PRESETS.map((preset) => preset.label)).toEqual([
      'Black',
      'Off-black',
      'White',
      'Warm cream',
      'Dark navy',
      'Charcoal',
    ])
  })

  it('matches shorthand and long-form hex colors', () => {
    expect(colorsMatch('#fff', '#FFFFFF')).toBe(true)
    expect(normalizeHexColor('#abc')).toBe('#aabbcc')
  })

  it('finds a preset by color', () => {
    expect(findBackgroundPreset('#121212')?.label).toBe('Off-black')
    expect(findBackgroundPreset('#abcdef')).toBeUndefined()
  })
})
