import { useEffect, useState } from 'react'
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

export function useTopTracks(isConnected: boolean) {
  const [state, setState] = useState<TopTracksState>(initialState)

  useEffect(() => {
    if (!isConnected) {
      setState(initialState)
      return
    }

    let cancelled = false

    async function loadTopTracks() {
      setState({ status: 'loading', tracks: [], error: null })

      const accessToken = getValidAccessToken()

      if (!accessToken) {
        if (!cancelled) {
          setState({
            status: 'error',
            tracks: [],
            error: 'Spotify session expired. Log out and connect again.',
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
  }, [isConnected])

  return {
    ...state,
    isLoading: state.status === 'loading',
    isReady: state.status === 'success',
  }
}

export type { RankedSpotifyTrack }
