import { Application, Container, Graphics, Rectangle, Text } from 'pixi.js'
import { hex, STATUS_META, type Agent, type OfficeData } from '../model'
import { deskSlot, MAP_H, MAP_W } from './layout'
import { px } from './pixels'
import { buildBubble, buildCharacterFrames, buildDesk, CHAR_H, type FrameName } from './sprites'
import { buildWorld } from './world'

export interface SceneController {
  setSelected(id: string | null): void
  destroy(): void
}

type Mode = 'sit' | 'walk' | 'stand'

interface Actor {
  agent: Agent
  body: Container
  frames: Record<FrameName, Graphics>
  bubble: Container
  dots: Graphics[]
  screen: Graphics
  label: Text
  desk: { x: number; y: number }
  home: { x: number; y: number }
  pos: { x: number; y: number }
  target: { x: number; y: number } | null
  mode: Mode
  timer: number
  returning: boolean
  phase: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export async function createScene(
  host: HTMLElement,
  data: OfficeData,
  onSelect: (id: string | null) => void,
  isCancelled: () => boolean,
): Promise<SceneController | null> {
  const app = new Application()
  await app.init({
    background: 0x15121f,
    antialias: false,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 3),
    roundPixels: true,
    width: Math.max(1, host.clientWidth),
    height: Math.max(1, host.clientHeight),
  })
  if (isCancelled()) {
    app.destroy(true, { children: true })
    return null
  }
  host.appendChild(app.canvas)

  const world = new Container()
  app.stage.addChild(world)

  // background click = deselect
  const bg = new Graphics()
  px(bg, 0, 0, MAP_W, MAP_H, 0x000000, 0.001)
  bg.eventMode = 'static'
  bg.on('pointertap', () => onSelect(null))
  world.addChild(bg)

  const roomInfo: Record<string, { name: string; accent: number }> = {}
  for (const r of data.rooms) roomInfo[r.id] = { name: r.name, accent: hex(r.accent) }

  const { ground, props } = buildWorld(roomInfo)
  ground.eventMode = 'none'
  world.addChild(ground)

  const actorsLayer = new Container()
  actorsLayer.sortableChildren = true
  actorsLayer.eventMode = 'passive'
  world.addChild(actorsLayer)
  for (const p of props) actorsLayer.addChild(p)

  const overlay = new Container()
  overlay.eventMode = 'none'
  world.addChild(overlay)
  const selBox = new Graphics()
  const selArrow = new Graphics()
  px(selArrow, 0, 0, 7, 2, 0xffd43b)
  px(selArrow, 1, 2, 5, 1, 0xffd43b)
  px(selArrow, 2, 3, 3, 1, 0xffd43b)
  px(selArrow, 3, 4, 1, 1, 0xffd43b)
  px(selArrow, 0, 0, 7, 1, 0xfff3bf)
  selArrow.pivot.set(3, 5)
  overlay.addChild(selBox)
  const labels = new Container()
  overlay.addChild(labels)
  const bubbles = new Container()
  overlay.addChild(bubbles, selArrow)

  const slotCount: Record<string, number> = {}
  const actors: Actor[] = []

  for (const agent of data.agents) {
    const i = slotCount[agent.room] ?? 0
    slotCount[agent.room] = i + 1
    const accent = roomInfo[agent.room]?.accent ?? 0xffffff
    const d = deskSlot(agent.room, i)
    const parts = buildDesk(d.x, d.y, accent)
    parts.chair.zIndex = d.y - 20
    parts.desk.zIndex = d.y + 8
    parts.screen.zIndex = d.y + 9
    parts.screen.visible = agent.status === 'working'

    // desk parts are sorted individually, so they share one invisible hit target
    const hit = new Graphics()
    px(hit, d.x - 2, d.y - 24, 36, 42, 0x000000, 0.001)
    hit.eventMode = 'static'
    hit.cursor = 'pointer'
    hit.zIndex = d.y + 10
    hit.on('pointertap', (e) => {
      e.stopPropagation()
      onSelect(agent.id)
    })

    const body = new Container()
    const frames = buildCharacterFrames(agent.look, accent)
    body.addChild(frames.base, frames.type, frames.walk)
    frames.type.visible = false
    frames.walk.visible = false
    body.eventMode = 'static'
    body.cursor = 'pointer'
    body.hitArea = new Rectangle(-6, -CHAR_H - 2, 12, CHAR_H + 2)
    body.on('pointertap', (e) => {
      e.stopPropagation()
      onSelect(agent.id)
    })

    const home = { x: d.x + 16, y: d.y + 3 }
    body.position.set(home.x, home.y)
    body.zIndex = home.y

    actorsLayer.addChild(parts.chair, body, parts.desk, parts.screen, hit)

    const color = hex(STATUS_META[agent.status].color)
    const bubble = buildBubble(agent.status, color)
    bubbles.addChild(bubble.view)

    const label = new Text({
      text: agent.short,
      style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 6, fontWeight: '700', fill: 0xffffff, stroke: { color: 0x15121f, width: 2 } },
      resolution: 8,
    })
    label.anchor.set(0.5, 0)
    label.position.set(d.x + 16, d.y + 16)
    labels.addChild(label)

