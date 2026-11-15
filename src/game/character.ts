import { hex, shade, type Look } from '../model'
import type { Palette } from './pixels'

export const CHAR_W = 16
export const CHAR_H = 24
export type FrameName = 'base' | 'type' | 'walk'

const BASE = [
  '.....OOOOOO.....',
  '....OHHHHHHO....',
  '...OHHhhhhHHO...',
  '...OHHHHHHHHO...',
  '...OHSSSSSHHO...',
  '...OSssssSSSO...',
  '..OSSSSSSSSSSO..',
  '..OSSESSSESSSO..',
  '...SSSSSSSSSS...',
  '...OSSSbSSSSO...',
  '....OSSbbSSO....',
  '.....OSSSSO.....',
  '....ODSSSSDO....',
  '...OCCcCCcCCO...',
  '..OCCCcCCcCCCO..',
  '..OCDCCCCCCDCO..',
  '..OSDCCCCCCDSO..',
  '..OSDCCACCCDSO..',
  '...ODDDDDDDDO...',
  '....OPPPPPPO....',
  '....OPPOOPPO....',
  '....OPPOOPPO....',
  '...OKKKOOKKKO...',
  '...OLLLOOLLLO...',
]

const TYPE = BASE.map((r, i) => i === 16 ? '..OCDCCCCCCDCO..' : i === 17 ? '...OSSDCCSSO....' : r)
const WALK = BASE.map((r, i) => i === 21 ? '...OPPO..OPPO...' : i === 22 ? '..OKKKO..OKKKO..' : i === 23 ? '..OLLLO..OLLLO..' : r)

const ACCESSORIES: Record<string, string[]> = {
  crown: ['....Y..YY..Y....', '....YYYYYYYY....', '....YRYBBYRY....'],
  horns: ['...R........R...', '...RR......RR...', '....RR....RR....'],
  cap: ['.....AAAAAA.....', '....AAAAAAAA....', '....AAaaaaAAAA..'],
  bow: ['..........WW.WW.', '..........WWWWW.', '...........WWW..'],
  glasses: ['...OGGGOOGGGO...', '...OGLGOOGLGO...', '....OOO..OOO....'],
  headset: ['....GGGGGGGG....', '...GG......GG...', '..GG........GG..', '..GA........AG..', '..GA........AG..', '..GG........GG..', '............G...', '..........GGG...'],
}

// Shared by the office sprites and roster portraits, so identities stay consistent.
export function characterArt(look: Look, accent: number, frame: FrameName = 'base') {
  const palette: Palette = {
    O: 0x243447, H: hex(look.hair), h: shade(hex(look.hair), 0.28),
    S: hex(look.skin), s: shade(hex(look.skin), 0.09), b: shade(hex(look.skin), -0.18),
    E: look.theme && look.theme !== 'goblin' ? 0xbe3e4b : 0x263040, C: hex(look.shirt), c: shade(hex(look.shirt), 0.28), D: shade(hex(look.shirt), -0.25),
    P: 0x40536b, K: 0x263447, L: 0xd7e8e4, A: accent, a: shade(accent, 0.2),
    Y: 0xffdc69, R: 0xe45f66, B: 0x6bdac7, W: 0xff8fb6, G: 0x253645,
  }
  const layers = []
  if (look.theme === 'goblin') {
    layers.push({ rows: ['SS................SS', '.SS..............SS.', '..SS............SS..', '...SS..........SS...'], x: -2, y: 5 })
  }
  if (look.longHair) {
    layers.push({ rows: ['..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...'], x: 0, y: 7 })
  }
  const rows = [...(frame === 'type' ? TYPE : frame === 'walk' ? WALK : BASE)]
  if (look.theme) {
    rows[12] = '....OYYSSYYO....'
    rows[13] = '...OCYCCCYCCO...'
    rows[14] = '..OCCYCCCYCCCO..'
    rows[18] = '...OYYYYYYYYO...'
    if (look.theme === 'goblin') rows[9] = '...OSSSbSSSSO...'
  }
  layers.push({ rows, x: 0, y: 0 })
  if (look.theme === 'diablo') layers.push({ rows: ['......RR........', '.....RR.........', '....RR..........'], x: 0, y: 1 })
  if (look.accessory) {
    layers.push({ rows: ACCESSORIES[look.accessory], x: 0, y: look.accessory === 'glasses' ? 6 : look.accessory === 'headset' ? 2 : -2 })
  }
  return { palette, layers }
}
