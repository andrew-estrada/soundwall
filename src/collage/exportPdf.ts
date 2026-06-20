import { jsPDF } from 'jspdf'
import type { AlbumCandidate, CollageSettings } from '../types'
import {
  buildExportFilename,
  canvasToDataUrl,
  CollageExportError,
  downscaleCanvasForEmbed,
  getPdfPageSizeInches,
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
  downscaled: boolean
}

export async function exportCollagePdf(
  options: ExportCollagePdfOptions,
): Promise<ExportCollagePdfResult> {
  const { settings } = options
  const { canvas, failedImageCount } = await prepareCollageExport(options)
  const filename = buildExportFilename(settings, 'pdf')
  const embedCanvas = downscaleCanvasForEmbed(canvas)
  const downscaled = embedCanvas !== canvas
  const imageData = canvasToDataUrl(embedCanvas)
  const { width: pageWidthInches, height: pageHeightInches } = getPdfPageSizeInches(settings)

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
      'Failed to add the collage image to the PDF. Try PNG export or a smaller export preset.',
    )
  }

  return { filename, failedImageCount, downscaled }
}
