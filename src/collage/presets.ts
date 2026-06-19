import type { CollagePreset, CollagePresetCategory, RecommendedGrid } from '../types'

export type { CollagePreset, CollagePresetCategory, RecommendedGrid }

export const EXPORT_SIZE_PRESETS: CollagePreset[] = [
  {
    id: 'square-3000',
    label: 'Square',
    width: 3000,
    height: 3000,
    recommendedGrid: { cols: 5, rows: 5 },
    category: 'square',
  },
  {
    id: 'wallpaper-phone',
    label: 'Phone wallpaper',
    width: 1290,
    height: 2796,
    recommendedGrid: { cols: 6, rows: 10 },
    category: 'wallpaper',
  },
  {
    id: 'wallpaper-desktop',
    label: 'Desktop wallpaper',
    width: 3840,
    height: 2160,
    recommendedGrid: { cols: 10, rows: 6 },
    category: 'wallpaper',
  },
  {
    id: 'poster-11x17',
    label: '11 × 17 poster (300 DPI)',
    width: 3300,
    height: 5100,
    recommendedGrid: { cols: 8, rows: 10 },
    category: 'poster',
  },
  {
    id: 'poster-18x24',
    label: '18 × 24 poster (300 DPI)',
    width: 5400,
    height: 7200,
    recommendedGrid: { cols: 9, rows: 12 },
    category: 'poster',
  },
  {
    id: 'poster-24x36',
    label: '24 × 36 poster (300 DPI)',
    width: 7200,
    height: 10800,
    recommendedGrid: { cols: 10, rows: 12 },
    category: 'poster',
  },
]

export const GRID_PRESETS: CollagePreset[] = [
  {
    id: 'grid-5x5',
    label: '5 × 5',
    width: 3000,
    height: 3000,
    recommendedGrid: { cols: 5, rows: 5 },
    category: 'grid',
  },
  {
    id: 'grid-6x6',
    label: '6 × 6',
    width: 3600,
    height: 3600,
    recommendedGrid: { cols: 6, rows: 6 },
    category: 'grid',
  },
  {
    id: 'grid-8x10',
    label: '8 × 10',
    width: 3200,
    height: 4000,
    recommendedGrid: { cols: 8, rows: 10 },
    category: 'grid',
  },
  {
    id: 'grid-10x10',
    label: '10 × 10',
    width: 4000,
    height: 4000,
    recommendedGrid: { cols: 10, rows: 10 },
    category: 'grid',
  },
]

export const COLLAGE_PRESETS: CollagePreset[] = [...EXPORT_SIZE_PRESETS, ...GRID_PRESETS]

export function formatRecommendedGrid(grid: RecommendedGrid): string {
  return `${grid.cols} × ${grid.rows}`
}

export function findCollagePreset(id: string): CollagePreset | undefined {
  return COLLAGE_PRESETS.find((preset) => preset.id === id)
}

export function getPresetsByCategory(category: CollagePresetCategory): CollagePreset[] {
  return COLLAGE_PRESETS.filter((preset) => preset.category === category)
}
