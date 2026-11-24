import { characterArt } from '../game/character'
import { hex, type Look } from '../model'
import { CHARACTER_SHEETS } from '../game/raster-sprites'

export function CharacterAvatar({ look, accent }: { look: Look; accent: string }) {
  if (look.theme) {
    return <span className="avatar generated-avatar" aria-hidden="true" style={{ backgroundImage: `url("${import.meta.env.BASE_URL}images/tensura/${CHARACTER_SHEETS[look.theme]}")` }} />
  }
  const { palette, layers } = characterArt(look, hex(accent))
  return (
    <svg className="avatar" viewBox="-3 -4 22 30" aria-hidden="true" shapeRendering="crispEdges">
      {layers.flatMap((layer, l) => layer.rows.flatMap((row, y) => [...row].map((pixel, x) =>
        palette[pixel] === undefined ? null : <rect key={`${l}-${x}-${y}`} x={x + layer.x} y={y + layer.y} width="1" height="1" fill={`#${palette[pixel].toString(16).padStart(6, '0')}`} />,
      )))}
    </svg>
  )
}
