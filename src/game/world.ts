import { Container, Graphics, Text } from 'pixi.js'
import { DOORS, MAP_H, MAP_W, ROOM_RECTS, TILE } from './layout'
import { px } from './pixels'

const WALL_TOP = 0x78918a
const WALL_FACE = 0xf0eddd
const WALL_TRIM = 0x658079
const DOOR_FLOOR = 0xdadccd


function windowAt(g: Graphics, x: number, y: number) {
  px(g, x, y, 28, 12, WALL_TRIM)
  px(g, x + 1, y + 1, 26, 10, 0xc0e5e3)
  px(g, x + 2, y + 2, 24, 3, 0xdff3e9)
  px(g, x + 2, y + 8, 24, 3, 0x96bba3)
  px(g, x + 3, y + 6, 7, 4, 0xabcbb1)
  px(g, x + 16, y + 5, 7, 5, 0x87b49a)
  px(g, x + 13, y + 1, 1, 10, WALL_TRIM)
  px(g, x - 1, y + 12, 30, 2, 0xc2cbbd)
}

function wallClock(g: Graphics, x: number, y: number) {
  px(g, x + 1, y, 6, 8, 0x3b3348)
  px(g, x, y + 1, 8, 6, 0x3b3348)
  px(g, x + 1, y + 1, 6, 6, 0xfafafa)
  px(g, x + 4, y + 2, 1, 3, 0x222222)
  px(g, x + 4, y + 4, 2, 1, 0x222222)
}

function boardAt(g: Graphics, x: number, y: number, w: number, notes: boolean) {
  px(g, x, y, w, 11, 0x9aa0a8)
  px(g, x + 1, y + 1, w - 2, 9, 0xffffff)
  if (notes) {
    const cols = [0xf1d99a, 0x8ce99a, 0x74c0fc, 0xffa8a8]
    for (let i = 0; i < Math.floor((w - 4) / 5); i++) px(g, x + 2 + i * 5, y + 2 + (i % 2) * 4, 4, 3, cols[i % cols.length])
  } else {
    px(g, x + 3, y + 3, w - 10, 1, 0x4c6ef5)
    px(g, x + 3, y + 5, w - 14, 1, 0xe03131)
    px(g, x + 3, y + 7, w - 8, 1, 0x2f9e44)
  }
}

function plant(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x + 1, y + 14, 18, 3, 0x314e41, 0.16)
  px(g, x + 6, y + 5, 10, 10, 0xdfceab)
  px(g, x + 7, y + 7, 8, 8, 0xf4e7cc)
  px(g, x + 7, y + 5, 8, 2, 0x8d7556)
  px(g, x + 10, y - 10, 2, 16, 0x486c46)
  px(g, x + 2, y - 6, 8, 5, 0x40775a)
  px(g, x, y - 9, 6, 5, 0x548c62)
  px(g, x + 12, y - 13, 7, 7, 0x6a9b68)
  px(g, x + 10, y - 16, 5, 7, 0x86b27a)
  px(g, x + 12, y - 3, 9, 5, 0x3f795b)
  px(g, x + 16, y - 5, 6, 5, 0x6f9f67)
  px(g, x + 4, y, 6, 4, 0x73a16b)
  g.zIndex = y + 16
  return g
}

function bookshelf(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x, y - 10, 30, 26, 0x6e4628)
  px(g, x + 1, y - 9, 28, 24, 0x4a2e1a)
  const colors = [0xe03131, 0x1c7ed6, 0xf59f00, 0x37b24d, 0x9c36b5, 0xf8f9fa]
  for (let shelf = 0; shelf < 3; shelf++) {
    const sy = y - 8 + shelf * 8
    px(g, x + 1, sy + 6, 28, 2, 0x6e4628)
    for (let b = 0; b < 9; b++) {
      const h = 4 + ((b * 7 + shelf * 3) % 3)
      px(g, x + 2 + b * 3, sy + 6 - h, 2, h, colors[(b + shelf * 2) % colors.length])
    }
  }
  g.zIndex = y + 16
  return g
}

