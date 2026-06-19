import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { AlertCircle, Disc3 } from 'lucide-react'
import { orderAlbums } from '../collage/orderAlbums'
import type { AlbumCandidate, CollageSettings } from '../types'

interface CollagePreviewProps {
  settings: CollageSettings
  albums: AlbumCandidate[]
  isConnected: boolean
  isLoadingTracks?: boolean
  tracksError?: string | null
}

export function CollagePreview({
  settings,
  albums,
  isConnected,
  isLoadingTracks = false,
  tracksError = null,
}: CollagePreviewProps) {
  const { gridCols, gridRows, spacing, backgroundColor, order } = settings
  const cellCount = gridCols * gridRows

  const orderedAlbums = useMemo(
    () => orderAlbums(albums, order, settings.shuffleSeed),
    [albums, order, settings.shuffleSeed],
  )

  const gridStyle = {
    '--preview-cols': gridCols,
    '--preview-rows': gridRows,
    '--preview-gap': `${spacing}px`,
    '--preview-bg': backgroundColor,
    '--preview-aspect': `${gridCols} / ${gridRows}`,
    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
  } as CSSProperties

  function renderGridCells(mode: 'loading' | 'albums') {
    return Array.from({ length: cellCount }, (_, index) => {
      const album = mode === 'albums' ? orderedAlbums[index] : null

      if (mode === 'loading') {
        return (
          <div
            key={`loading-${index}`}
            className="collage-preview__cell collage-preview__cell--loading"
            aria-hidden="true"
          />
        )
      }

      if (!album) {
        return (
          <div
            key={`empty-${index}`}
            className="collage-preview__cell collage-preview__cell--empty"
            aria-hidden="true"
          />
        )
      }

      return (
        <div key={album.albumId} className="collage-preview__cell">
          <img
            className="collage-preview__cover"
            src={album.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      )
    })
  }

  function renderContent() {
    if (!isConnected) {
      return (
        <div className="collage-preview__empty">
          <Disc3 className="collage-preview__empty-icon" size={40} aria-hidden="true" />
          <p className="collage-preview__empty-text">
            Your album collage will appear here after you connect Spotify.
          </p>
        </div>
      )
    }

    if (isLoadingTracks) {
      return (
        <div className="collage-preview__grid collage-preview__grid--loading" style={gridStyle}>
          {renderGridCells('loading')}
        </div>
      )
    }

    if (tracksError) {
      return (
        <div className="collage-preview__empty collage-preview__empty--error">
          <AlertCircle className="collage-preview__empty-icon" size={36} aria-hidden="true" />
          <p className="collage-preview__empty-text">{tracksError}</p>
        </div>
      )
    }

    if (orderedAlbums.length === 0) {
      return (
        <div className="collage-preview__empty">
          <Disc3 className="collage-preview__empty-icon" size={40} aria-hidden="true" />
          <p className="collage-preview__empty-text">
            No album covers are available yet. Try reconnecting to Spotify.
          </p>
        </div>
      )
    }

    return (
      <div className="collage-preview__grid" style={gridStyle}>
        {renderGridCells('albums')}
      </div>
    )
  }

  return (
    <section className="collage-preview" aria-label="Collage preview">
      <h2 className="collage-preview__label">Preview</h2>

      <div className="collage-preview__frame">{renderContent()}</div>
    </section>
  )
}
