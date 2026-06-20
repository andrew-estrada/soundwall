import type { CollageAlbumSlot } from '../types'

export type CollageOrderSource = 'pipeline' | 'rank' | 'shuffle' | 'manual'

export function reorderSlots(
  slots: CollageAlbumSlot[],
  fromIndex: number,
  toIndex: number,
): CollageAlbumSlot[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= slots.length ||
    toIndex >= slots.length
  ) {
    return slots
  }

  const result = [...slots]
  const [moved] = result.splice(fromIndex, 1)

  if (!moved) {
    return slots
  }

  result.splice(toIndex, 0, moved)
  return result
}

export function slotsToOrder(slots: CollageAlbumSlot[]): string[] {
  return slots.map((slot) => slot.slotAlbumId)
}

export function applyManualOrder(
  slots: CollageAlbumSlot[],
  order: string[],
): CollageAlbumSlot[] {
  if (order.length === 0) {
    return slots
  }

  const byId = new Map(slots.map((slot) => [slot.slotAlbumId, slot]))
  const ordered: CollageAlbumSlot[] = []

  for (const slotAlbumId of order) {
    const slot = byId.get(slotAlbumId)

    if (slot) {
      ordered.push(slot)
      byId.delete(slotAlbumId)
    }
  }

  for (const slot of slots) {
    if (byId.has(slot.slotAlbumId)) {
      ordered.push(slot)
    }
  }

  return ordered
}

export function removeSlotFromOrder(order: string[], slotAlbumId: string): string[] {
  return order.filter((id) => id !== slotAlbumId)
}

export function hasSameSlotOrder(left: CollageAlbumSlot[], right: CollageAlbumSlot[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  return left.every((slot, index) => slot.slotAlbumId === right[index]?.slotAlbumId)
}