    actors.push({
      agent,
      body,
      frames,
      bubble: bubble.view,
      dots: bubble.dots,
      screen: parts.screen,
      label,
      desk: d,
      home,
      pos: { ...home },
      target: null,
      mode: 'sit',
      timer: rand(800, 3500),
      returning: false,
      phase: Math.random() * 1000,
    })
  }

  let selected: string | null = null
  const drawSelection = () => {
    selBox.clear()
    for (const a of actors) a.label.style.fill = a.agent.id === selected ? 0xffd43b : 0xffffff
    const a = actors.find((x) => x.agent.id === selected)
    selArrow.visible = !!a
    if (!a) return
    const { x, y } = a.desk
    const c = 0xffd43b
    px(selBox, x - 4, y - 30, 40, 1, c)
    px(selBox, x - 4, y + 25, 40, 1, c)
    px(selBox, x - 4, y - 30, 1, 56, c)
    px(selBox, x + 35, y - 30, 1, 56, c)
    // corner accents
    for (const [cx, cy] of [
      [x - 5, y - 31],
      [x + 34, y - 31],
      [x - 5, y + 24],
      [x + 34, y + 24],
    ])
      px(selBox, cx, cy, 3, 3, 0xfff3bf)
  }
  drawSelection()

  // responsive fit
  const fit = () => {
    const w = Math.max(1, host.clientWidth)
    const h = Math.max(1, host.clientHeight)
    app.renderer.resize(w, h)
    const s = Math.min(w / MAP_W, h / MAP_H)
    world.scale.set(s)
    world.position.set(Math.round((w - MAP_W * s) / 2), Math.round((h - MAP_H * s) / 2))
  }
  const ro = new ResizeObserver(fit)
  ro.observe(host)
  fit()

  const setFrame = (a: Actor, f: FrameName) => {
    a.frames.base.visible = f === 'base'
    a.frames.type.visible = f === 'type'
    a.frames.walk.visible = f === 'walk'
  }

  let t = 0
  app.ticker.add((ticker) => {
    const dt = Math.min(ticker.deltaMS, 100)
    t += dt
    for (const a of actors) {
      const st = a.agent.status
      const tt = t + a.phase
      let bob = 0
      if (st === 'idle') {
        a.timer -= dt
        if (a.mode === 'sit' || a.mode === 'stand') {
          setFrame(a, 'base')
          if (a.timer <= 0) {
            if (a.mode === 'stand' && (a.returning || Math.random() < 0.35)) {
              a.target = { ...a.home }
              a.returning = true
            } else {
              a.target = { x: a.home.x + Math.round(rand(-26, 26)), y: a.home.y - Math.round(rand(9, 24)) }
              a.returning = false
            }
            a.mode = 'walk'
          }
        } else if (a.mode === 'walk' && a.target) {
          const dx = a.target.x - a.pos.x
          const dy = a.target.y - a.pos.y
          const dist = Math.hypot(dx, dy)
          const step = (22 * dt) / 1000
          if (dist <= step) {
            a.pos = { ...a.target }
            a.target = null
            if (a.returning) {
              a.mode = 'sit'
              a.returning = false
              a.timer = rand(2500, 6000)
            } else {
              a.mode = 'stand'
              a.timer = rand(900, 2600)
            }
          } else {
            a.pos.x += (dx / dist) * step
            a.pos.y += (dy / dist) * step
            if (Math.abs(dx) > 0.5) a.body.scale.x = dx < 0 ? -1 : 1
          }
          setFrame(a, Math.floor(tt / 160) % 2 ? 'walk' : 'base')
          bob = Math.floor(tt / 160) % 2 ? -1 : 0
        }
      } else if (st === 'working') {
        setFrame(a, Math.floor(tt / 170) % 2 ? 'type' : 'base')
        bob = Math.floor(tt / 680) % 2 ? -1 : 0
        a.screen.alpha = 0.75 + 0.25 * (Math.floor(tt / 400) % 2)
      } else if (st === 'done') {
        setFrame(a, 'base')
        bob = Math.floor(tt / 900) % 4 === 0 ? -1 : 0
      } else if (st === 'blocked') {
        setFrame(a, 'base')
        a.body.scale.x = Math.floor(tt / 1500) % 2 ? -1 : 1
      } else {
        setFrame(a, 'base')
      }
      a.body.position.set(Math.round(a.pos.x), Math.round(a.pos.y) + bob)
      a.body.zIndex = a.mode === 'sit' ? a.home.y : Math.round(a.pos.y)

      // bubble floats above head
      const lift =
        st === 'waiting' ? (Math.floor(tt / 300) % 2 ? -2 : 0) : st === 'blocked' ? 0 : Math.floor(tt / 700) % 2 ? -1 : 0
      a.bubble.position.set(Math.round(a.pos.x) + 6, Math.round(a.pos.y) - CHAR_H - 1 + lift + bob)
      if (st === 'blocked') a.bubble.alpha = Math.floor(tt / 450) % 2 ? 0.55 : 1
      a.dots.forEach((d, i) => (d.alpha = Math.floor(tt / 250) % 4 > i ? 1 : 0.2))

      if (a.agent.id === selected) {
        selArrow.position.set(a.bubble.x, a.bubble.y - 13 + (Math.floor(t / 250) % 2 ? -1 : 0))
        selBox.alpha = 0.7 + 0.3 * (Math.floor(t / 400) % 2)
      }
    }
  })

  return {
    setSelected(id) {
      selected = id
      drawSelection()
    },
    destroy() {
      ro.disconnect()
      app.destroy(true, { children: true })
    },
  }
}
