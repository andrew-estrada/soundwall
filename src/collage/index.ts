export { applyAlbumReplacements, slotsToAlbums } from './applyAlbumReplacements'
export { buildVisibleAlbums, getRemovedAlbumIds } from './buildVisibleAlbums'
export type { AlbumReplacements } from '../types/collage'
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
  downscaleCanvasForEmbed,
  getPdfPageSizeInches,
  hasExportGridAspectMismatch,
  isLargePosterExport,
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
export {
  BACKGROUND_PRESETS,
  colorsMatch,
  findBackgroundPreset,
} from './backgroundPresets'
export type { BackgroundPreset } from './backgroundPresets'
export { orderAlbums } from './orderAlbums'
export {
  CORNER_RADIUS_MAX,
  BORDER_WIDTH_MAX,
  PREVIEW_REFERENCE_CELL_SIZE,
  resolveAlbumAppearance,
  resolvePreviewAlbumAppearance,
} from './albumAppearance'
export {
  applyManualOrder,
  hasSameSlotOrder,
  removeSlotFromOrder,
  reorderSlots,
  slotsToOrder,
} from './reorderAlbumSlots'
export type { CollageOrderSource } from './reorderAlbumSlots'
export {
  COLLAGE_PRESETS,
  EXPORT_SIZE_PRESETS,
  GRID_PRESETS,
  findCollagePreset,
  findGridPresetByDimensions,
  formatRecommendedGrid,
  getPresetsByCategory,
  gridsMatch,
} from './presets'
