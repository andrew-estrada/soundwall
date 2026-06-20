import { useState, type CSSProperties, type DragEvent } from 'react'
import { resolvePreviewAlbumAppearance } from '../collage/albumAppearance'
import { AlertCircle, Disc3, GripVertical, LoaderCircle } from 'lucide-react'
import type { CollageAlbumSlot, CollageSettings } from '../types'

interface CollagePreviewProps {
  settings: CollageSettings
  albumSlots: CollageAlbumSlot[]
  isConnected: boolean
  isLoadingTracks?: boolean
  tracksError?: string | null
  trackCount?: number
  availableAlbumCount?: number
  disabled?: boolean
  onSelectAlbum?: (slot: CollageAlbumSlot) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  onRetry?: () => void
  onReconnect?: () => void
}

export function CollagePreview({
  settings,
  albumSlots,
  isConnected,
  isLoadingTracks = false,
  tracksError = null,
  trackCount = 0,
  availableAlbumCount = 0,
  disabled = false,
  onSelectAlbum,
  onReorder,
  onRetry,
  onReconnect,
}: CollagePreviewProps) {
  const { gridCols, gridRows, spacing, backgroundColor, oneAlbumPerArtist } = settings
  const cellCount = gridCols * gridRows
  const canEdit = Boolean(onSelectAlbum) && !disabled && !isLoadingTracks
  const canReorder = Boolean(onReorder) && !disabled && !isLoadingTracks && albumSlots.length > 1
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [reorderMessage, setReorderMessage] = useState<string | null>(null)
  const coverAppearance = resolvePreviewAlbumAppearance(settings)

  const gridStyle = {
    '--preview-cols': gridCols,
    '--preview-rows': gridRows,
    '--preview-gap': `${spacing}px`,
    '--preview-bg': backgroundColor,
    '--preview-aspect': `${gridCols} / ${gridRows}`,
    '--preview-cover-radius': `${coverAppearance.cornerRadius}px`,
    '--preview-cover-border-width': `${coverAppearance.borderWidth}px`,
    '--preview-cover-border-color': coverAppearance.borderColor,
    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
  } as CSSProperties

  function clearDragState() {
    setDragIndex(null)
    setDropIndex(null)
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, index: number, label: string) {
    setDragIndex(index)
    setDropIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
    event.dataTransfer.setData('application/x-soundwall-slot', String(index))

    const cover = event.currentTarget.closest('.collage-preview__cell')?.querySelector('img')

    if (cover instanceof HTMLImageElement) {
      event.dataTransfer.setDragImage(cover, cover.width / 2, cover.height / 2)
    }

    setReorderMessage(`Dragging ${label}`)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, index: number) {
    if (dragIndex === null) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    if (dropIndex !== index) {
      setDropIndex(index)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault()

    if (dragIndex === null || dragIndex === index) {
      clearDragState()
      return
    }

    const movedSlot = albumSlots[dragIndex]

    onReorder?.(dragIndex, index)

    if (movedSlot) {
      setReorderMessage(
        `Moved ${movedSlot.album.albumName} to position ${index + 1}`,
      )
    }

    clearDragState()
  }

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
      const slot = mode === 'albums' ? albumSlots[index] : null

      if (mode === 'loading') {
        return (
          <div
            key={`loading-${index}`}
            className="collage-preview__cell collage-preview__cell--loading"
            aria-hidden="true"
          />
        )
      }

      if (!slot) {
        return (
          <div
            key={`empty-${index}`}
            className="collage-preview__cell collage-preview__cell--empty"
            aria-hidden="true"
          />
        )
      }

      const { album } = slot
      const isDragging = dragIndex === index
      const isDropTarget = dropIndex === index && dragIndex !== null && dragIndex !== index
      const cellClassName = [
        'collage-preview__cell',
        isDragging ? 'collage-preview__cell--dragging' : '',
        isDropTarget ? 'collage-preview__cell--drop-target' : '',
      ]
        .filter(Boolean)
        .join(' ')

      return (
        <div
          key={slot.slotAlbumId}
          className={cellClassName}
          onDragOver={canReorder ? (event) => handleDragOver(event, index) : undefined}
          onDrop={canReorder ? (event) => handleDrop(event, index) : undefined}
        >
          {canReorder ? (
            <button
              type="button"
              className="collage-preview__drag-handle"
              draggable
              aria-label={`Drag to reorder ${album.albumName} by ${album.artistName}`}
              title={`Drag to reorder ${album.albumName}`}
              onDragStart={(event) =>
                handleDragStart(event, index, `${album.albumName} by ${album.artistName}`)
              }
              onDragEnd={clearDragState}
            >
              <GripVertical size={14} aria-hidden="true" />
            </button>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              className="collage-preview__cell-button"
              title={`Edit ${album.albumName}`}
              aria-label={`Edit ${album.albumName} by ${album.artistName}`}
              onClick={() => onSelectAlbum?.(slot)}
            >
              <img
                className="collage-preview__cover"
                src={album.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </button>
          ) : (
            <img
              className="collage-preview__cover"
              src={album.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          )}
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

    if (albumSlots.length === 0) {
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
      {canReorder ? (
        <p className="sr-only" aria-live="polite">
          {reorderMessage}
        </p>
      ) : null}
      <div className="collage-preview__frame">{renderContent()}</div>
    </section>
  )
}
