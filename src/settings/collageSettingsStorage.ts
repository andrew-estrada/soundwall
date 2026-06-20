import { DEFAULT_COLLAGE_SETTINGS } from '../collage/constants'
import { isValidAlbumCount } from '../collage/albumCount'
import { EXPORT_SIZE_PRESETS, GRID_PRESETS, findCollagePreset } from '../collage/presets'
import type { CollageOrder, CollageSettings } from '../types'

export const COLLAGE_SETTINGS_STORAGE_KEY = 'soundwall:collage_settings'

export interface PersistedCollageSettings {
  exportPresetId: string
  gridPresetId: string
  albumCount: number
  spacing: number
  backgroundColor: string
  roundedCorners: boolean
  cornerRadius: number
  borderEnabled: boolean
  borderWidth: number
  borderColor: string
  order: CollageOrder
  oneAlbumPerArtist: boolean
}

const VALID_ORDERS: CollageOrder[] = ['rank', 'random']
const SPACING_MIN = 0
const SPACING_MAX = 24
const CORNER_RADIUS_MIN = 0
const CORNER_RADIUS_MAX = 24
const BORDER_WIDTH_MIN = 1
const BORDER_WIDTH_MAX = 8
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function extractPersistedSettings(settings: CollageSettings): PersistedCollageSettings {
  return {
    exportPresetId: settings.exportPresetId,
    gridPresetId: settings.gridPresetId,
    albumCount: settings.albumCount,
    spacing: settings.spacing,
    backgroundColor: settings.backgroundColor,
    roundedCorners: settings.roundedCorners,
    cornerRadius: settings.cornerRadius,
    borderEnabled: settings.borderEnabled,
    borderWidth: settings.borderWidth,
    borderColor: settings.borderColor,
    order: settings.order,
    oneAlbumPerArtist: settings.oneAlbumPerArtist,
  }
}

export function isValidExportPresetId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    EXPORT_SIZE_PRESETS.some((preset) => preset.id === value)
  )
}

export function isValidGridPresetId(value: unknown): value is string {
  return typeof value === 'string' && GRID_PRESETS.some((preset) => preset.id === value)
}

export function isValidHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value)
}

export function isValidOrder(value: unknown): value is CollageOrder {
  return typeof value === 'string' && VALID_ORDERS.includes(value as CollageOrder)
}

export function normalizeSpacing(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  const rounded = Math.round(value)
  if (rounded < SPACING_MIN || rounded > SPACING_MAX) {
    return null
  }

  return rounded
}

export function normalizeCornerRadius(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  const rounded = Math.round(value)
  if (rounded < CORNER_RADIUS_MIN || rounded > CORNER_RADIUS_MAX) {
    return null
  }

  return rounded
}

export function normalizeBorderWidth(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  const rounded = Math.round(value)
  if (rounded < BORDER_WIDTH_MIN || rounded > BORDER_WIDTH_MAX) {
    return null
  }

  return rounded
}

export function mergePersistedSettings(parsed: unknown): CollageSettings {
  const defaults = DEFAULT_COLLAGE_SETTINGS

  if (!parsed || typeof parsed !== 'object') {
    return { ...defaults }
  }

  const data = parsed as Record<string, unknown>
  const exportPresetId = isValidExportPresetId(data.exportPresetId)
    ? data.exportPresetId
    : defaults.exportPresetId
  const exportPreset = findCollagePreset(exportPresetId)
  const gridPresetId = isValidGridPresetId(data.gridPresetId)
    ? data.gridPresetId
    : defaults.gridPresetId
  const gridPreset = findCollagePreset(gridPresetId)

  return {
    ...defaults,
    exportPresetId,
    exportWidth: exportPreset?.width ?? defaults.exportWidth,
    exportHeight: exportPreset?.height ?? defaults.exportHeight,
    gridPresetId,
    gridCols: gridPreset?.recommendedGrid.cols ?? defaults.gridCols,
    gridRows: gridPreset?.recommendedGrid.rows ?? defaults.gridRows,
    albumCount: isValidAlbumCount(data.albumCount) ? data.albumCount : defaults.albumCount,
    spacing: normalizeSpacing(data.spacing) ?? defaults.spacing,
    backgroundColor: isValidHexColor(data.backgroundColor)
      ? data.backgroundColor
      : defaults.backgroundColor,
    roundedCorners:
      typeof data.roundedCorners === 'boolean' ? data.roundedCorners : defaults.roundedCorners,
    cornerRadius: normalizeCornerRadius(data.cornerRadius) ?? defaults.cornerRadius,
    borderEnabled:
      typeof data.borderEnabled === 'boolean' ? data.borderEnabled : defaults.borderEnabled,
    borderWidth: normalizeBorderWidth(data.borderWidth) ?? defaults.borderWidth,
    borderColor: isValidHexColor(data.borderColor) ? data.borderColor : defaults.borderColor,
    order: isValidOrder(data.order) ? data.order : defaults.order,
    oneAlbumPerArtist:
      typeof data.oneAlbumPerArtist === 'boolean'
        ? data.oneAlbumPerArtist
        : defaults.oneAlbumPerArtist,
  }
}

export function loadCollageSettings(): CollageSettings {
  try {
    const raw = localStorage.getItem(COLLAGE_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_COLLAGE_SETTINGS }
    }

    return mergePersistedSettings(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_COLLAGE_SETTINGS }
  }
}

export function saveCollageSettings(settings: CollageSettings): void {
  try {
    localStorage.setItem(
      COLLAGE_SETTINGS_STORAGE_KEY,
      JSON.stringify(extractPersistedSettings(settings)),
    )
  } catch {
    // localStorage may be unavailable or full; layout prefs are optional.
  }
}

export function clearCollageSettings(): void {
  try {
    localStorage.removeItem(COLLAGE_SETTINGS_STORAGE_KEY)
  } catch {
    // Ignore storage errors on reset.
  }
}
