import { beforeEach, vi } from 'vitest'

const storage = new Map<string, string>()

const sessionStorageMock: Storage = {
  get length() {
    return storage.size
  },
  key(index: number) {
    return [...storage.keys()][index] ?? null
  },
  getItem(key: string) {
    return storage.get(key) ?? null
  },
  setItem(key: string, value: string) {
    storage.set(key, value)
  },
  removeItem(key: string) {
    storage.delete(key)
  },
  clear() {
    storage.clear()
  },
}

vi.stubGlobal('sessionStorage', sessionStorageMock)

beforeEach(() => {
  storage.clear()
})