function waterCooler(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x + 3, y - 4, 10, 8, 0x74c0fc, 0.85)
  px(g, x + 4, y - 3, 3, 5, 0xd0ebff)
  px(g, x + 2, y + 4, 12, 12, 0xe9ecef)
  px(g, x + 2, y + 15, 12, 1, 0xadb5bd)
  px(g, x + 5, y + 7, 2, 2, 0x1c7ed6)
  px(g, x + 9, y + 7, 2, 2, 0xe03131)
  g.zIndex = y + 16
  return g
}

function printer(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x, y + 2, 20, 12, 0xced4da)
  px(g, x, y + 2, 20, 2, 0xf1f3f5)
  px(g, x + 4, y - 2, 12, 5, 0xffffff)
  px(g, x + 3, y + 8, 14, 2, 0x495057)
  px(g, x + 16, y + 5, 2, 1, 0x51cf66)
  px(g, x + 1, y + 14, 18, 2, 0x868e96)
  g.zIndex = y + 16
  return g
}

function coffeeMachine(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x, y + 4, 30, 12, 0x8a5a34)
  px(g, x, y + 4, 30, 2, 0xb07a4c)
  px(g, x + 3, y - 8, 12, 14, 0x343a40)
  px(g, x + 5, y - 6, 8, 3, 0xff922b)
  px(g, x + 7, y + 1, 4, 4, 0xf8f9fa)
  px(g, x + 20, y + 1, 4, 3, 0xf8f9fa)
  px(g, x + 25, y + 1, 3, 3, 0xffd8a8)
  g.zIndex = y + 16
  return g
}

function sofa(x: number, y: number): Graphics {
  const g = new Graphics()
  const c = 0xb36c4f
  px(g, x, y, 64, 8, 0x8f5645)
  px(g, x - 3, y + 4, 4, 14, c)
  px(g, x + 63, y + 4, 4, 14, c)
  px(g, x, y + 8, 64, 10, c)
  px(g, x + 1, y + 8, 30, 1, 0xd79c76)
  px(g, x + 33, y + 8, 30, 1, 0xd79c76)
  px(g, x + 31, y + 8, 2, 10, 0x8f5645)
  px(g, x + 6, y + 2, 10, 6, 0xf1d99a)
  g.zIndex = y + 18
  return g
}

function coffeeTable(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x, y, 40, 10, 0x6e4628)
  px(g, x, y, 40, 1, 0x9c6b43)
  px(g, x + 2, y + 10, 3, 4, 0x4a2e1a)
  px(g, x + 35, y + 10, 3, 4, 0x4a2e1a)
  px(g, x + 8, y + 3, 4, 4, 0xf8f9fa)
  px(g, x + 20, y + 2, 12, 6, 0x4dabf7)
  px(g, x + 21, y + 3, 10, 1, 0xe7f5ff)
  g.zIndex = y + 14
  return g
}

function arcade(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x, y - 12, 16, 28, 0x5f3dc4)
  px(g, x + 2, y - 9, 12, 9, 0x111111)
  px(g, x + 3, y - 8, 10, 7, 0x20c997)
  px(g, x + 5, y - 6, 2, 2, 0xffd43b)
  px(g, x + 2, y + 2, 12, 4, 0x343a40)
  px(g, x + 4, y + 3, 2, 2, 0xff6b6b)
  px(g, x + 9, y + 3, 2, 2, 0x74c0fc)
  g.zIndex = y + 16
  return g
}

function meetingTable(x: number, y: number): Graphics {
  const g = new Graphics()
  for (const cx of [x + 8, x + 43]) {
    px(g, cx, y - 9, 16, 12, 0x537d71)
    px(g, cx + 2, y - 8, 12, 2, 0x7d9e87)
    px(g, cx, y + 24, 16, 10, 0x537d71)
    px(g, cx + 2, y + 31, 12, 2, 0x3d6059)
  }
  px(g, x + 3, y + 6, 66, 24, 0x284b40, 0.15)
  px(g, x + 3, y, 62, 25, 0xa67e55)
  px(g, x, y + 3, 68, 18, 0xe1c69d)
  px(g, x + 3, y, 62, 21, 0xe1c69d)
  px(g, x + 3, y, 62, 2, 0xf6dfb6)
  for (const cx of [x + 10, x + 45]) {
    px(g, cx, y + 4, 12, 8, 0x365562)
    px(g, cx + 1, y + 5, 10, 6, 0x77b4b5)
    px(g, cx - 1, y + 12, 14, 2, 0xeaf0e5)
  }
  px(g, x + 31, y + 8, 5, 6, 0xf6eed6)
  px(g, x + 31, y + 5, 5, 5, 0x6d9968)
  px(g, x + 24, y + 17, 5, 3, 0xf4cf7c)
  px(g, x + 33, y + 18, 5, 3, 0xd48c89)
  g.zIndex = y + 34
  return g
}

