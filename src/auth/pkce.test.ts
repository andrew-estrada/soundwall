import { describe, expect, it } from 'vitest'
import { generateCodeChallenge, generateRandomString } from './pkce'

describe('pkce', () => {
  it('generates strings with the requested length', () => {
    expect(generateRandomString(32)).toHaveLength(32)
    expect(generateRandomString(64)).toHaveLength(64)
  })

  it('uses only PKCE-safe characters', () => {
    const value = generateRandomString(128)
    expect(value).toMatch(/^[A-Za-z0-9\-._~]+$/)
  })

  it('generates a stable URL-safe S256 challenge for a verifier', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1JFdJdG9s0'
    const first = await generateCodeChallenge(verifier)
    const second = await generateCodeChallenge(verifier)

    expect(first).toBe(second)
    expect(first).toMatch(/^[A-Za-z0-9\-._~]+$/)
    expect(first).not.toContain('=')
  })
})
