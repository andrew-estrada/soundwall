export interface BackgroundPreset {
  id: string
  label: string
  color: string
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'black', label: 'Black', color: '#000000' },
  { id: 'off-black', label: 'Off-black', color: '#121212' },
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'warm-cream', label: 'Warm cream', color: '#F5F0E6' },
  { id: 'dark-navy', label: 'Dark navy', color: '#0F172A' },
  { id: 'charcoal', label: 'Charcoal', color: '#2E2E2E' },
]

export function normalizeHexColor(hex: string): string {
  const normalized = hex.trim().toLowerCase()

  if (/^#[0-9a-f]{3}$/.test(normalized)) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
  }

  return normalized
}

export function colorsMatch(left: string, right: string): boolean {
  return normalizeHexColor(left) === normalizeHexColor(right)
}

export function findBackgroundPreset(color: string): BackgroundPreset | undefined {
  return BACKGROUND_PRESETS.find((preset) => colorsMatch(preset.color, color))
}
