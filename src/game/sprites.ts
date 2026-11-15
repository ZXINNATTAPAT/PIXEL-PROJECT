import { Container, Graphics } from 'pixi.js'
import { shade, type Look, type Status } from '../model'
import { drawMatrix, px } from './pixels'

export { CHAR_H, CHAR_W, type FrameName } from './character'
import { characterArt, CHAR_H, CHAR_W, type FrameName } from './character'

export function buildCharacterFrames(look: Look, accent: number): Record<FrameName, Graphics> {
  const make = (frame: FrameName) => {
    const g = new Graphics()
    px(g, -8, -2, 16, 3, 0x203b35, 0.2)
    const { palette, layers } = characterArt(look, accent, frame)
    for (const layer of layers) drawMatrix(g, layer.rows, palette, -CHAR_W / 2 + layer.x, -CHAR_H + layer.y)
    return g
  }
  return { base: make('base'), type: make('type'), walk: make('walk') }
}

const ICONS: Record<Exclude<Status, 'working'>, string[]> = {
  idle: ['.1.1.', '.....', '11111', '1.1.1', '1111.'],
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

/** Workstation with a side monitor: the face and typing hands stay visible. */
export function buildDesk(x: number, y: number, accent: number): DeskParts {
  const chair = new Graphics()
  px(chair, x + 19, y - 18, 18, 17, 0x304b4b)
  px(chair, x + 21, y - 16, 14, 12, shade(accent, -0.45))
  px(chair, x + 22, y - 15, 12, 2, shade(accent, -0.15))
  px(chair, x + 18, y - 5, 20, 3, 0x223a3d)

  const desk = new Graphics()
  px(desk, x - 2, y + 16, 52, 4, 0x203b35, 0.14)
  px(desk, x + 2, y + 9, 3, 9, 0x3e5354)
  px(desk, x + 43, y + 9, 3, 9, 0x3e5354)
  px(desk, x, y - 1, 48, 12, 0xb88d61)
  px(desk, x, y - 1, 48, 2, 0xf3d8ab)
  px(desk, x, y + 1, 48, 7, 0xdfbd8d)
  px(desk, x + 1, y + 8, 46, 2, 0xc89f71)
  px(desk, x + 20, y + 10, 12, 1, accent)
  // Angled-away monitor and a smaller laptop, both beside the character.
  px(desk, x + 2, y - 13, 17, 13, 0x243d46)
  px(desk, x + 3, y - 12, 15, 10, 0x375b67)
  px(desk, x + 4, y - 11, 13, 1, 0x729ba5)
  px(desk, x + 8, y, 4, 2, 0x3b535b)
  px(desk, x + 5, y + 2, 10, 1, 0x3b535b)
  px(desk, x + 22, y + 2, 14, 4, 0x52706c)
  px(desk, x + 23, y + 2, 12, 2, 0xe9eee1)
  px(desk, x + 25, y + 3, 8, 1, 0x97aca2)
  px(desk, x + 38, y + 3, 2, 3, 0xf4f5e9)
  // Ceramic coffee cup and notebook.
  px(desk, x + 41, y - 3, 4, 5, 0xf8f5e8)
  px(desk, x + 45, y - 2, 2, 3, 0xf8f5e8)
  px(desk, x + 41, y - 3, 4, 1, 0x71523b)
  px(desk, x + 3, y + 5, 9, 2, accent)

  const screen = new Graphics()
  px(screen, x + 3, y - 12, 15, 10, 0x163f4b)
  px(screen, x + 4, y - 11, 13, 1, 0x5f9a9a)
  px(screen, x + 5, y - 8, 5, 1, 0x78e8bb)
  px(screen, x + 7, y - 6, 8, 1, 0x89c9ed)
  px(screen, x + 7, y - 4, 4, 1, 0xf3cf84)
  px(screen, x + 13, y - 4, 2, 1, 0xe4f2e4)
  return { desk, chair, screen }
}
