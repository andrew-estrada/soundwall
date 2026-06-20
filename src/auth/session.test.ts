import { describe, expect, it } from 'vitest'
import { readAuthState } from './session'
import { setFlashAuthError, storeAccessToken } from './storage'

describe('readAuthState', () => {
  it('returns connected when a valid token exists', () => {
    storeAccessToken('valid-token', 3600)

    expect(readAuthState()).toEqual({ status: 'connected' })
  })

  it('prefers a valid token over a flash auth error', () => {
    storeAccessToken('valid-token', 3600)
    setFlashAuthError('Stale callback error')

    expect(readAuthState()).toEqual({ status: 'connected' })
    expect(sessionStorage.getItem('soundwall:auth_error')).toBeNull()
  })

  it('returns a flash auth error when disconnected', () => {
    setFlashAuthError('Login failed')

    expect(readAuthState()).toEqual({ status: 'error', error: 'Login failed' })
  })

  it('returns disconnected when there is no token or flash error', () => {
    expect(readAuthState()).toEqual({ status: 'disconnected' })
  })
})
