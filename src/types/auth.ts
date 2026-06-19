export type AuthStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface AuthState {
  status: AuthStatus
  error?: string
}
