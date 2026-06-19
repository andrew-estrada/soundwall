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
  return `soundwall-${settings.exportPresetId}-${settings.gridRows}x${settings.gridCols}.${extension}`
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
      filenameBase: `soundwall-${settings.exportPresetId}-${settings.gridRows}x${settings.gridCols}`,
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

export function formatExportMessage(result: CollageExportResult): string {
  if (result.failedImageCount > 0) {
    return `Exported ${result.filename} with ${result.failedImageCount} missing cover${result.failedImageCount === 1 ? '' : 's'}.`
  }

  return `Exported ${result.filename}.`
}
