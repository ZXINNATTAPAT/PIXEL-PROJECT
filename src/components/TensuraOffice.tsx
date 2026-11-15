import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { CHARACTER_SHEETS, loadSpriteFrames, type SpriteFrames, type SpritePose } from '../game/raster-sprites'
import { advanceActor, CAMPUS_BACKGROUND, CAMPUS_HEIGHT, CAMPUS_ROOMS, CAMPUS_WIDTH, createActor, distance, homeFor, nearestWaypoint, nodeById, ROOM_HEIGHT, ROOM_SCALE, ROOM_WIDTH, sendActor, waypoints, type Actor } from '../game/campus'
import { tensuraLook } from '../game/tensura-look'
import { STATUS_META, type OfficeData } from '../model'
import { PersonalWorkstation } from './PersonalWorkstation'
import { OfficeEffects } from './OfficeEffects'
import './TensuraOffice.css'

interface Props {
  data: OfficeData
  selectedId: string | null
  onSelect: (id: string | null) => void
  onToggleFullscreen: () => void
}

interface SpriteNode {
  button: HTMLButtonElement
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  painted: string
}

export function TensuraOffice({ data, selectedId, onSelect, onToggleFullscreen }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const sprites = useRef(new Map<string, SpriteNode>())
  const actors = useRef(new Map<string, Actor>())
  const frames = useRef(new Map<string, SpriteFrames>())
  const selection = useRef(selectedId)
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)
  const [zoom, setZoom] = useState(1.5)
  const [fit, setFit] = useState(.4)
  const [notice, setNotice] = useState('Select an agent, then click a path to walk. Scroll to explore.')
  const [failedImages, setFailedImages] = useState(false)
  const [spritesReady, setSpritesReady] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const slots: Record<string, number> = {}
  const workstations = data.agents.map((agent) => {
    const index = slots[agent.room] ?? 0
    slots[agent.room] = index + 1
    return { agent, home: homeFor(agent.room, index) }
  })

  useEffect(() => { selection.current = selectedId }, [selectedId])
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => {
    if (!detailId) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setDetailId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailId])

  useEffect(() => {
    let cancelled = false
    const counts: Record<string, number> = {}
    const ids = new Set(data.agents.map((agent) => agent.id))
    for (const id of actors.current.keys()) {
      if (!ids.has(id)) { actors.current.delete(id); frames.current.delete(id) }
    }
    data.agents.forEach((agent, index) => {
      const slot = counts[agent.room] ?? 0
      counts[agent.room] = slot + 1
      const home = homeFor(agent.room, slot)
      const actor = actors.current.get(agent.id)
      if (actor) {
        actor.status = agent.status
        if (actor.home !== home) { actor.home = home; sendActor(actor, home) }
      } else {
        actors.current.set(agent.id, createActor(agent.id, home, agent.status, index))
      }
    })
    void Promise.all(data.agents.map(async (agent) => {
      const art = await loadSpriteFrames(tensuraLook(agent).theme!)
      if (cancelled) return
      frames.current.set(agent.id, art)
      const sprite = sprites.current.get(agent.id)
      if (sprite) sprite.painted = ''
    })).then(() => { if (!cancelled) setSpritesReady(true) }).catch(() => { if (!cancelled) setFailedImages(true) })
    return () => { cancelled = true }
  }, [data])

  useEffect(() => {
    const host = viewportRef.current!
    const resize = () => setFit(Math.max(.05, Math.min((host.clientWidth - 16) / CAMPUS_WIDTH, (host.clientHeight - 16) / CAMPUS_HEIGHT)))
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let request = 0
    let previous = performance.now()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const tick = (now: number) => {
      const dt = pausedRef.current ? 0 : Math.min(50, now - previous)
      previous = now
      for (const actor of actors.current.values()) {
        advanceActor(actor, dt, !reducedMotion.matches)
        const sprite = sprites.current.get(actor.id)
        const art = frames.current.get(actor.id)
        if (!sprite || !art) continue
        const moving = actor.route.length > 0
        const atDesk = !moving && distance(actor, nodeById.get(actor.home)!) < 1
        if (sprite.button.dataset.motion === 'walking' && !moving && selection.current === actor.id) {
          setNotice(atDesk ? 'At their personal computer.' : 'Arrived. Click a floor point or their computer to move again.')
        }
        const frame: SpritePose = pausedRef.current || reducedMotion.matches ? 'base' : moving
          ? (Math.floor(now / 170) % 2 ? 'walk' : 'walkAlt')
          : atDesk && actor.status === 'working' && Math.floor(now / 180) % 2 ? 'type' : 'base'
        if (sprite.painted !== frame) {
          sprite.context.clearRect(0, 0, 128, 160)
          sprite.context.drawImage(art[frame], 0, 0)
          sprite.painted = frame
        }
        sprite.button.style.transform = `translate(${actor.x - 36}px, ${actor.y - 88}px)`
        sprite.button.style.zIndex = String(Math.round(actor.y) + 1)
        sprite.canvas.style.transform = `scaleX(${actor.facing})`
        sprite.button.dataset.motion = moving ? 'walking' : actor.status
        sprite.button.dataset.pose = frame
        sprite.button.dataset.x = actor.x.toFixed(1)
        sprite.button.dataset.y = actor.y.toFixed(1)
        sprite.button.dataset.node = actor.node
        sprite.button.dataset.atDesk = String(atDesk)
      }
      const selected = selection.current ? actors.current.get(selection.current) : undefined
      pathRef.current?.setAttribute('d', selected?.route.length
        ? `M${selected.x},${selected.y}` + selected.route.map((id) => { const node = nodeById.get(id)!; return `L${node.x},${node.y}` }).join('')
        : '')
      request = requestAnimationFrame(tick)
    }
    request = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(request)
  }, [])

  const moveSelected = (destination: string) => {
    const actor = selectedId ? actors.current.get(selectedId) : undefined
    if (!actor) return
    sendActor(actor, destination, true)
    const room = CAMPUS_ROOMS.find((item) => item.id === nodeById.get(destination)?.room)
    setNotice(paused ? 'Movement is paused. Press Resume to continue.' : `Walking to ${room?.name ?? 'the shared doorway'}.`)
  }

  const clickFloor = (event: MouseEvent<HTMLDivElement>) => {
    if (!selectedId) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const point = { x: (event.clientX - bounds.left) / (fit * zoom), y: (event.clientY - bounds.top) / (fit * zoom) }
    const destination = nearestWaypoint(point)
    if (distance(point, destination) <= 120 * ROOM_SCALE) moveSelected(destination.id)
    else setNotice('Choose a glowing path or doorway. Furniture is not walkable.')
  }

  const scale = fit * zoom

  return (
    <section className="tempest-office" data-paused={paused} aria-label="Tempest headquarters campus">
      <div className="campus-toolbar">
        <h1 className="campus-caption"><i /> TEMPEST OFFICE</h1>
        <div className="campus-controls" aria-label="Map controls">
          <button onClick={() => setZoom((value) => Math.max(1, value - .5))} disabled={zoom === 1} aria-label="Zoom out">−</button>
          <button onClick={() => setZoom(1)} title="Fit all rooms" aria-label="Fit all rooms">{Math.round(zoom * 100)}%</button>
          <button onClick={() => setZoom((value) => Math.min(4, value + .5))} disabled={zoom === 4} aria-label="Zoom in">+</button>
          <button onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? 'Resume' : 'Pause'}</button>
          <button className="fs" onClick={onToggleFullscreen} title="Fullscreen" aria-label="Toggle fullscreen">⛶</button>
        </div>
      </div>
      <div className="campus-viewport" ref={viewportRef} tabIndex={0} aria-label="Connected office map. Scroll to explore when zoomed in.">
        <div className="campus-sizer" style={{ width: CAMPUS_WIDTH * scale, height: CAMPUS_HEIGHT * scale }}>
          <div className="campus-world" data-selected={!!selectedId} style={{ width: CAMPUS_WIDTH, height: CAMPUS_HEIGHT, transform: `scale(${scale})` }} onClick={clickFloor}>
            <img className="campus-background" src={`${import.meta.env.BASE_URL}images/tensura/${CAMPUS_BACKGROUND}`} alt="Four Tensura rooms merged into one continuous office" width={1586} height={992} draggable={false} onError={() => setFailedImages(true)} />
            <OfficeEffects />
            {CAMPUS_ROOMS.map((room, index) => (
              <div key={room.id} className="campus-room" style={{ left: room.x, top: room.y, width: ROOM_WIDTH, height: ROOM_HEIGHT }}>
                <h2><span>{String(index + 1).padStart(2, '0')}</span>{data.rooms.find((item) => item.id === room.id)?.name ?? room.name}</h2>
              </div>
            ))}
            <svg className="campus-paths" width={CAMPUS_WIDTH} height={CAMPUS_HEIGHT} aria-hidden="true">
              {waypoints.map((point) => <circle key={point.id} cx={point.x} cy={point.y} r={5} />)}
              <path ref={pathRef} className="selected-route" />
            </svg>
            {workstations.map(({ agent, home }) => (
              <PersonalWorkstation key={agent.id} agent={agent} point={nodeById.get(home)!} selected={selectedId === agent.id} onSelect={() => {
                onSelect(agent.id)
                const actor = actors.current.get(agent.id)
                if (actor) sendActor(actor, home, true)
                setNotice(`Returning to ${agent.short}'s personal computer.`)
              }} />
            ))}
            {data.agents.map((agent) => (
              <button
                key={agent.id}
                className={`campus-agent${selectedId === agent.id ? ' selected' : ''}`}
                aria-label={`${agent.name} — ${STATUS_META[agent.status].label}. ${agent.task || 'No current task'}`}
                aria-pressed={selectedId === agent.id}
                title={`${agent.name}: ${agent.task || 'No current task'}`}
                data-agent-id={agent.id}
                data-character={tensuraLook(agent).theme}
                ref={(button) => {
                  if (!button) { sprites.current.delete(agent.id); return }
                  const canvas = button.querySelector('canvas')!
                  const context = canvas.getContext('2d')
                  if (context) sprites.current.set(agent.id, { button, canvas, context, painted: '' })
                }}
                onClick={(event) => { event.stopPropagation(); onSelect(selectedId === agent.id ? null : agent.id) }}
              >
                <span className="sprite-shadow" />
                <canvas width={128} height={160} aria-hidden="true" />
                <i className="sprite-status" style={{ background: STATUS_META[agent.status].color }} aria-hidden="true" />
                <span className="sprite-name">{agent.short}</span>
                {agent.task && agent.task !== 'No current task' ? <span className="work-popup" style={{ '--popup': STATUS_META[agent.status].color } as CSSProperties} onClick={(event) => { event.stopPropagation(); setDetailId(agent.id) }}><span>{STATUS_META[agent.status].label}</span></span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      {(() => {
        const detail = data.agents.find((agent) => agent.id === detailId)
        if (!detail) return null
        const meta = STATUS_META[detail.status]
        const theme = tensuraLook(detail).theme
        return (
          <div className="task-screen" onClick={() => setDetailId(null)}>
            <div className="task-card" role="dialog" aria-modal="true" aria-labelledby="task-card-title" style={{ '--popup': meta.color } as CSSProperties} onClick={(event) => event.stopPropagation()}>
              <button className="task-card-close" onClick={() => setDetailId(null)} aria-label="Close">×</button>
              {theme ? <span className="task-card-character" style={{ backgroundImage: `url("${import.meta.env.BASE_URL}images/tensura/${CHARACTER_SHEETS[theme]}")` }} /> : null}
              <p className="task-card-status" style={{ color: meta.color }}>{meta.label}</p>
              <h2 id="task-card-title">{detail.name}</h2>
              <p className="task-card-task">{detail.task}</p>
            </div>
          </div>
        )
      })()}
      <div className="campus-actions">
        <p role="status">{failedImages ? 'An office asset could not load. Please refresh the page.' : !spritesReady ? 'Preparing the Tempest character sprites…' : notice}</p>
        <button disabled={!selectedId} onClick={() => { const actor = selectedId ? actors.current.get(selectedId) : undefined; if (actor) moveSelected(actor.home) }}>Return to desk</button>
        <button disabled={!selectedId} onClick={() => moveSelected('lounge:mid')}>Visit lounge</button>
      </div>
    </section>
  )
}
