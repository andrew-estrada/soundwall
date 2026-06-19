import { jsPDF } from 'jspdf'
import type { AlbumCandidate, CollageSettings } from '../types'
import {
  buildExportFilename,
  canvasToDataUrl,
  CollageExportError,
  prepareCollageExport,
} from './exportCollage'

export {
  CollageExportError,
  ImageLoadError,
} from './exportCollage'

export interface ExportCollagePdfOptions {
  albums: AlbumCandidate[]
  settings: CollageSettings
}

export interface ExportCollagePdfResult {
  filename: string
  failedImageCount: number
}

export async function exportCollagePdf(
  options: ExportCollagePdfOptions,
): Promise<ExportCollagePdfResult> {
  const { settings } = options
  const { canvas, failedImageCount } = await prepareCollageExport(options)
  const filename = buildExportFilename(settings, 'pdf')
  const imageData = canvasToDataUrl(canvas)

  const pageWidthInches = settings.exportWidth / 300
  const pageHeightInches = settings.exportHeight / 300

  let pdf: jsPDF

  try {
    pdf = new jsPDF({
      unit: 'in',
      format: [pageWidthInches, pageHeightInches],
      orientation: pageWidthInches >= pageHeightInches ? 'landscape' : 'portrait',
      compress: true,
    })
  } catch {
    throw new CollageExportError('Failed to create the PDF document.')
  }

  try {
    pdf.addImage(imageData, 'PNG', 0, 0, pageWidthInches, pageHeightInches)
    pdf.save(filename)
  } catch {
    throw new CollageExportError(
      'Failed to add the collage image to the PDF. Try a smaller export preset.',
    )
  }

  return { filename, failedImageCount }
}
