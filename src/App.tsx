import { useEffect, useState } from 'react'
import { TensuraOffice } from './components/TensuraOffice'
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

  const selectAgent = (id: string | null) => {
    setSelectedId(id)
  }

  return (
    <div className="app app--tempest">
      <main className="stage">
        <TensuraOffice data={data} selectedId={selectedId} onSelect={selectAgent} onToggleFullscreen={toggleFullscreen} />
      </main>
      <SidePanel data={data} source={source} selectedId={selectedId} onSelect={selectAgent} />
    </div>
  )
}
