import { useState } from 'react'
import { OfficeCanvas } from './components/OfficeCanvas'
import { SidePanel } from './components/SidePanel'
import raw from './data/agents.json'
import type { OfficeData } from './model'
import './App.css'

const data = raw as OfficeData

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
  const selected = data.agents.find((a) => a.id === selectedId)

  return (
    <div className="app">
      <main className="stage">
        <div className="stage-bar">
          <span className="logo">▣ Pixel Office</span>
          <span className="stage-hint">{selected ? `${selected.name} — ${selected.task}` : 'Tap a character to see what they are doing'}</span>
          <button className="fs" onClick={toggleFullscreen} title="Fullscreen">⛶</button>
        </div>
        <OfficeCanvas data={data} selectedId={selectedId} onSelect={setSelectedId} />
      </main>
      <SidePanel data={data} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  )
}
