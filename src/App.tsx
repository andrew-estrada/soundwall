import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './auth'
import {
  DEFAULT_COLLAGE_SETTINGS,
  buildVisibleAlbums,
  getRemovedAlbumIds,
  orderAlbums,
  scoreAlbumsFromTracks,
} from './collage'
import {
  clearCollageSettings,
  loadCollageSettings,
  saveCollageSettings,
} from './settings'
import {
  AppShell,
  CollagePreview,
  ConnectScreen,
  ControlPanel,
  Header,
  PrivacySection,
  RemovedAlbumsTray,
} from './components'
import { useTopTracks } from './spotify'
import type { AlbumCandidate, CollageSettings } from './types'

function App() {
  const { authState, connect, logout, dismissError, isConnected, isConnecting } = useAuth()
  const { tracks, isLoading, error: tracksError } = useTopTracks(isConnected)
  const [settings, setSettings] = useState<CollageSettings>(loadCollageSettings)
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [removedAlbums, setRemovedAlbums] = useState<AlbumCandidate[]>([])

  useEffect(() => {
    saveCollageSettings(settings)
  }, [settings])

  function resetSettings() {
    clearCollageSettings()
    setSettings({ ...DEFAULT_COLLAGE_SETTINGS })
    setShuffleSeed(0)
  }

  const handleLogout = useCallback(() => {
    setRemovedAlbums([])
    setShuffleSeed(0)
    logout()
  }, [logout])

  const handleReshuffle = useCallback(() => {
    setShuffleSeed((seed) => seed + 1)
  }, [])

  const scoreOptions = useMemo(
    () => ({
      gridCols: settings.gridCols,
      gridRows: settings.gridRows,
      oneAlbumPerArtist: settings.oneAlbumPerArtist,
    }),
    [settings.gridCols, settings.gridRows, settings.oneAlbumPerArtist],
  )

  const availableAlbums = useMemo(
    () => scoreAlbumsFromTracks(tracks, { ...scoreOptions, returnAll: true }),
    [tracks, scoreOptions],
  )

  const orderedPool = useMemo(
    () => orderAlbums(availableAlbums, settings.order, shuffleSeed),
    [availableAlbums, settings.order, shuffleSeed],
  )

  const removedAlbumIds = useMemo(() => getRemovedAlbumIds(removedAlbums), [removedAlbums])

  const displayLimit = Math.min(
    settings.albumCount,
    settings.gridCols * settings.gridRows,
  )

  const visibleAlbums = useMemo(
    () => buildVisibleAlbums(orderedPool, removedAlbumIds, displayLimit),
    [orderedPool, removedAlbumIds, displayLimit],
  )

  const removeAlbum = useCallback((album: AlbumCandidate) => {
    setRemovedAlbums((current) => {
      if (current.some((entry) => entry.albumId === album.albumId)) {
        return current
      }

      return [...current, album]
    })
  }, [])

  const restoreAlbum = useCallback((albumId: string) => {
    setRemovedAlbums((current) => current.filter((album) => album.albumId !== albumId))
  }, [])

  const controlsDisabled = isLoading || Boolean(tracksError)

  if (!isConnected) {
    return (
      <ConnectScreen
        onConnect={() => void connect()}
        isConnecting={isConnecting}
        authError={authState.status === 'error' ? authState.error : null}
        onDismissError={dismissError}
      />
    )
  }

  return (
    <AppShell
      header={<Header isConnected={isConnected} />}
      preview={
        <CollagePreview
          settings={settings}
          albums={visibleAlbums}
          isConnected={isConnected}
          isLoadingTracks={isLoading}
          tracksError={tracksError}
          disabled={controlsDisabled}
          onRemoveAlbum={removeAlbum}
        />
      }
      controls={
        <div className="app-shell__controls-stack">
          <ControlPanel
            settings={settings}
            onSettingsChange={setSettings}
            visibleAlbums={visibleAlbums}
            availableAlbumCount={availableAlbums.length}
            isConnected={isConnected}
            disabled={controlsDisabled}
            onReshuffle={handleReshuffle}
            onLogout={handleLogout}
            onResetSettings={resetSettings}
          />
          <RemovedAlbumsTray
            albums={removedAlbums}
            disabled={controlsDisabled}
            onRestoreAlbum={restoreAlbum}
          />
        </div>
      }
      footer={<PrivacySection />}
    />
  )
}

export default App
