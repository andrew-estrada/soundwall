import type { CollageAlbum, CollageSettings } from '../types'

export { buildVisibleAlbums, getRemovedAlbumIds } from './buildVisibleAlbums'
export { DEFAULT_COLLAGE_SETTINGS } from './constants'
export {
  ALBUM_COUNT_OPTIONS,
  formatAlbumCountGridHint,
  getEffectiveAlbumLimit,
  getTightestGridPresetForAlbumCount,
  isValidAlbumCount,
} from './albumCount'
export type { AlbumCountOption } from './albumCount'
export { scoreAlbumsFromTracks } from './albumScoring'
export {
  calculateGridLayout,
  drawCollage,
  drawCoverImage,
  getCellPosition,
} from './drawCollage'
export type { DrawCollageOptions, GridLayout } from './drawCollage'
export {
  CollageExportError,
  EXPORT_DPI,
  ImageLoadError,
  buildExportFilename,
  getPdfPageSizeInches,
  prepareCollageExport,
} from './exportCollage'
export type {
  CollageExportResult,
  PrepareCollageExportOptions,
  PreparedCollageExport,
} from './exportCollage'
export { exportCollagePng, formatExportMessage } from './exportPng'
export type { ExportCollagePngOptions, ExportCollagePngResult } from './exportPng'
export { exportCollagePdf } from './exportPdf'
export type { ExportCollagePdfOptions, ExportCollagePdfResult } from './exportPdf'
export { orderAlbums } from './orderAlbums'
export {
  COLLAGE_PRESETS,
  EXPORT_SIZE_PRESETS,
  GRID_PRESETS,
  findCollagePreset,
  formatRecommendedGrid,
  getPresetsByCategory,
} from './presets'

/** @deprecated Use drawCollage or exportCollagePng instead. */
export function buildCollageAlbums(_albums: CollageAlbum[]): CollageAlbum[] {
  return []
}

/** @deprecated Use drawCollage instead. */
export function renderCollage(
  _albums: CollageAlbum[],
  _settings: CollageSettings,
): HTMLCanvasElement | null {
  return null
}
