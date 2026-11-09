import { useEffect, useRef } from 'react'
import { STATUS_META, STATUS_ORDER, type OfficeData } from '../model'

interface Props {
  data: OfficeData
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function SidePanel({ data, selectedId, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedId) return
    const el = listRef.current?.querySelector(`[data-agent="${selectedId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId])

  const counts = STATUS_ORDER.map((s) => ({ s, n: data.agents.filter((a) => a.status === s).length }))

  return (
    <aside className="panel">
      <header className="panel-head">
        <div className="panel-title">
          <span>Agents</span>
          <span className="badge" title={data._note}>SAMPLE DATA</span>
        </div>
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
                    onClick={() => onSelect(active ? null : a.id)}
                  >
                    <span className="avatar" style={{ background: a.look.shirt, borderColor: a.look.hair }} />
                    <span className="agent-body">
                      <span className="agent-name">{a.name}</span>
                      <span className="agent-task">{a.task}</span>
                    </span>
                    <span className="status" style={{ color: meta.color, borderColor: meta.color }}>
                      {meta.label}
                    </span>
                  </button>
                )
              })}
          </section>
        ))}
      </div>

      <footer className="panel-foot">
        Sample data · edit <code>src/data/agents.json</code>
        <br />
        Updated {data.updatedAt}
      </footer>
    </aside>
  )
}
