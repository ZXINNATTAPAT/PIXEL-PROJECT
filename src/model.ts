export type Status = 'idle' | 'working' | 'waiting' | 'done' | 'blocked'

export type Accessory = 'crown' | 'horns' | 'glasses' | 'headset' | 'cap' | 'bow'

export interface Look {
  hair: string
  skin: string
  shirt: string
  longHair?: boolean
  accessory?: Accessory
}

export interface Agent {
  id: string
  agentId?: string
  name: string
  short: string
  room: string
  status: Status
  task: string
  look: Look
}

export interface Room {
  id: string
  name: string
  accent: string
}

export interface OfficeData {
  _note: string
  updatedAt: string
  fetchedAt?: string
  source?: string
  rooms: Room[]
  agents: Agent[]
}

export const STATUS_ORDER: Status[] = ['working', 'waiting', 'blocked', 'done', 'idle']

export const STATUS_META: Record<Status, { label: string; color: string; hint: string }> = {
  idle: { label: 'Idle', color: '#9aa4b2', hint: 'Free / wandering around' },
  working: { label: 'Working', color: '#4ade80', hint: 'Busy on a task' },
  waiting: { label: 'Waiting', color: '#fbbf24', hint: 'Needs your decision' },
  done: { label: 'Done', color: '#60a5fa', hint: 'Finished the task' },
  blocked: { label: 'Blocked', color: '#f87171', hint: 'Stuck — needs help' },
}

export const hex = (s: string): number => parseInt(s.replace('#', ''), 16)

export function shade(color: number, amt: number): number {
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 + amt))))
  const r = f((color >> 16) & 255)
  const g = f((color >> 8) & 255)
  const b = f(color & 255)
  return (r << 16) | (g << 8) | b
}

export type DataSource =
  | { kind: 'loading' }
  | { kind: 'offline' }
  | { kind: 'live'; fetchedAt: string; updatedAt?: string }

export function formatBangkok(iso?: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return (
    d.toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    ' (UTC+7)'
  )
}
