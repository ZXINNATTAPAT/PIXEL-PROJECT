import { Container, Graphics } from 'pixi.js'
import { hex, shade, type Look, type Status } from '../model'
import { drawMatrix, px, type Palette } from './pixels'

// 10 x 13 character, origin at the feet (bottom-centre).
export const CHAR_W = 10
export const CHAR_H = 13

const BASE = [
  '...HHHH...',
  '..HHHHHH..',
  '..HSSSSH..',
  '..SESSES..',
  '..bSSSSb..',
  '...SSSS...',
  '..CCCCCC..',
  '.CCCCCCCC.',
  '.CCDCCDCC.',
  '.SCCCCCCS.',
  '..PPPPPP..',
  '..PP..PP..',
  '..KK..KK..',
]
// typing frame: hands alternate
const TYPE = BASE.map((r, i) => (i === 8 ? '.SCDCCDCC.' : i === 9 ? '.CCCCCCCS.' : r))
// walking frame: legs apart
const WALK = BASE.map((r, i) => (i === 11 ? '.PP....PP.' : i === 12 ? '.KK....KK.' : r))

const ACCESSORY: Record<string, string[]> = {
  crown: ['..Y.YY.Y..', '..YYYYYY..'],
  horns: ['..R....R..', '..RR..RR..'],
  cap: ['..........', '..AAAAAA..', '..AAAAAAAA'],
  bow: ['......WW..', '.....WWW..'],
}

export type FrameName = 'base' | 'type' | 'walk'

export function buildCharacterFrames(look: Look, accent: number): Record<FrameName, Graphics> {
  const pal: Palette = {
    H: hex(look.hair),
    S: hex(look.skin),
    E: 0x2b2b3a,
    b: shade(hex(look.skin), -0.12),
    C: hex(look.shirt),
    D: shade(hex(look.shirt), -0.35),
    P: 0x3a3f58,
    K: 0x24242e,
    Y: 0xffd34d,
    R: 0x9b1b30,
    A: accent,
    W: 0xff6fa8,
    G: 0x22222c,
    L: 0x9fe3ff,
  }
  const make = (rows: string[]) => {
    const g = new Graphics()
    const ox = -CHAR_W / 2
    const oy = -CHAR_H
    drawMatrix(g, rows, pal, ox, oy)
    if (look.longHair) {
      drawMatrix(g, ['..........', '..........', '.H......H.', '.H......H.', '.H......H.', '.H......H.'], pal, ox, oy)
    }
    const acc = look.accessory
    if (acc && ACCESSORY[acc]) {
      const rows2 = ACCESSORY[acc]
      drawMatrix(g, rows2, pal, ox, oy - (acc === 'cap' ? 1 : 2))
    } else if (acc === 'glasses') {
      drawMatrix(g, ['..GLGGLG..'], pal, ox, oy + 3)
    } else if (acc === 'headset') {
      drawMatrix(g, ['..GGGGGG..', '.G......G.', '.G......G.', '.G......G.', '.GG.......'], pal, ox, oy)
    }
    return g
  }
  return { base: make(BASE), type: make(TYPE), walk: make(WALK) }
}

const ICONS: Record<Exclude<Status, 'working'>, string[]> = {
  idle: ['11111', '...1.', '..1..', '.1...', '11111'],
  waiting: ['.111.', '1...1', '..11.', '.....', '..1..'],
  done: ['....1', '...11', '1.11.', '111..', '.1...'],
  blocked: ['..1..', '..1..', '..1..', '.....', '..1..'],
}

export interface Bubble {
  view: Container
  dots: Graphics[]
}

/** 11x11 speech bubble; pivot at the tail tip. */
export function buildBubble(status: Status, color: number): Bubble {
  const view = new Container()
  const g = new Graphics()
  const ink = shade(color, -0.3)
  px(g, 1, 0, 9, 1, ink)
  px(g, 0, 1, 1, 7, ink)
  px(g, 10, 1, 1, 7, ink)
  px(g, 1, 8, 9, 1, ink)
  px(g, 1, 1, 9, 7, 0xffffff)
  px(g, 1, 7, 9, 1, shade(color, 0.55))
  px(g, 4, 9, 3, 1, ink)
  px(g, 5, 10, 1, 1, ink)
  px(g, 5, 8, 1, 1, 0xffffff)
  view.addChild(g)
  const dots: Graphics[] = []
  if (status === 'working') {
    for (let i = 0; i < 3; i++) {
      const d = new Graphics()
      px(d, 2 + i * 3, 4, 1, 1, ink)
      px(d, 2 + i * 3 + 1, 4, 1, 1, ink)
      px(d, 2 + i * 3, 3, 2, 1, ink)
      view.addChild(d)
      dots.push(d)
    }
  } else {
    const icon = new Graphics()
    drawMatrix(icon, ICONS[status], { '1': ink }, 3, 2)
    view.addChild(icon)
  }
  view.pivot.set(5, 11)
  return { view, dots }
}

export interface DeskParts {
  desk: Graphics
  chair: Graphics
  screen: Graphics
}

/** Desk with monitor, keyboard and mug. (x,y) = desk top-left, 32 x 16 px. */
export function buildDesk(x: number, y: number, accent: number): DeskParts {
  const chair = new Graphics()
  px(chair, x + 11, y - 9, 10, 8, 0x2e2a3d)
  px(chair, x + 12, y - 8, 8, 6, shade(accent, -0.35))
  px(chair, x + 11, y - 1, 10, 1, 0x1d1a28)

  const desk = new Graphics()
  px(desk, x, y, 32, 9, 0xc8925a)
  px(desk, x, y, 32, 1, 0xe2b27e)
  px(desk, x, y + 9, 32, 5, 0x8a5a34)
  px(desk, x, y + 9, 32, 1, 0x6e4628)
  px(desk, x + 1, y + 14, 2, 2, 0x5b3a22)
  px(desk, x + 29, y + 14, 2, 2, 0x5b3a22)
  // monitor (left side)
  px(desk, x + 1, y - 6, 11, 9, 0x2b2f3a)
  px(desk, x + 5, y + 3, 3, 2, 0x2b2f3a)
  px(desk, x + 3, y + 5, 7, 1, 0x2b2f3a)
  // keyboard
  px(desk, x + 11, y + 3, 10, 3, 0xd8dbe2)
  px(desk, x + 12, y + 4, 8, 1, 0xa9aebb)
  // mug
  px(desk, x + 25, y + 2, 3, 4, 0xf4f4f4)
  px(desk, x + 28, y + 3, 1, 2, 0xf4f4f4)
  px(desk, x + 25, y + 2, 3, 1, 0x6b3e26)
  // papers
  px(desk, x + 23, y + 6, 6, 2, 0xfdf6e3)

  const screen = new Graphics()
  px(screen, x + 2, y - 5, 9, 6, 0x5ad1ff)
  px(screen, x + 3, y - 4, 5, 1, 0xd9f6ff)
  px(screen, x + 3, y - 2, 6, 1, 0xa8e8ff)
  return { desk, chair, screen }
}
