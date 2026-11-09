import { useEffect, useMemo, useState } from 'react'
import { OfficeCanvas } from './components/OfficeCanvas'
import { SidePanel } from './components/SidePanel'
import raw from './data/agents.json'
import type { DataSource, OfficeData } from './model'
import './App.css'

const sample = raw as OfficeData
const POLL_MS = 30_000

function toggleFullscreen() {
  const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
  if (document.fullscreenElement || doc.webkitFullscreenElement) {
    if (document.exitFullscreen) void document.exitFullscreen()
    else doc.webkitExitFullscreen?.()
  } else if (el.requestFullscreen) void el.requestFullscreen()
  else el.webkitRequestFullscreen?.()
}

// only the parts that change the drawing; avoids rebuilding the scene on every poll
const sceneKey = (d: OfficeData) =>
  JSON.stringify([d.rooms, d.agents.map((a) => [a.id, a.room, a.status, a.short, a.look])])

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [data, setData] = useState<OfficeData>(sample)
  const [source, setSource] = useState<DataSource>({ kind: 'loading' })

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch('/api/agents', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const next = (await res.json()) as OfficeData
        if (!alive) return
        setData(next)
        setSource({ kind: 'live', fetchedAt: next.fetchedAt ?? new Date().toISOString(), updatedAt: next.updatedAt })
      } catch {
        if (!alive) return
        setData((prev) => (prev === sample ? prev : sample))
        setSource({ kind: 'offline' })
      }
    }
    void load()
    const t = window.setInterval(load, POLL_MS)
    return () => {
      alive = false
      window.clearInterval(t)
    }
  }, [])

  const key = sceneKey(data)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sceneData = useMemo(() => data, [key])
  const selected = data.agents.find((a) => a.id === selectedId)

  return (
    <div className="app">
      <main className="stage">
        <div className="stage-bar">
          <span className="logo">▣ Pixel Office</span>
          <span className="stage-hint">{selected ? `${selected.name} — ${selected.task}` : 'Tap a character to see what they are doing'}</span>
          <button className="fs" onClick={toggleFullscreen} title="Fullscreen">⛶</button>
        </div>
        <OfficeCanvas data={sceneData} selectedId={selectedId} onSelect={setSelectedId} />
      </main>
      <SidePanel data={data} source={source} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  )
}
