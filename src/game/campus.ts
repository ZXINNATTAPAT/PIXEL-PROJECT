import type { Status } from '../model'

export interface Point { x: number; y: number }
export interface Waypoint extends Point { id: string; room: string; links: string[] }

export const ROOM_SCALE = 1.6
export const CAMPUS_WIDTH = 1600 * ROOM_SCALE
export const CAMPUS_HEIGHT = 1000 * ROOM_SCALE
export const CAMPUS_BACKGROUND = 'tempest-merged-office-v3.png'
export const ROOM_WIDTH = 800 * ROOM_SCALE
export const ROOM_HEIGHT = 500 * ROOM_SCALE
export const CAMPUS_ROOMS = [
  { id: 'exec', name: 'Executive Room', x: 0, y: 0 },
  { id: 'cps', name: 'CPS Office', x: ROOM_WIDTH, y: 0 },
  { id: 'growth', name: 'Growth / Research', x: 0, y: ROOM_HEIGHT },
  { id: 'lounge', name: 'Conference & Lounge', x: ROOM_WIDTH, y: ROOM_HEIGHT },
]

//hello world
export const waypoints: Waypoint[] = []
const add = (id: string, room: string, x: number, y: number) => waypoints.push({ id, room, x: x * ROOM_SCALE, y: y * ROOM_SCALE, links: [] })
const link = (a: string, b: string) => {
  waypoints.find((node) => node.id === a)!.links.push(b)
  waypoints.find((node) => node.id === b)!.links.push(a)
}

// Access lanes run behind the personal desks; rooms meet directly at shared doorways.
const roomHomes: Record<string, [number, number, string][]> = {
  exec: [[350, 300, 'upper'], [495, 300, 'upper'], [350, 380, 'mid'], [495, 380, 'mid'], [350, 460, 'foyer'], [495, 460, 'foyer']],
  cps: [[1000, 270, 'upper'], [1180, 270, 'upper'], [1360, 270, 'upper'], [1000, 380, 'mid'], [1180, 380, 'mid'], [1360, 380, 'mid'], [1000, 450, 'foyer'], [1360, 450, 'foyer']],
  growth: [[380, 730, 'upper'], [530, 730, 'upper'], [380, 810, 'mid'], [530, 810, 'mid'], [350, 900, 'foyer'], [460, 900, 'foyer']],
  lounge: [[1000, 850, 'mid'], [1140, 850, 'mid'], [1000, 940, 'foyer'], [1140, 940, 'foyer']],
}

const lanes: Record<string, [string, number, number][]> = {
  exec: [['upper', 585, 255], ['mid', 585, 335], ['foyer', 585, 415], ['front', 585, 470]],
  cps: [['upper', 885, 225], ['mid', 885, 335], ['foyer', 885, 405], ['front', 885, 470]],
  growth: [['upper', 610, 685], ['mid', 610, 765], ['foyer', 430, 855]],
  lounge: [['upper', 1245, 715], ['mid', 1100, 805], ['foyer', 1100, 900]],
}
for (const room of CAMPUS_ROOMS) {
  lanes[room.id].forEach(([name, x, y], index, list) => {
    add(`${room.id}:${name}`, room.id, x, y)
    if (index) link(`${room.id}:${list[index - 1][0]}`, `${room.id}:${name}`)
  })
  roomHomes[room.id].forEach(([x, y, connection], index) => {
    add(`${room.id}:home${index}`, room.id, x, y)
    add(`${room.id}:seat${index}`, room.id, x + 62, y - 45)
    link(`${room.id}:seat${index}`, `${room.id}:${connection}`)
    link(`${room.id}:home${index}`, `${room.id}:seat${index}`)
  })
}

