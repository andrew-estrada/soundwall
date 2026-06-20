import type { CollageSettings } from '../types'

export const CORNER_RADIUS_MAX = 24
export const BORDER_WIDTH_MAX = 8
export const PREVIEW_REFERENCE_CELL_SIZE = 100

export interface ResolvedAlbumAppearance {
  cornerRadius: number
  borderWidth: number
  borderColor: string
}

export function resolveAlbumAppearance(
  settings: CollageSettings,
  cellWidth: number,
  cellHeight: number,
): ResolvedAlbumAppearance {
  const minDim = Math.min(cellWidth, cellHeight)
  const scale = minDim / PREVIEW_REFERENCE_CELL_SIZE

  return {
    cornerRadius:
      settings.roundedCorners && settings.cornerRadius > 0
        ? settings.cornerRadius * scale
        : 0,
    borderWidth:
      settings.borderEnabled && settings.borderWidth > 0 ? settings.borderWidth * scale : 0,
    borderColor: settings.borderColor,
  }
}

export function resolvePreviewAlbumAppearance(
  settings: CollageSettings,
): ResolvedAlbumAppearance {
  return resolveAlbumAppearance(
    settings,
    PREVIEW_REFERENCE_CELL_SIZE,
    PREVIEW_REFERENCE_CELL_SIZE,
  )
}

export function addRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const clampedRadius = Math.max(0, Math.min(radius, width / 2, height / 2))

  if (clampedRadius === 0) {
    context.rect(x, y, width, height)
    return
  }

  if (typeof context.roundRect === 'function') {
    context.roundRect(x, y, width, height, clampedRadius)
    return
  }

  context.moveTo(x + clampedRadius, y)
  context.lineTo(x + width - clampedRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius)
  context.lineTo(x + width, y + height - clampedRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height)
  context.lineTo(x + clampedRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius)
  context.lineTo(x, y + clampedRadius)
  context.quadraticCurveTo(x, y, x + clampedRadius, y)
  context.closePath()
}

export function drawAlbumCoverCell(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
  appearance: ResolvedAlbumAppearance,
  drawImage: (
    ctx: CanvasRenderingContext2D,
    img: CanvasImageSource,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ) => void,
): void {
  const { cornerRadius, borderWidth, borderColor } = appearance

  context.save()
  context.beginPath()
  addRoundedRectPath(context, x, y, width, height, cornerRadius)
  context.clip()
  drawImage(context, image, x, y, width, height)
  context.restore()

  if (borderWidth <= 0) {
    return
  }

  context.save()
  context.strokeStyle = borderColor
  context.lineWidth = borderWidth
  context.beginPath()
  addRoundedRectPath(
    context,
    x + borderWidth / 2,
    y + borderWidth / 2,
    width - borderWidth,
    height - borderWidth,
    Math.max(0, cornerRadius - borderWidth / 2),
  )
  context.stroke()
  context.restore()
}
