import type { CSSProperties } from 'react'
import { AlertCircle, Disc3, LoaderCircle, X } from 'lucide-react'
import type { AlbumCandidate, CollageSettings } from '../types'

interface CollagePreviewProps {
  settings: CollageSettings
  albums: AlbumCandidate[]
  isConnected: boolean
  isLoadingTracks?: boolean
  tracksError?: string | null
  trackCount?: number
  availableAlbumCount?: number
  disabled?: boolean
  onRemoveAlbum?: (album: AlbumCandidate) => void
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
  disabled = false,
  onRemoveAlbum,
  onRetry,
  onReconnect,
}: CollagePreviewProps) {
  const { gridCols, gridRows, spacing, backgroundColor, oneAlbumPerArtist } = settings
  const cellCount = gridCols * gridRows
  const canRemove = Boolean(onRemoveAlbum) && !disabled && !isLoadingTracks

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
        <Disc3 className="collage-preview__empty-icon" size={44} aria-hidden="true" />
        <p className="collage-preview__empty-title">Not enough album art yet</p>
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
            <li>One album per artist is on — turn it off in controls if you need more covers.</li>
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
          {canRemove ? (
            <button
              type="button"
              className="collage-preview__cell-remove"
              title="Remove from collage"
              aria-label={`Remove ${album.albumName} by ${album.artistName} from collage`}
              onClick={() => onRemoveAlbum?.(album)}
            >
              <X size={14} aria-hidden="true" />
              <span className="sr-only">Remove from collage</span>
            </button>
          ) : null}
        </div>
      )
    })
  }

  function renderContent() {
    if (!isConnected) {
      return (
        <div className="collage-preview__empty">
          <Disc3 className="collage-preview__empty-icon" size={44} aria-hidden="true" />
          <p className="collage-preview__empty-title">Your collage will appear here</p>
          <p className="collage-preview__empty-text">
            Connect Spotify to fill the wall with your most-played album covers.
          </p>
        </div>
      )
    }

    if (isLoadingTracks) {
      return (
        <div className="collage-preview__loading">
          <div
            className="collage-preview__grid collage-preview__grid--loading"
            style={gridStyle}
          >
            {renderGridCells('loading')}
          </div>
          <p className="collage-preview__loading-caption">
            <LoaderCircle
              className="collage-preview__loading-spinner"
              size={16}
              aria-hidden="true"
            />
            Building your collage from your top albums…
          </p>
        </div>
      )
    }

    if (tracksError) {
      const isSessionError = /expired|connect again/i.test(tracksError)

      return (
        <div className="collage-preview__empty collage-preview__empty--error" role="alert">
          <AlertCircle className="collage-preview__empty-icon" size={40} aria-hidden="true" />
          <p className="collage-preview__empty-title">We couldn’t load your music</p>
          <p className="collage-preview__empty-text">{tracksError}</p>
          {isSessionError && onReconnect ? (
            <button type="button" className="control-button" onClick={onReconnect}>
              Connect Spotify again
            </button>
          ) : null}
          {!isSessionError && onRetry ? (
            <button type="button" className="control-button" onClick={onRetry}>
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
      <div className="collage-preview__frame">{renderContent()}</div>
    </section>
  )
}
