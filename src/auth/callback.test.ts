import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleOAuthCallback } from './callback'
import { getAuthErrorMessage } from './errors'
import { AUTH_STORAGE_KEYS } from './storage'
import * as token from './token'

vi.mock('./token', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./token')>()

  return {
    ...actual,
    exchangeAuthorizationCode: vi.fn(),
    isAuthenticated: vi.fn(),
  }
})

describe('handleOAuthCallback', () => {
  beforeEach(() => {
    vi.mocked(token.isAuthenticated).mockReturnValue(false)
    vi.mocked(token.exchangeAuthorizationCode).mockResolvedValue(undefined)
  })

  it('returns connected when already authenticated', async () => {
    vi.mocked(token.isAuthenticated).mockReturnValue(true)

    const result = await handleOAuthCallback(new URLSearchParams('code=unused&state=unused'))

    expect(result).toEqual({ status: 'connected' })
    expect(token.exchangeAuthorizationCode).not.toHaveBeenCalled()
  })

  it('returns an error when Spotify sends an error response', async () => {
    const result = await handleOAuthCallback(
      new URLSearchParams('error=access_denied&error_description=User%20denied'),
    )

    expect(result.status).toBe('error')
    expect(result.error).toContain('access_denied')
  })

  it('returns an error when the authorization code is missing', async () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.authState, 'stored-state')

    const result = await handleOAuthCallback(new URLSearchParams('state=stored-state'))

    expect(result).toEqual({
      status: 'error',
      error: getAuthErrorMessage('MISSING_CODE'),
    })
  })

  it('returns an error when OAuth state does not match', async () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.authState, 'stored-state')
    sessionStorage.setItem(AUTH_STORAGE_KEYS.codeVerifier, 'verifier')

    const result = await handleOAuthCallback(
      new URLSearchParams('code=auth-code&state=wrong-state'),
    )

    expect(result).toEqual({
      status: 'error',
      error: getAuthErrorMessage('STATE_MISMATCH'),
    })
  })

  it('returns an error when the PKCE verifier is missing', async () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.authState, 'stored-state')

    const result = await handleOAuthCallback(
      new URLSearchParams('code=auth-code&state=stored-state'),
    )

    expect(result).toEqual({
      status: 'error',
      error: getAuthErrorMessage('MISSING_CODE_VERIFIER'),
    })
  })

  it('exchanges a valid callback for a connected session', async () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.authState, 'stored-state')
    sessionStorage.setItem(AUTH_STORAGE_KEYS.codeVerifier, 'verifier')

    const result = await handleOAuthCallback(
      new URLSearchParams('code=auth-code&state=stored-state'),
    )

    expect(token.exchangeAuthorizationCode).toHaveBeenCalledWith('auth-code', 'verifier')
    expect(result).toEqual({ status: 'connected' })
  })
})
