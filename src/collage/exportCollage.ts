import type { AlbumCandidate, CollageSettings } from '../types'
import { drawCollage } from './drawCollage'

export const EXPORT_DPI = 300

export class CollageExportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CollageExportError'
  }
}

export class ImageLoadError extends CollageExportError {
  readonly imageUrl: string

  constructor(imageUrl: string) {
    super(`Failed to load album cover: ${imageUrl}`)
    this.name = 'ImageLoadError'
    this.imageUrl = imageUrl
  }
}

export interface PrepareCollageExportOptions {
  albums: AlbumCandidate[]
  settings: CollageSettings
}

export interface PreparedCollageExport {
  canvas: HTMLCanvasElement
  failedImageCount: number
  filenameBase: string
}

export interface CollageExportResult {
  filename: string
  failedImageCount: number
}

export function buildExportFilename(
  settings: CollageSettings,
  extension: 'png' | 'pdf',
): string {
  return `soundwall-${settings.exportPresetId}-${settings.gridCols}x${settings.gridRows}.${extension}`
}

export function getPdfPageSizeInches(settings: CollageSettings): {
  width: number
  height: number
} {
  return {
    width: settings.exportWidth / EXPORT_DPI,
    height: settings.exportHeight / EXPORT_DPI,
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'

    image.onload = () => resolve(image)
    image.onerror = () => reject(new ImageLoadError(url))
    image.src = url
  })
}

async function loadAlbumImages(
  albums: AlbumCandidate[],
): Promise<{ images: Map<string, HTMLImageElement>; failedImageCount: number }> {
  const uniqueUrls = [...new Set(albums.map((album) => album.imageUrl))]
  const images = new Map<string, HTMLImageElement>()
  let failedImageCount = 0

  await Promise.all(
    uniqueUrls.map(async (url) => {
      try {
        const image = await loadImage(url)
        images.set(url, image)
      } catch {
        failedImageCount += 1
      }
    }),
  )

  return { images, failedImageCount }
}

export async function prepareCollageExport(
  options: PrepareCollageExportOptions,
): Promise<PreparedCollageExport> {
  const { albums, settings } = options

  if (albums.length === 0) {
    throw new CollageExportError('Add at least one album cover before exporting.')
  }

  const { images, failedImageCount } = await loadAlbumImages(albums)
  const drawableAlbums = albums.filter((album) => images.has(album.imageUrl))

  if (drawableAlbums.length === 0) {
    throw new CollageExportError(
      'Could not load any album covers. Check your connection and try again.',
    )
  }

  try {
    const canvas = drawCollage({
      albums,
      settings,
      images,
    })

    return {
      canvas,
      failedImageCount,
      filenameBase: `soundwall-${settings.exportPresetId}-${settings.gridCols}x${settings.gridRows}`,
    }
  } catch (error) {
    if (error instanceof CollageExportError) {
      throw error
    }

    throw new CollageExportError('Failed to draw the collage for export.')
  }
}

export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  try {
    return canvas.toDataURL('image/png')
  } catch {
    throw new CollageExportError('Failed to convert the collage canvas to image data.')
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new CollageExportError('Failed to generate PNG data from the collage canvas.'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

export function formatExportMessage(
  result: CollageExportResult & { downscaled?: boolean },
): string {
  const parts: string[] = []

  if (result.downscaled) {
    parts.push('PDF image was downscaled for browser limits')
  }

  if (result.failedImageCount > 0) {
    parts.push(
      `${result.failedImageCount} missing cover${result.failedImageCount === 1 ? '' : 's'}`,
    )
  }

  if (parts.length > 0) {
    return `Exported ${result.filename} (${parts.join('; ')}).`
  }

  return `Exported ${result.filename}.`
}

export const PDF_MAX_CANVAS_EDGE = 4096

export function hasExportGridAspectMismatch(
  settings: CollageSettings,
  tolerance = 0.12,
): boolean {
  const exportAspect = settings.exportWidth / settings.exportHeight
  const gridAspect = settings.gridCols / settings.gridRows
  const relativeDifference = Math.abs(exportAspect - gridAspect) / exportAspect

  return relativeDifference > tolerance
}

export function isLargePosterExport(exportPresetId: string): boolean {
  return exportPresetId.startsWith('poster-')
}

export function downscaleCanvasForEmbed(
  canvas: HTMLCanvasElement,
  maxEdge = PDF_MAX_CANVAS_EDGE,
): HTMLCanvasElement {
  const longestEdge = Math.max(canvas.width, canvas.height)

  if (longestEdge <= maxEdge) {
    return canvas
  }

  const scale = maxEdge / longestEdge
  const output = document.createElement('canvas')
  output.width = Math.max(1, Math.round(canvas.width * scale))
  output.height = Math.max(1, Math.round(canvas.height * scale))

  const context = output.getContext('2d')

  if (!context) {
    throw new CollageExportError('Failed to downscale the collage for PDF export.')
  }

  context.drawImage(canvas, 0, 0, output.width, output.height)

  return output
}
