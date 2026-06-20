import type { AlbumCandidate, CollageSettings } from '../types'
import {
  drawAlbumCoverCell,
  resolveAlbumAppearance,
} from './albumAppearance'

export interface DrawCollageOptions {
  albums: AlbumCandidate[]
  settings: CollageSettings
  images: Map<string, HTMLImageElement>
}

export interface GridLayout {
  cellWidth: number
  cellHeight: number
  spacing: number
  cols: number
  rows: number
}

export function calculateGridLayout(settings: CollageSettings): GridLayout {
  const { exportWidth, exportHeight, gridCols, gridRows, spacing } = settings

  const cellWidth = (exportWidth - spacing * (gridCols + 1)) / gridCols
  const cellHeight = (exportHeight - spacing * (gridRows + 1)) / gridRows

  return {
    cellWidth,
    cellHeight,
    spacing,
    cols: gridCols,
    rows: gridRows,
  }
}

export function getCellPosition(
  layout: GridLayout,
  col: number,
  row: number,
): { x: number; y: number } {
  return {
    x: layout.spacing + col * (layout.cellWidth + layout.spacing),
    y: layout.spacing + row * (layout.cellHeight + layout.spacing),
  }
}

export function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const source = image as HTMLImageElement
  const sourceWidth = source.naturalWidth || source.width
  const sourceHeight = source.naturalHeight || source.height

  if (sourceWidth === 0 || sourceHeight === 0) {
    return
  }

  const sourceAspect = sourceWidth / sourceHeight
  const destinationAspect = width / height

  let cropX = 0
  let cropY = 0
  let cropWidth = sourceWidth
  let cropHeight = sourceHeight

  if (sourceAspect > destinationAspect) {
    cropWidth = sourceHeight * destinationAspect
    cropX = (sourceWidth - cropWidth) / 2
  } else if (sourceAspect < destinationAspect) {
    cropHeight = sourceWidth / destinationAspect
    cropY = (sourceHeight - cropHeight) / 2
  }

  context.drawImage(source, cropX, cropY, cropWidth, cropHeight, x, y, width, height)
}

export function drawCollage(options: DrawCollageOptions): HTMLCanvasElement {
  const { albums, settings, images } = options
  const { exportWidth, exportHeight, backgroundColor, gridCols, gridRows } = settings

  const canvas = document.createElement('canvas')
  canvas.width = exportWidth
  canvas.height = exportHeight

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not create a canvas drawing context.')
  }

  context.fillStyle = backgroundColor
  context.fillRect(0, 0, exportWidth, exportHeight)

  const layout = calculateGridLayout(settings)
  const cellCount = gridCols * gridRows

  for (let index = 0; index < cellCount; index += 1) {
    const album = albums[index]
    if (!album) {
      continue
    }

    const image = images.get(album.imageUrl)
    if (!image) {
      continue
    }

    const col = index % gridCols
    const row = Math.floor(index / gridCols)
    const { x, y } = getCellPosition(layout, col, row)
    const appearance = resolveAlbumAppearance(settings, layout.cellWidth, layout.cellHeight)

    drawAlbumCoverCell(
      context,
      image,
      x,
      y,
      layout.cellWidth,
      layout.cellHeight,
      appearance,
      drawCoverImage,
    )
  }

  return canvas
}