for (const [id, room, x, y, connection] of [
  ['exec:east', 'exec', 800, 315, 'exec:mid'],
  ['cps:west', 'cps', 800, 315, 'cps:mid'],
  ['exec:south', 'exec', 430, 500, 'exec:front'],
  ['growth:north', 'growth', 430, 500, 'growth:upper'],
  ['cps:south', 'cps', 1140, 500, 'cps:front'],
  ['lounge:north', 'lounge', 1140, 500, 'lounge:upper'],
  ['growth:east', 'growth', 800, 750, 'growth:mid'],
  ['lounge:west', 'lounge', 800, 750, 'lounge:mid'],
] as const) {
  add(id, room, x, y)
  link(id, connection)
}
link('exec:east', 'cps:west')
link('exec:south', 'growth:north')
link('cps:south', 'lounge:north')
link('growth:east', 'lounge:west')

export const nodeById = new Map(waypoints.map((node) => [node.id, node]))
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

export function homeFor(room: string, index: number): string {
  const id = roomHomes[room] ? room : 'cps'
  return `${id}:home${index % roomHomes[id].length}`
}

export function nearestWaypoint(point: Point): Waypoint {
  return waypoints.reduce((best, node) => distance(node, point) < distance(best, point) ? node : best)
}

export function findRoute(from: string, to: string): string[] {
  if (!nodeById.has(from) || !nodeById.has(to) || from === to) return []
  const costs = new Map([[from, 0]])
  const previous = new Map<string, string>()
  const pending = new Set([from])
  while (pending.size) {
    const current = [...pending].reduce((best, id) => costs.get(id)! < costs.get(best)! ? id : best)
    pending.delete(current)
    if (current === to) {
      const route = [to]
      while (route[0] !== from) route.unshift(previous.get(route[0])!)
      return route.slice(1)
    }
    const node = nodeById.get(current)!
    for (const id of node.links) {
      const cost = costs.get(current)! + distance(node, nodeById.get(id)!)
      if (cost < (costs.get(id) ?? Infinity)) {
        costs.set(id, cost)
        previous.set(id, current)
        pending.add(id)
      }
    }
  }
  return []
}

export interface Actor extends Point {
  id: string
  home: string
  node: string
  route: string[]
  status: Status
  facing: number
  rest: number
  manual: number
  wander: number
}

export function createActor(id: string, home: string, status: Status, index: number): Actor {
  const node = nodeById.get(home)!
  return { id, home, node: home, x: node.x, y: node.y, route: [], status, facing: 1, rest: 12000 + index * 650, manual: 0, wander: index }
}

export function sendActor(actor: Actor, destination: string, manual = false) {
  if (!nodeById.has(destination)) return
  // Finish the current edge before changing direction, so a mid-walk click cannot cut through furniture.
  const anchor = actor.route[0] ?? actor.node
  actor.route = [...(distance(actor, nodeById.get(anchor)!) > .01 ? [anchor] : []), ...findRoute(anchor, destination)]
  actor.manual = manual ? 15_000 : 0
  actor.rest = 8000 + actor.wander % 5 * 1600
}

export function advanceActor(actor: Actor, dt: number, wander = true): void {
  if (!actor.route.length) actor.manual = Math.max(0, actor.manual - dt)
  let remaining = 95 * dt / 1000
  while (actor.route.length && remaining > 0) {
    const target = nodeById.get(actor.route[0])!
    const d = distance(actor, target)
    if (Math.abs(target.x - actor.x) > .01) actor.facing = target.x < actor.x ? -1 : 1
    if (d <= remaining) {
      actor.x = target.x
      actor.y = target.y
      actor.node = actor.route.shift()!
      remaining -= d
    } else {
      actor.x += (target.x - actor.x) / d * remaining
      actor.y += (target.y - actor.y) / d * remaining
      remaining = 0
    }
  }
  if (actor.route.length || actor.manual > 0) return
  actor.rest -= dt
  if (actor.node !== actor.home && (actor.status === 'working' || actor.status === 'waiting' || actor.status === 'blocked' || actor.rest <= 0)) {
    sendActor(actor, actor.home)
  } else if (wander && actor.rest <= 0 && (actor.status === 'idle' || actor.status === 'done')) {
    actor.wander++
    const room = actor.home.split(':')[0]
    const stops = [`${room}:upper`, `${room}:foyer`, 'lounge:mid']
    sendActor(actor, stops[actor.wander % stops.length])
  }
}
