import { useEffect, useRef, useState } from 'react'
import { AlertCircle, LoaderCircle, Search, Trash2, X } from 'lucide-react'
import { SpotifyApiError } from '../spotify/client'
import {
  searchResultToAlbumCandidate,
  searchSpotifyAlbums,
  type SpotifySearchAlbum,
} from '../spotify/searchAlbums'
import type { AlbumCandidate, CollageAlbumSlot } from '../types'

interface AlbumEditorPanelProps {
  slot: CollageAlbumSlot | null
  accessToken: string | null
  disabled?: boolean
  onClose: () => void
  onRemove: (slot: CollageAlbumSlot) => void
  onReplace: (slotAlbumId: string, replacement: AlbumCandidate) => void
}

const SEARCH_DEBOUNCE_MS = 350

export function AlbumEditorPanel({
  slot,
  accessToken,
  disabled = false,
  onClose,
  onRemove,
  onReplace,
}: AlbumEditorPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifySearchAlbum[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (slot && !dialog.open) {
      dialog.showModal()
    }

    if (!slot && dialog.open) {
      dialog.close()
    }
  }, [slot])

  useEffect(() => {
    if (!slot) {
      setQuery('')
      setResults([])
      setSearchError(null)
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setQuery('')
    setResults([])
    setSearchError(null)
    setHasSearched(false)
  }, [slot?.slotAlbumId])

  useEffect(() => {
    if (!slot || !accessToken) {
      return
    }

    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setSearchError(null)
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    const timeoutId = window.setTimeout(() => {
      void searchSpotifyAlbums(accessToken, trimmed)
        .then((albums) => {
          setResults(albums)
          setHasSearched(true)
        })
        .catch((error) => {
          setResults([])
          setHasSearched(true)
          setSearchError(
            error instanceof SpotifyApiError
              ? error.message
              : 'Album search failed. Please try again.',
          )
        })
        .finally(() => {
          setIsSearching(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [accessToken, query, slot])

  function handleClose() {
    onClose()
  }

  function handleRemove() {
    if (!slot) {
      return
    }

    onRemove(slot)
  }

  function handleSelectReplacement(result: SpotifySearchAlbum) {
    if (!slot) {
      return
    }

    onReplace(slot.slotAlbumId, searchResultToAlbumCandidate(result))
  }

  if (!slot) {
    return null
  }

  const { album } = slot

  return (
    <dialog
      ref={dialogRef}
      className="album-editor"
      aria-labelledby="album-editor-title"
      onCancel={(event) => {
        event.preventDefault()
        handleClose()
      }}
      onClose={handleClose}
    >
      <div className="album-editor__panel">
        <header className="album-editor__header">
          <div>
            <h2 id="album-editor-title" className="album-editor__title">
              Edit album
            </h2>
            <p className="album-editor__subtitle">Remove this cover or replace it with another album.</p>
          </div>
          <button
            type="button"
            className="album-editor__close"
            aria-label="Close album editor"
            onClick={handleClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <section className="album-editor__current" aria-label="Selected album">
          <img
            className="album-editor__current-cover"
            src={album.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="album-editor__current-meta">
            <p className="album-editor__current-name">{album.albumName}</p>
            <p className="album-editor__current-artist">{album.artistName}</p>
          </div>
          <button
            type="button"
            className="control-button control-button--ghost album-editor__remove"
            disabled={disabled}
            title="Remove from collage"
            aria-label={`Remove ${album.albumName} by ${album.artistName} from collage`}
            onClick={handleRemove}
          >
            <Trash2 size={16} aria-hidden="true" />
            Remove
          </button>
        </section>

        <section className="album-editor__search" aria-label="Replace album">
          <label className="control-field__label" htmlFor="album-search">
            Replace with Spotify album
          </label>
          <div className="album-editor__search-row">
            <Search className="album-editor__search-icon" size={16} aria-hidden="true" />
            <input
              id="album-search"
              className="album-editor__search-input"
              type="search"
              value={query}
              placeholder="Search albums…"
              disabled={disabled || !accessToken}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {!accessToken ? (
            <p className="album-editor__hint" role="status">
              Connect Spotify to search albums.
            </p>
          ) : null}
        </section>

        <div className="album-editor__results" aria-live="polite">
          {isSearching ? (
            <p className="album-editor__status">
              <LoaderCircle className="album-editor__spinner" size={16} aria-hidden="true" />
              Searching Spotify…
            </p>
          ) : null}

          {searchError ? (
            <p className="album-editor__error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              {searchError}
            </p>
          ) : null}

          {!isSearching && !searchError && hasSearched && results.length === 0 ? (
            <p className="album-editor__hint">No albums found. Try a different search.</p>
          ) : null}

          {!isSearching && results.length > 0 ? (
            <ul className="album-editor__results-list">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="album-editor__result"
                    disabled={disabled}
                    title={`Replace with ${result.name}`}
                    aria-label={`Replace with ${result.name} by ${result.artistName}${
                      result.releaseYear ? ` (${result.releaseYear})` : ''
                    }`}
                    onClick={() => handleSelectReplacement(result)}
                  >
                    <img
                      className="album-editor__result-cover"
                      src={result.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="album-editor__result-meta">
                      <span className="album-editor__result-name">{result.name}</span>
                      <span className="album-editor__result-artist">
                        {result.artistName}
                        {result.releaseYear ? ` · ${result.releaseYear}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </dialog>
  )
}
