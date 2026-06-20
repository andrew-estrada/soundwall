import { describe, expect, it } from 'vitest'
import type { CollageSettings } from '../types'
import { calculateGridLayout, getCellPosition } from './drawCollage'

const baseSettings: CollageSettings = {
  exportPresetId: 'square-3000',
  gridPresetId: 'grid-5x5',
  gridCols: 5,
  gridRows: 5,
  albumCount: 25,
  spacing: 4,
  backgroundColor: '#121212',
  roundedCorners: false,
  cornerRadius: 8,
  borderEnabled: false,
  borderWidth: 2,
  borderColor: '#888888',
  order: 'rank',
  oneAlbumPerArtist: true,
  exportWidth: 3000,
  exportHeight: 3000,
}

describe('calculateGridLayout', () => {
  it('computes cell dimensions from export size, grid, and spacing', () => {
    const layout = calculateGridLayout(baseSettings)

    expect(layout.cols).toBe(5)
    expect(layout.rows).toBe(5)
    expect(layout.spacing).toBe(4)
    expect(layout.cellWidth).toBe((3000 - 4 * (5 + 1)) / 5)
    expect(layout.cellHeight).toBe((3000 - 4 * (5 + 1)) / 5)
  })

  it('supports non-square grids', () => {
    const layout = calculateGridLayout({
      ...baseSettings,
      gridCols: 8,
      gridRows: 10,
      exportWidth: 3200,
      exportHeight: 4000,
      spacing: 0,
    })

    expect(layout.cellWidth).toBe(400)
    expect(layout.cellHeight).toBe(400)
  })
})

describe('getCellPosition', () => {
  it('places the first cell after the outer spacing inset', () => {
    const layout = calculateGridLayout(baseSettings)

    expect(getCellPosition(layout, 0, 0)).toEqual({ x: 4, y: 4 })
  })

  it('advances by cell size plus spacing for each column and row', () => {
    const layout = calculateGridLayout({
      ...baseSettings,
      gridCols: 3,
      gridRows: 2,
      exportWidth: 100,
      exportHeight: 60,
      spacing: 10,
    })

    expect(getCellPosition(layout, 1, 0)).toEqual({ x: 40, y: 10 })
    expect(getCellPosition(layout, 0, 1)).toEqual({ x: 10, y: 35 })
    expect(getCellPosition(layout, 2, 1)).toEqual({ x: 70, y: 35 })
  })
})
