import { useEffect, useRef } from 'react'
import { formatBangkok, STATUS_META, STATUS_ORDER, type DataSource, type OfficeData } from '../model'
import { CharacterAvatar } from './CharacterAvatar'
import { tensuraLook } from '../game/tensura-look'

interface Props {
  data: OfficeData
  source: DataSource
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function SidePanel({ data, source, selectedId, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedId) return
    const el = listRef.current?.querySelector(`[data-agent="${selectedId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId])

  const counts = STATUS_ORDER.map((s) => ({ s, n: data.agents.filter((a) => a.status === s).length }))
  const live = source.kind === 'live'
  const badgeText = live ? 'LIVE · Notion' : source.kind === 'offline' ? 'SAMPLE DATA (offline)' : 'CONNECTING…'
  const badgeClass = live ? 'badge live' : source.kind === 'offline' ? 'badge offline' : 'badge'

  return (
    <aside className="panel">
      <header className="panel-head">
        <div className="panel-title">
          <span>Our people <small>{data.agents.length}</small></span>
          <span className={badgeClass} title={data._note}>{badgeText}</span>
        </div>
        <p className="panel-subtitle">Good people. Great things in progress.</p>
        <div className="legend">
          {counts.map(({ s, n }) => (
            <span key={s} className="chip" title={STATUS_META[s].hint}>
              <i style={{ background: STATUS_META[s].color }} />
              {STATUS_META[s].label} <b>{n}</b>
            </span>
          ))}
        </div>
      </header>

      <div className="panel-list" ref={listRef}>
        {data.rooms.map((room) => (
          <section key={room.id} className="room">
            <h3 style={{ borderColor: room.accent }}>{room.name}</h3>
            <div className="room-agents">
            {data.agents
              .filter((a) => a.room === room.id)
              .map((a) => {
                const meta = STATUS_META[a.status]
                const active = a.id === selectedId
                return (
                  <button
                    key={a.id}
                    data-agent={a.id}
                    className={`agent ${active ? 'active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onSelect(active ? null : a.id)}
                  >
                    <span className="avatar-wrap" style={{ background: `${room.accent}18` }}><CharacterAvatar look={tensuraLook(a)} accent="#d9b967" /></span>
                    <span className="agent-body">
                      <span className="agent-name">{a.name}</span>
                      <span className="agent-task">{a.task || 'No current task'}</span>
                    </span>
                    <span className="status" style={{ color: meta.color, borderColor: meta.color }}>
                      {meta.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="panel-foot">
        {source.kind === 'live' ? (
          <>
            Live from Notion "Agent Status Board" · refreshes every 30s
            <br />
            Fetched {formatBangkok(source.fetchedAt)} · last edit {formatBangkok(source.updatedAt)}
          </>
        ) : (
          <>
            {source.kind === 'offline' ? 'Notion unavailable — showing sample data' : 'Connecting to Notion…'} · <code>src/data/agents.json</code>
            <br />
            Updated {data.updatedAt}
          </>
        )}
      </footer>
    </aside>
  )
}
