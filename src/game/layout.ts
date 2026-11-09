// World is laid out on a 16px tile grid. All drawing uses whole pixels.
export const TILE = 16
export const COLS = 40
export const ROWS = 24
export const MAP_W = COLS * TILE
export const MAP_H = ROWS * TILE

export interface RoomRect {
  id: string
  x: number // tiles (includes the wall-face row at y)
  y: number
  w: number
  h: number
  floorA: number
  floorB: number
  pattern: 'checker' | 'planks'
}

export const ROOM_RECTS: RoomRect[] = [
  { id: 'exec', x: 1, y: 1, w: 19, h: 11, floorA: 0x4b4f7a, floorB: 0x545a8a, pattern: 'checker' },
  { id: 'cps', x: 21, y: 1, w: 18, h: 11, floorA: 0x6b4f6e, floorB: 0x765979, pattern: 'checker' },
  { id: 'growth', x: 1, y: 13, w: 19, h: 10, floorA: 0x3f6b5a, floorB: 0x477764, pattern: 'checker' },
  { id: 'lounge', x: 21, y: 13, w: 18, h: 10, floorA: 0x9c6b43, floorB: 0xa8774d, pattern: 'planks' },
]

// Door openings (tile rects) cut through walls.
export const DOORS = [
  { x: 20, y: 6, w: 1, h: 2 },
  { x: 20, y: 18, w: 1, h: 2 },
  { x: 9, y: 12, w: 2, h: 2 },
  { x: 29, y: 12, w: 2, h: 2 },
]

/** Desk slot i inside a room: 3 columns x 2 rows. Returns desk top-left in px. */
export function deskSlot(roomId: string, i: number): { x: number; y: number } {
  const r = ROOM_RECTS.find((rr) => rr.id === roomId) ?? ROOM_RECTS[0]
  const col = i % 3
  const row = Math.floor(i / 3)
  return { x: (r.x + 2 + col * 6) * TILE, y: (r.y + 4 + row * 4) * TILE }
}
