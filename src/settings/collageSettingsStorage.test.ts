import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_COLLAGE_SETTINGS } from '../collage/constants'
import {
  COLLAGE_SETTINGS_STORAGE_KEY,
  clearCollageSettings,
  extractPersistedSettings,
  loadCollageSettings,
  mergePersistedSettings,
  saveCollageSettings,
} from './collageSettingsStorage'

function createLocalStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createLocalStorageMock())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('extractPersistedSettings', () => {
  it('includes only layout preferences, not shuffle seed', () => {
    const settings = {
      ...DEFAULT_COLLAGE_SETTINGS,
      spacing: 12,
    }

    expect(extractPersistedSettings(settings)).toEqual({
      exportPresetId: 'square-3000',
      gridPresetId: 'grid-5x5',
      albumCount: 25,
      spacing: 12,
      backgroundColor: '#121212',
      order: 'rank',
      oneAlbumPerArtist: true,
    })
  })
})

describe('mergePersistedSettings', () => {
  it('restores export and grid dimensions from presets', () => {
    const settings = mergePersistedSettings({
      exportPresetId: 'wallpaper-phone',
      gridPresetId: 'grid-8x10',
      spacing: 8,
      backgroundColor: '#abcdef',
      order: 'random',
      oneAlbumPerArtist: false,
    })

    expect(settings.exportWidth).toBe(1290)
    expect(settings.exportHeight).toBe(2796)
    expect(settings.gridCols).toBe(8)
    expect(settings.gridRows).toBe(10)
  })

  it('falls back to defaults for invalid values', () => {
    const settings = mergePersistedSettings({
      exportPresetId: 'not-a-preset',
      gridPresetId: 'also-invalid',
      spacing: 999,
      backgroundColor: 'red',
      order: 'invalid',
      oneAlbumPerArtist: 'yes',
    })

    expect(settings).toEqual(DEFAULT_COLLAGE_SETTINGS)
  })
})

describe('loadCollageSettings and saveCollageSettings', () => {
  it('round-trips persisted layout settings through localStorage', () => {
    saveCollageSettings({
      ...DEFAULT_COLLAGE_SETTINGS,
      exportPresetId: 'poster-11x17',
      gridPresetId: 'grid-6x6',
      albumCount: 36,
      spacing: 10,
      backgroundColor: '#ffffff',
      order: 'random',
      oneAlbumPerArtist: false,
    })

    const loaded = loadCollageSettings()

    expect(loaded.exportPresetId).toBe('poster-11x17')
    expect(loaded.gridPresetId).toBe('grid-6x6')
    expect(loaded.albumCount).toBe(36)
    expect(loaded.spacing).toBe(10)
    expect(loaded.backgroundColor).toBe('#ffffff')
    expect(loaded.order).toBe('random')
    expect(loaded.oneAlbumPerArtist).toBe(false)

    const stored = JSON.parse(localStorage.getItem(COLLAGE_SETTINGS_STORAGE_KEY) ?? '{}')
    expect(stored).not.toHaveProperty('shuffleSeed')
    expect(stored).not.toHaveProperty('exportWidth')
  })

  it('clearCollageSettings removes saved preferences', () => {
    saveCollageSettings(DEFAULT_COLLAGE_SETTINGS)
    clearCollageSettings()
    expect(localStorage.getItem(COLLAGE_SETTINGS_STORAGE_KEY)).toBeNull()
    expect(loadCollageSettings()).toEqual(DEFAULT_COLLAGE_SETTINGS)
  })
})
