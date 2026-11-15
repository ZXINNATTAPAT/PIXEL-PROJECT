import type { Look } from '../model'

export type CharacterTheme = NonNullable<Look['theme']>
export type SpritePose = 'base' | 'walk' | 'walkAlt' | 'type'
export const SPRITE_CELLS: Record<SpritePose, [number, number]> = {
  base: [0, 0], walk: [1, 0], walkAlt: [0, 1], type: [1, 1],
}
export const CHARACTER_SHEETS: Record<CharacterTheme, string> = {
  raphael: 'raphael-sheet-v4.png',
  diablo: 'diablo-sheet-v4.png',
  testarossa: 'testarossa-sheet-v4.png',
  michael: 'michael-sheet-v4.png',
  goblin: 'goblin-sheet-v4.png',
}
export type SpriteFrames = Record<SpritePose, HTMLCanvasElement>
const loaded = new Map<CharacterTheme, Promise<SpriteFrames>>()

export function loadSpriteFrames(theme: CharacterTheme): Promise<SpriteFrames> {
  const cached = loaded.get(theme)
  if (cached) return cached
  const promise = new Promise<SpriteFrames>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) { reject(new Error('Empty character sheet')); return }
      const frames = {} as SpriteFrames
      for (const pose of Object.keys(SPRITE_CELLS) as SpritePose[]) {
        const [column, row] = SPRITE_CELLS[pose]
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 160
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(image, column * image.naturalWidth / 2, row * image.naturalHeight / 2, image.naturalWidth / 2, image.naturalHeight / 2, 0, 0, 128, 160)
        frames[pose] = canvas
      }
      resolve(frames)
    }
    image.onerror = () => { loaded.delete(theme); reject(new Error(`Could not load ${CHARACTER_SHEETS[theme]}`)) }
    image.src = `${import.meta.env.BASE_URL}images/tensura/${CHARACTER_SHEETS[theme]}`
  })
  loaded.set(theme, promise)
  return promise
}
