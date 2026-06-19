import { describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEYS, storeAccessToken } from './storage'
import { getAccessToken, isAuthenticated } from './token'

describe('token session', () => {
  it('returns the stored access token while it is still valid', () => {
    storeAccessToken('valid-token', 3600)

    expect(getAccessToken()).toBe('valid-token')
    expect(isAuthenticated()).toBe(true)
  })

  it('clears expired tokens and returns null', () => {
    storeAccessToken('expired-token', -60)

    expect(getAccessToken()).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.tokenExpiry)).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('returns null when token data is incomplete', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.accessToken, 'token-without-expiry')

    expect(getAccessToken()).toBeNull()
  })
})
