import { useId } from 'react'
import type { Point } from '../game/campus'
import { STATUS_META, type Agent } from '../model'

interface Props {
  agent: Agent
  point: Point
  selected: boolean
  onSelect: () => void
}

const crystalOutline = '1170,320 1169,211 1236,97 1260,115 1310,219 1305,292 1262,326'

export function PersonalWorkstation({ agent, point, selected, onSelect }: Props) {
  const id = useId()
  const asset = `${import.meta.env.BASE_URL}images/tensura/tempest-desk-v4.png`
  return (
    <>
      <svg className="campus-chair" viewBox="0 0 40 58" aria-hidden="true" style={{ left: point.x - 20, top: point.y - 57, zIndex: Math.round(point.y) }}>
        <path d="M5 4 29 0 37 7 37 38 9 45 3 35Z" fill="#19243d" stroke="#bd9e59" strokeWidth="2" />
        <path d="M9 9 28 5 31 11 31 31 11 35Z" fill="#354c76" />
        <path d="M8 36 32 31 37 40 13 47Z" fill="#273f67" stroke="#c5a765" strokeWidth="2" />
        <path d="M20 46V54M9 57 20 53 33 55" fill="none" stroke="#172238" strokeWidth="3" />
      </svg>
      <button
        className={`campus-workstation${selected ? ' selected' : ''}`}
        data-owner={agent.id}
        data-working={agent.status === 'working'}
        aria-label={`${agent.name} computer`}
        aria-pressed={selected}
        title={`${agent.name} · personal computer — click to return here`}
        style={{ left: point.x - 68, top: point.y - 59, zIndex: Math.round(point.y) + 2 }}
        onClick={(event) => { event.stopPropagation(); onSelect() }}
      >
        <svg viewBox="0 0 1536 1024" aria-hidden="true">
          <defs>
            <mask id={`${id}-desk`}>
              <rect width="1536" height="1024" fill="white" />
              <polygon points={crystalOutline} fill="black" />
            </mask>
            <clipPath id={`${id}-crystal`}><polygon points={crystalOutline} /></clipPath>
            <clipPath id={`${id}-screen`}><polygon points="215,215 470,173 493,320 235,357" /></clipPath>
          </defs>
          <image href={asset} width="1536" height="1024" mask={`url(#${id}-desk)`} />
          <g className="desk-crystal">
            <image href={asset} width="1536" height="1024" clipPath={`url(#${id}-crystal)`} />
          </g>
          <g clipPath={`url(#${id}-screen)`}>
            <path className="desk-screen-scan" d="M180 300 510 244" />
            <path className="desk-screen-code" d="M250 260 304 251M253 279 332 266M259 299 296 293" />
          </g>
          <g className="desk-tea-steam">
            <path d="M200 428Q177 397 202 370T204 312M234 428Q214 399 237 372T240 326" />
          </g>
          <circle className="desk-status-light" cx="365" cy="370" r="9" fill={STATUS_META[agent.status].color} />
        </svg>
        <span className="computer-owner"><i style={{ background: STATUS_META[agent.status].color }} />{agent.short}</span>
      </button>
    </>
  )
}
