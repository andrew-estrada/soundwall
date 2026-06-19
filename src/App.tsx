import { useMemo, useState } from 'react'
import { useAuth } from './auth'
import { DEFAULT_COLLAGE_SETTINGS, orderAlbums, scoreAlbumsFromTracks } from './collage'
import {
  AppShell,
  AuthErrorBanner,
  CollagePreview,
  ConnectSpotifyButton,
  ControlPanel,
  Header,
  PrivacySection,
} from './components'
import { useTopTracks } from './spotify'
import type { CollageSettings } from './types'

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
  const [settings, setSettings] = useState<CollageSettings>(DEFAULT_COLLAGE_SETTINGS)

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

  const albums = useMemo(
    () => availableAlbums.slice(0, settings.gridCols * settings.gridRows),
    [availableAlbums, settings.gridCols, settings.gridRows],
  )

  const orderedAlbums = useMemo(
    () => orderAlbums(albums, settings.order, settings.shuffleSeed),
    [albums, settings.order, settings.shuffleSeed],
  )

  const controlsDisabled = !isConnected || isLoading || Boolean(tracksError)

  return (
    <>
      {authState.status === 'error' && authState.error ? (
        <AuthErrorBanner message={authState.error} onDismiss={dismissError} />
      ) : null}

      <AppShell
        header={<Header />}
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
            albums={orderedAlbums}
            isConnected={isConnected}
            isLoadingTracks={isLoading}
            tracksError={tracksError}
            trackCount={tracks.length}
            availableAlbumCount={availableAlbums.length}
            onRetry={retryTracks}
            onReconnect={() => void connect()}
          />
        }
        controls={
          <ControlPanel
            settings={settings}
            onSettingsChange={setSettings}
            orderedAlbums={orderedAlbums}
            availableAlbumCount={availableAlbums.length}
            isConnected={isConnected}
            disabled={controlsDisabled}
            onLogout={logout}
            onRetryTracks={retryTracks}
            tracksError={tracksError}
          />
        }
        footer={<PrivacySection />}
      />
    </>
  )
}

export default App
