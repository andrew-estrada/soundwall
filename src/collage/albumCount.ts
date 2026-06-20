import { GRID_PRESETS, findCollagePreset } from './presets'
import type { CollagePreset } from '../types'

export const ALBUM_COUNT_OPTIONS = [25, 36, 50, 64, 80, 100] as const

export type AlbumCountOption = (typeof ALBUM_COUNT_OPTIONS)[number]

export function isValidAlbumCount(value: unknown): value is AlbumCountOption {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    ALBUM_COUNT_OPTIONS.includes(value as AlbumCountOption)
  )
}

export function getGridCellCount(preset: CollagePreset): number {
  return preset.recommendedGrid.cols * preset.recommendedGrid.rows
}

export function getTightestGridPresetForAlbumCount(albumCount: number): CollagePreset | null {
  const match = GRID_PRESETS.map((preset) => ({
    preset,
    cells: getGridCellCount(preset),
  }))
    .filter(({ cells }) => cells >= albumCount)
    .sort((left, right) => left.cells - right.cells)[0]

  return match?.preset ?? null
}

export function formatAlbumCountGridHint(
  albumCount: number,
  gridPresetId: string,
): string | null {
  const currentPreset = findCollagePreset(gridPresetId)
  const currentCells = currentPreset ? getGridCellCount(currentPreset) : 0
  const recommended = getTightestGridPresetForAlbumCount(albumCount)

  if (!recommended) {
    return null
  }

  const recommendedCells = getGridCellCount(recommended)

  if (currentCells >= albumCount && currentCells <= recommendedCells) {
    return null
  }

  if (currentPreset?.id === recommended.id && currentCells >= albumCount) {
    return null
  }

  return `Works well with the ${recommended.label} layout (${recommendedCells} cells).`
}

export function getEffectiveAlbumLimit(albumCount: number, gridCellCount: number): number {
  return Math.min(albumCount, gridCellCount)
}
