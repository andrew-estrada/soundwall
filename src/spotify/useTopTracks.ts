import { useCallback, useEffect, useState } from 'react'
import { getValidAccessToken } from '../auth'
import type { RankedSpotifyTrack, TopTracksState } from '../types'
import { SpotifyApiError } from './client'
import { fetchTopTracks } from './topTracks'

const initialState: TopTracksState = {
  status: 'idle',
  tracks: [],
  error: null,
}

function toTopTracksError(error: unknown): string {
  if (error instanceof SpotifyApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to fetch your top tracks from Spotify.'
}

export function useTopTracks(
  isConnected: boolean,
  onSessionInvalidated?: () => void,
) {
  const [state, setState] = useState<TopTracksState>(initialState)
  const [retryNonce, setRetryNonce] = useState(0)

  const retry = useCallback(() => {
    setRetryNonce((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!isConnected) {
      return
    }

    let cancelled = false

    async function loadTopTracks() {
      setState({ status: 'loading', tracks: [], error: null })

      const accessToken = getValidAccessToken()

      if (!accessToken) {
        onSessionInvalidated?.()

        if (!cancelled) {
          setState({
            status: 'error',
            tracks: [],
            error: 'Spotify session expired. Connect to Spotify again.',
          })
        }
        return
      }

      try {
        const tracks = await fetchTopTracks(accessToken)

        if (!cancelled) {
          setState({ status: 'success', tracks, error: null })
        }
      } catch (error) {
        if (error instanceof SpotifyApiError && error.status === 401) {
          onSessionInvalidated?.()
        }

        if (!cancelled) {
          setState({
            status: 'error',
            tracks: [],
            error: toTopTracksError(error),
          })
        }
      }
    }

    void loadTopTracks()

    return () => {
      cancelled = true
    }
  }, [isConnected, onSessionInvalidated, retryNonce])

  const activeState = isConnected ? state : initialState

  return {
    ...activeState,
    isLoading: activeState.status === 'loading',
    isReady: activeState.status === 'success',
    retry,
  }
}

export type { RankedSpotifyTrack }
