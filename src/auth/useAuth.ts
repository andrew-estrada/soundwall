import { useCallback, useState } from 'react'
import type { AuthState } from '../types'
import { connectSpotify } from './connect'
import { toAuthErrorMessage } from './errors'
import { disconnectSpotify, readAuthState } from './session'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => readAuthState())

  const connect = useCallback(async () => {
    setAuthState({ status: 'connecting' })

    try {
      await connectSpotify()
    } catch (error) {
      setAuthState({
        status: 'error',
        error: toAuthErrorMessage(error),
      })
    }
  }, [])

  const logout = useCallback(() => {
    disconnectSpotify()
    setAuthState({ status: 'disconnected' })
  }, [])

  const dismissError = useCallback(() => {
    setAuthState((current) =>
      current.status === 'error' ? { status: 'disconnected' } : current,
    )
  }, [])

  return {
    authState,
    connect,
    logout,
    dismissError,
    isConnected: authState.status === 'connected',
    isConnecting: authState.status === 'connecting',
  }
}