function ideaBoard(x: number, y: number): Graphics {
  const g = new Graphics()
  px(g, x + 4, y + 17, 2, 12, 0x6c827b)
  px(g, x + 32, y + 17, 2, 12, 0x6c827b)
  px(g, x, y - 5, 40, 27, 0x81988a)
  px(g, x + 2, y - 3, 36, 23, 0xf6f4e5)
  for (let col = 0; col < 3; col++) {
    px(g, x + 5 + col * 11, y, 8, 2, 0x81988a)
    for (let row = 0; row < 2; row++) px(g, x + 5 + col * 11, y + 5 + row * 7, 7, 5, [0xe9c571, 0x99c7af, 0xdb9e99][col])
  }
  px(g, x - 1, y + 28, 10, 2, 0x6c827b)
  px(g, x + 29, y + 28, 10, 2, 0x6c827b)
  g.zIndex = y + 30
  return g
}

function sign(text: string, x: number, y: number, accent: number): Container {
  const c = new Container()
  const t = new Text({
    text,
    style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 7, fontWeight: '700', fill: 0xffffff, letterSpacing: 0.5 },
    resolution: 8,
  })
  const w = Math.ceil(t.width) + 8
  const g = new Graphics()
  px(g, 0, 0, w, 11, 0x294a42)
  px(g, 1, 1, w - 2, 9, 0x36574d)
  px(g, 1, 9, w - 2, 1, accent)
  t.position.set(4, 1.5)
  c.addChild(g, t)
  c.position.set(Math.round(x - w / 2), y)
  return c
}

