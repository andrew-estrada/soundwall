import { useCallback, useEffect, useMemo, useState } from 'react'
import { getValidAccessToken, useAuth } from './auth'
import {
  DEFAULT_COLLAGE_SETTINGS,
  applyAlbumReplacements,
  applyManualOrder,
  buildVisibleAlbums,
  getRemovedAlbumIds,
  hasSameSlotOrder,
  orderAlbums,
  removeSlotFromOrder,
  reorderSlots,
  scoreAlbumsFromTracks,
  slotsToAlbums,
  slotsToOrder,
  type CollageOrderSource,
} from './collage'
import {
  clearCollageSettings,
  loadCollageSettings,
  saveCollageSettings,
} from './settings'
import {
  AlbumEditorPanel,
  AppShell,
  AuthErrorBanner,
  CollagePreview,
  ConnectScreen,
  ConnectSpotifyButton,
  ControlPanel,
  Header,
  PrivacySection,
  RemovedAlbumsTray,
} from './components'
import { useTopTracks } from './spotify'
import type { AlbumCandidate, AlbumReplacements, CollageAlbumSlot, CollageSettings } from './types'

function App() {
  const {
    authState,
    connect,
    logout,
    invalidateSession,
    dismissError,
    isConnected,
    isConnecting,
  } = useAuth()
  const { tracks, isLoading, error: tracksError, retry: retryTracks } = useTopTracks(
    isConnected,
    invalidateSession,
  )
  const [settings, setSettings] = useState<CollageSettings>(loadCollageSettings)
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [removedAlbums, setRemovedAlbums] = useState<AlbumCandidate[]>([])
  const [albumReplacements, setAlbumReplacements] = useState<AlbumReplacements>({})
  const [selectedSlot, setSelectedSlot] = useState<CollageAlbumSlot | null>(null)
  const [orderSource, setOrderSource] = useState<CollageOrderSource>('pipeline')
  const [manualSlotOrder, setManualSlotOrder] = useState<string[]>([])

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
    setAlbumReplacements({})
    setSelectedSlot(null)
    setShuffleSeed(0)
    setOrderSource('pipeline')
    setManualSlotOrder([])
    logout()
  }, [logout])

  const handleReshuffle = useCallback(() => {
    setShuffleSeed((seed) => seed + 1)
    setOrderSource('pipeline')
    setManualSlotOrder([])
  }, [])

  useEffect(() => {
    setOrderSource('pipeline')
    setManualSlotOrder([])
  }, [settings.order])

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

  const rankedVisibleAlbums = useMemo(
    () =>
      buildVisibleAlbums(
        orderAlbums(availableAlbums, 'rank', 0),
        removedAlbumIds,
        displayLimit,
      ),
    [availableAlbums, removedAlbumIds, displayLimit],
  )

  const shuffledVisibleAlbums = useMemo(
    () =>
      buildVisibleAlbums(
        orderAlbums(availableAlbums, 'random', shuffleSeed),
        removedAlbumIds,
        displayLimit,
      ),
    [availableAlbums, removedAlbumIds, displayLimit, shuffleSeed],
  )

  const pipelineSlots = useMemo(
    () => applyAlbumReplacements(visibleAlbums, albumReplacements),
    [visibleAlbums, albumReplacements],
  )

  const rankedSlots = useMemo(
    () => applyAlbumReplacements(rankedVisibleAlbums, albumReplacements),
    [rankedVisibleAlbums, albumReplacements],
  )

  const shuffledSlots = useMemo(
    () => applyAlbumReplacements(shuffledVisibleAlbums, albumReplacements),
    [shuffledVisibleAlbums, albumReplacements],
  )

  const albumSlots = useMemo(() => {
    switch (orderSource) {
      case 'rank':
        return rankedSlots
      case 'shuffle':
        return shuffledSlots
      case 'manual':
        return applyManualOrder(pipelineSlots, manualSlotOrder)
      default:
        return pipelineSlots
    }
  }, [orderSource, pipelineSlots, rankedSlots, shuffledSlots, manualSlotOrder])

  const exportAlbums = useMemo(() => slotsToAlbums(albumSlots), [albumSlots])

  const showResetToRanked = !hasSameSlotOrder(albumSlots, rankedSlots)
  const showResetToShuffled =
    settings.order === 'random' && !hasSameSlotOrder(albumSlots, shuffledSlots)

  const handleResetToRanked = useCallback(() => {
    setOrderSource(settings.order === 'rank' ? 'pipeline' : 'rank')
    setManualSlotOrder([])
  }, [settings.order])

  const handleResetToShuffled = useCallback(() => {
    setOrderSource(settings.order === 'random' ? 'pipeline' : 'shuffle')
    setManualSlotOrder([])
  }, [settings.order])

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const reordered = reorderSlots(albumSlots, fromIndex, toIndex)
    setOrderSource('manual')
    setManualSlotOrder(slotsToOrder(reordered))
  }, [albumSlots])

  const removeAlbum = useCallback(
    (slot: CollageAlbumSlot) => {
      const original = orderedPool.find((album) => album.albumId === slot.slotAlbumId)

      if (original) {
        setRemovedAlbums((current) => {
          if (current.some((entry) => entry.albumId === slot.slotAlbumId)) {
            return current
          }

          return [...current, original]
        })
      }

      setAlbumReplacements((current) => {
        if (!(slot.slotAlbumId in current)) {
          return current
        }

        const next = { ...current }
        delete next[slot.slotAlbumId]
        return next
      })
      setManualSlotOrder((current) => removeSlotFromOrder(current, slot.slotAlbumId))
      setSelectedSlot(null)
    },
    [orderedPool],
  )

  const restoreAlbum = useCallback((albumId: string) => {
    setRemovedAlbums((current) => current.filter((album) => album.albumId !== albumId))
    setAlbumReplacements((current) => {
      if (!(albumId in current)) {
        return current
      }

      const next = { ...current }
      delete next[albumId]
      return next
    })
  }, [])

  const replaceAlbum = useCallback((slotAlbumId: string, replacement: AlbumCandidate) => {
    setAlbumReplacements((current) => ({
      ...current,
      [slotAlbumId]: replacement,
    }))
    setSelectedSlot(null)
  }, [])

  const controlsDisabled = isLoading || Boolean(tracksError)
  const accessToken = isConnected ? getValidAccessToken() : null

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
    <>
      {authState.status === 'error' && authState.error ? (
        <AuthErrorBanner message={authState.error} onDismiss={dismissError} />
      ) : null}

      <AppShell
        header={<Header isConnected={isConnected} />}
        connectAction={
          <ConnectSpotifyButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={() => void connect()}
          />
        }
        preview={
          <CollagePreview
            settings={settings}
            albumSlots={albumSlots}
            isConnected={isConnected}
            isLoadingTracks={isLoading}
            tracksError={tracksError}
            trackCount={tracks.length}
            availableAlbumCount={availableAlbums.length}
            disabled={controlsDisabled}
            onSelectAlbum={setSelectedSlot}
            onReorder={handleReorder}
            onRetry={retryTracks}
            onReconnect={() => void connect()}
          />
        }
        controls={
          <div className="app-shell__controls-stack">
            <ControlPanel
              settings={settings}
              onSettingsChange={setSettings}
              visibleAlbums={exportAlbums}
              availableAlbumCount={availableAlbums.length}
              isConnected={isConnected}
              disabled={controlsDisabled}
              onReshuffle={handleReshuffle}
              showResetToRanked={showResetToRanked}
              showResetToShuffled={showResetToShuffled}
              onResetToRanked={handleResetToRanked}
              onResetToShuffled={handleResetToShuffled}
              onLogout={handleLogout}
              onResetSettings={resetSettings}
              onRetryTracks={retryTracks}
              tracksError={tracksError}
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

      <AlbumEditorPanel
        slot={selectedSlot}
        accessToken={accessToken}
        disabled={controlsDisabled}
        onClose={() => setSelectedSlot(null)}
        onRemove={removeAlbum}
        onReplace={replaceAlbum}
      />
    </>
  )
}

export default App
