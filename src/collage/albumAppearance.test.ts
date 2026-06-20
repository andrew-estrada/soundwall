import { describe, expect, it } from 'vitest'
import { DEFAULT_COLLAGE_SETTINGS } from './constants'
import { resolveAlbumAppearance, resolvePreviewAlbumAppearance } from './albumAppearance'

describe('resolveAlbumAppearance', () => {
  it('returns zero radius and border when appearance toggles are off', () => {
    const appearance = resolveAlbumAppearance(DEFAULT_COLLAGE_SETTINGS, 595, 595)

    expect(appearance.cornerRadius).toBe(0)
    expect(appearance.borderWidth).toBe(0)
  })

  it('scales corner radius and border width with cell size', () => {
    const settings = {
      ...DEFAULT_COLLAGE_SETTINGS,
      roundedCorners: true,
      cornerRadius: 12,
      borderEnabled: true,
      borderWidth: 4,
      borderColor: '#ffffff',
    }

    const preview = resolvePreviewAlbumAppearance(settings)
    const exportAppearance = resolveAlbumAppearance(settings, 600, 600)

    expect(preview.cornerRadius).toBe(12)
    expect(preview.borderWidth).toBe(4)
    expect(exportAppearance.cornerRadius).toBe(72)
    expect(exportAppearance.borderWidth).toBe(24)
  })
})
