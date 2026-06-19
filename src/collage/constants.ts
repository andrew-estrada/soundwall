import type { CollageSettings } from '../types'

export const DEFAULT_COLLAGE_SETTINGS: CollageSettings = {
  exportPresetId: 'square-3000',
  gridPresetId: 'grid-5x5',
  gridCols: 5,
  gridRows: 5,
  spacing: 4,
  backgroundColor: '#121212',
  order: 'rank',
  oneAlbumPerArtist: true,
  exportWidth: 3000,
  exportHeight: 3000,
  shuffleSeed: 0,
}
