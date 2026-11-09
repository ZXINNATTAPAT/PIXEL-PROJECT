import { Graphics } from 'pixi.js'

export type Palette = Record<string, number>

/** Draws a character matrix ('.' = transparent) as 1x1 pixel rects, merging horizontal runs. */
export function drawMatrix(g: Graphics, rows: string[], pal: Palette, ox = 0, oy = 0): Graphics {
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const c = row[x]
      const col = pal[c]
      if (c === '.' || col === undefined) {
        x++
        continue
      }
      let run = 1
      while (x + run < row.length && row[x + run] === c) run++
      g.rect(ox + x, oy + y, run, 1).fill(col)
      x += run
    }
  })
  return g
}

export function px(g: Graphics, x: number, y: number, w: number, h: number, color: number, alpha = 1): Graphics {
  return g.rect(Math.round(x), Math.round(y), w, h).fill({ color, alpha })
}
