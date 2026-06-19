export const AUTH_STORAGE_KEYS = {
  codeVerifier: 'soundwall:code_verifier',
  authState: 'soundwall:auth_state',
  accessToken: 'soundwall:access_token',
  tokenExpiry: 'soundwall:token_expiry',
  authError: 'soundwall:auth_error',
} as const

export function setSessionItem(key: string, value: string): void {
  sessionStorage.setItem(key, value)
}

export function getSessionItem(key: string): string | null {
  return sessionStorage.getItem(key)
}

export function removeSessionItem(key: string): void {
  sessionStorage.removeItem(key)
}

export function clearPkceSession(): void {
  removeSessionItem(AUTH_STORAGE_KEYS.codeVerifier)
  removeSessionItem(AUTH_STORAGE_KEYS.authState)
}

export function clearTokenSession(): void {
  removeSessionItem(AUTH_STORAGE_KEYS.accessToken)
  removeSessionItem(AUTH_STORAGE_KEYS.tokenExpiry)
}

export function clearAuthSession(): void {
  clearPkceSession()
  clearTokenSession()
  removeSessionItem(AUTH_STORAGE_KEYS.authError)
}

export function setFlashAuthError(message: string): void {
  setSessionItem(AUTH_STORAGE_KEYS.authError, message)
}

export function consumeFlashAuthError(): string | null {
  const message = getSessionItem(AUTH_STORAGE_KEYS.authError)
  if (message) {
    removeSessionItem(AUTH_STORAGE_KEYS.authError)
  }
  return message
}

export function storeAccessToken(accessToken: string, expiresInSeconds: number): void {
  const expiresAt = Date.now() + expiresInSeconds * 1000
  setSessionItem(AUTH_STORAGE_KEYS.accessToken, accessToken)
  setSessionItem(AUTH_STORAGE_KEYS.tokenExpiry, String(expiresAt))
}