export function buildWorld(roomNames: Record<string, { name: string; accent: number }>) {
  const ground = new Container()
  const g = new Graphics()
  px(g, 0, 0, MAP_W, MAP_H, WALL_TOP)
  // subtle wall-top texture
  for (let i = 0; i < MAP_W; i += 8) px(g, i, 0, 4, 2, 0x8ba298)

  for (const r of ROOM_RECTS) {
    const x0 = r.x * TILE
    const y0 = (r.y + 1) * TILE
    const w = r.w * TILE
    const h = (r.h - 1) * TILE
    if (r.pattern === 'checker') {
      for (let ty = 0; ty < r.h - 1; ty++)
        for (let tx = 0; tx < r.w; tx++) px(g, x0 + tx * TILE, y0 + ty * TILE, TILE, TILE, (tx + ty) % 2 ? r.floorA : r.floorB)
    } else {
      px(g, x0, y0, w, h, r.floorA)
      for (let ty = 0; ty < h; ty += 6) {
        px(g, x0, y0 + ty, w, 1, 0xc3a47e)
        const off = (ty / 6) % 2 ? 0 : 24
        for (let tx = off; tx < w; tx += 48) px(g, x0 + tx, y0 + ty, 1, 6, 0xc3a47e)
        px(g, x0, y0 + ty + 2, w, 1, r.floorB)
      }
    }
    // wall face row
    const wy = r.y * TILE
    px(g, x0, wy, w, TILE, WALL_FACE)
    px(g, x0, wy, w, 2, 0xf3e8d6)
    px(g, x0, wy + TILE - 2, w, 2, WALL_TRIM)
    // shadow on floor under wall
    px(g, x0, y0, w, 2, 0x000000, 0.18)
  }
  // doors
  for (const d of DOORS) {
    px(g, d.x * TILE, d.y * TILE, d.w * TILE, d.h * TILE, DOOR_FLOOR)
    px(g, d.x * TILE, d.y * TILE, d.w * TILE, 1, 0x6d5f4f)
  }
  // Glass partitions keep the teams connected across the campus.
  for (const [y, h] of [[32, 64], [128, 64], [224, 64], [320, 48]]) {
    px(g, 321, y, 14, h, 0xb6d3c9)
    px(g, 323, y, 2, h, 0xe2eee0)
    px(g, 331, y, 2, h, 0x88aaa1)
    for (let sy = y + 12; sy < y + h; sy += 24) px(g, 325, sy, 5, 2, 0xdce9d9)
  }
  px(g, 16, 194, 608, 12, 0xdadccd)
  for (let x = 32; x < 624; x += 32) px(g, x, 199, 8, 1, 0xb4bfb1)
  // Soft daylight on the floor under the windows.
  for (const x of [32, 80, 352, 400]) {
    px(g, x, 34, 28, 12, 0xfff7d2, 0.18)
    px(g, x + 4, 46, 28, 5, 0xfff7d2, 0.1)
  }
  ground.addChild(g)

  // wall decorations
  const wall = new Graphics()
  windowAt(wall, 2 * TILE, 1 * TILE + 2)
  windowAt(wall, 5 * TILE, 1 * TILE + 2)
  boardAt(wall, 13 * TILE, 1 * TILE + 2, 30, false)
  wallClock(wall, 11 * TILE + 4, 1 * TILE + 4)
  windowAt(wall, 22 * TILE, 1 * TILE + 2)
  windowAt(wall, 25 * TILE, 1 * TILE + 2)
  boardAt(wall, 32 * TILE, 1 * TILE + 2, 28, true)
  boardAt(wall, 2 * TILE, 13 * TILE + 2, 40, true)
  windowAt(wall, 14 * TILE, 13 * TILE + 2)
  windowAt(wall, 17 * TILE, 13 * TILE + 2)
  windowAt(wall, 23 * TILE, 13 * TILE + 2)
  windowAt(wall, 26 * TILE, 13 * TILE + 2)
  wallClock(wall, 35 * TILE + 4, 13 * TILE + 4)
  ground.addChild(wall)

  // rug in lounge
  const rug = new Graphics()
  px(rug, 23 * TILE, 15 * TILE + 8, 6 * TILE, 4 * TILE, 0x76988e)
  px(rug, 23 * TILE + 3, 15 * TILE + 11, 6 * TILE - 6, 4 * TILE - 6, 0xa6c0ae)
  px(rug, 23 * TILE + 6, 15 * TILE + 14, 6 * TILE - 12, 4 * TILE - 12, 0x76988e)
  ground.addChild(rug)

  // room signs on the wall face
  const signs: [string, number, number][] = [
    ['exec', 9 * TILE + 8, 1 * TILE + 2],
    ['cps', 29 * TILE + 8, 1 * TILE + 2],
    ['growth', 8 * TILE, 13 * TILE + 2],
  ]
  for (const [id, x, y] of signs) {
    const info = roomNames[id]
    if (info) ground.addChild(sign(info.name, x, y, info.accent))
  }
  ground.addChild(sign('COFFEE & COLLAB', 31 * TILE, 13 * TILE + 2, 0xffa94d))

  const props: Graphics[] = [
    bookshelf(17 * TILE, 2 * TILE + 10),
    plant(1 * TILE, 10 * TILE),
    plant(7 * TILE, 3 * TILE),
    plant(19 * TILE, 10 * TILE),
    bookshelf(36 * TILE + 8, 2 * TILE + 10),
    plant(21 * TILE, 10 * TILE),
    plant(38 * TILE, 10 * TILE),
    waterCooler(33 * TILE, 10 * TILE),
    printer(15 * TILE, 15 * TILE),
    ideaBoard(16 * TILE, 18 * TILE),
    plant(18 * TILE, 15 * TILE),
    plant(1 * TILE, 21 * TILE),
    plant(19 * TILE, 21 * TILE),
    sofa(23 * TILE, 15 * TILE + 4),
    coffeeTable(24 * TILE + 4, 18 * TILE),
    coffeeMachine(34 * TILE, 14 * TILE + 8),
    meetingTable(32 * TILE, 19 * TILE),
    arcade(31 * TILE, 15 * TILE),
    waterCooler(37 * TILE, 15 * TILE),
    plant(21 * TILE, 21 * TILE),
    plant(38 * TILE, 21 * TILE),
  ]
  return { ground, props }
}
