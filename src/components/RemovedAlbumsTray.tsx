import { RotateCcw } from 'lucide-react'
import type { AlbumCandidate } from '../types'

interface RemovedAlbumsTrayProps {
  albums: AlbumCandidate[]
  disabled?: boolean
  onRestoreAlbum: (albumId: string) => void
}

export function RemovedAlbumsTray({
  albums,
  disabled = false,
  onRestoreAlbum,
}: RemovedAlbumsTrayProps) {
  return (
    <section className="removed-albums-tray" aria-labelledby="removed-albums-heading">
      <h3 id="removed-albums-heading" className="removed-albums-tray__title">
        Removed albums
      </h3>

      {albums.length === 0 ? (
        <p className="removed-albums-tray__empty">
          Removed covers appear here. Use Remove on any cover in the preview.
        </p>
      ) : (
        <ul className="removed-albums-tray__list">
          {albums.map((album) => (
            <li key={album.albumId} className="removed-albums-tray__item">
              <img
                className="removed-albums-tray__cover"
                src={album.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <div className="removed-albums-tray__meta">
                <span className="removed-albums-tray__name">{album.albumName}</span>
                <span className="removed-albums-tray__artist">{album.artistName}</span>
              </div>
              <button
                type="button"
                className="removed-albums-tray__restore"
                disabled={disabled}
                title={`Restore ${album.albumName}`}
                aria-label={`Restore ${album.albumName} by ${album.artistName}`}
                onClick={() => onRestoreAlbum(album.albumId)}
              >
                <RotateCcw size={14} aria-hidden="true" />
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
