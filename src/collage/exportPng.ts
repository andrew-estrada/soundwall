import type { AlbumCandidate, CollageSettings } from '../types'
import {
  buildExportFilename,
  canvasToBlob,
  downloadBlob,
  formatExportMessage,
  prepareCollageExport,
} from './exportCollage'

export {
  CollageExportError,
  ImageLoadError,
} from './exportCollage'

export interface ExportCollagePngOptions {
  albums: AlbumCandidate[]
  settings: CollageSettings
}

export type ExportCollagePngResult = {
  filename: string
  failedImageCount: number
}

export async function exportCollagePng(
  options: ExportCollagePngOptions,
): Promise<ExportCollagePngResult> {
  const { canvas, failedImageCount } = await prepareCollageExport(options)
  const filename = buildExportFilename(options.settings, 'png')
  const blob = await canvasToBlob(canvas)

  downloadBlob(blob, filename)

  return { filename, failedImageCount }
}

export { formatExportMessage }
