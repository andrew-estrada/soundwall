import type { CSSProperties } from 'react'
import { AlertCircle, Disc3 } from 'lucide-react'
import type { AlbumCandidate, CollageSettings } from '../types'

interface CollagePreviewProps {
  settings: CollageSettings
  albums: AlbumCandidate[]
  isConnected: boolean
  isLoadingTracks?: boolean
  tracksError?: string | null
  trackCount?: number
  availableAlbumCount?: number
  onRetry?: () => void
  onReconnect?: () => void
}

export function CollagePreview({
  settings,
  albums,
  isConnected,
  isLoadingTracks = false,
  tracksError = null,
  trackCount = 0,
  availableAlbumCount = 0,
  onRetry,
  onReconnect,
}: CollagePreviewProps) {
  const { gridCols, gridRows, spacing, backgroundColor, oneAlbumPerArtist } = settings
  const cellCount = gridCols * gridRows

  const gridStyle = {
    '--preview-cols': gridCols,
    '--preview-rows': gridRows,
    '--preview-gap': `${spacing}px`,
    '--preview-bg': backgroundColor,
    '--preview-aspect': `${gridCols} / ${gridRows}`,
    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
  } as CSSProperties

  function renderEmptyAlbumState() {
    return (
      <div className="collage-preview__empty">
        <Disc3 className="collage-preview__empty-icon" size={40} aria-hidden="true" />
        <p className="collage-preview__empty-text">
          Could not build a collage from your top tracks yet.
        </p>
        <ul className="collage-preview__empty-list">
          {trackCount === 0 ? (
            <li>
              Spotify returned no top tracks. You may need more listening history, or your account
              may need to be on the Spotify Developer app allowlist.
            </li>
          ) : (
            <li>
              Found {trackCount} top tracks, but {availableAlbumCount} usable album
              {availableAlbumCount === 1 ? '' : 's'} with cover art.
            </li>
          )}
          <li>Tracks without album artwork are skipped.</li>
          {oneAlbumPerArtist ? (
            <li>
              One album per artist is on — turn it off in controls if you need more covers.
            </li>
          ) : null}
        </ul>
      </div>
    )
  }

  function renderGridCells(mode: 'loading' | 'albums') {
    return Array.from({ length: cellCount }, (_, index) => {
      const album = mode === 'albums' ? albums[index] : null

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
      const isSessionError = /expired|connect again/i.test(tracksError)

      return (
        <div className="collage-preview__empty collage-preview__empty--error">
          <AlertCircle className="collage-preview__empty-icon" size={36} aria-hidden="true" />
          <p className="collage-preview__empty-text">{tracksError}</p>
          {isSessionError && onReconnect ? (
            <button type="button" className="connect-button" onClick={onReconnect}>
              Connect Spotify again
            </button>
          ) : null}
          {!isSessionError && onRetry ? (
            <button type="button" className="export-button" onClick={onRetry}>
              Try again
            </button>
          ) : null}
        </div>
      )
    }

    if (albums.length === 0) {
      return renderEmptyAlbumState()
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
