// Vite dev/preview middleware: GET /api/agents -> office data from the Notion "Agent Status Board".
// Runs in Node only. The Notion token stays on the server and is never sent to the browser.
import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

type Status = 'idle' | 'working' | 'waiting' | 'done' | 'blocked'
const STATUSES: Status[] = ['idle', 'working', 'waiting', 'done', 'blocked']
const ROOM_MAP: Record<string, string> = { executive: 'exec', cps: 'cps', 'growth/ops': 'growth', growth: 'growth' }
const CACHE_MS = 15_000
const NOTION_VERSION = '2022-06-28'

interface SampleAgent {
  id: string
  agentId?: string
  name: string
  short: string
  room: string
  status: Status
  task: string
  look: { hair: string; skin: string; shirt: string; longHair?: boolean; accessory?: string }
}
interface SampleData {
  rooms: { id: string; name: string; accent: string }[]
  agents: SampleAgent[]
}

interface Options {
  token?: string
  databaseId?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
const plain = (arr: Json[] | undefined) => (arr ?? []).map((x) => x.plain_text ?? '').join('').trim()

function placeholder(status: Status): string {
  switch (status) {
    case 'working':
      return 'Working (no task details yet)'
    case 'waiting':
      return 'Waiting for your decision'
    case 'blocked':
      return 'Blocked (no details yet)'
    case 'done':
      return 'Finished the last task'
    default:
      return 'No current task'
  }
}

const DEFAULT_LOOK = { hair: '#3b2a20', skin: '#e8b991', shirt: '#6c7a89' }

function loadSample(): SampleData {
  return JSON.parse(readFileSync(resolve(process.cwd(), 'src/data/agents.json'), 'utf8')) as SampleData
}

async function queryAll(token: string, databaseId: string): Promise<Json[]> {
  const rows: Json[] = []
  let cursor: string | undefined
  for (let page = 0; page < 20; page++) {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cursor ? { page_size: 100, start_cursor: cursor } : { page_size: 100 }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`Notion API returned HTTP ${res.status}`)
    const data: Json = await res.json()
    rows.push(...(data.results ?? []))
    if (!data.has_more || !data.next_cursor) break
    cursor = data.next_cursor
  }
  return rows
}

function mapRows(rows: Json[], sample: SampleData) {
  const byAgentId = new Map<string, SampleAgent>()
  const byName = new Map<string, SampleAgent>()
  for (const a of sample.agents) {
    if (a.agentId) byAgentId.set(a.agentId, a)
    byAgentId.set(a.id, a)
    byName.set(norm(a.name), a)
  }
  let latest = ''
  const usedIds = new Set<string>()
  const agents = rows.map((row, i) => {
    const p = row.properties ?? {}
    const name = plain(p['Agent']?.title) || `Agent ${i + 1}`
    const agentId = plain(p['Agent ID']?.rich_text)
    const statusRaw = (p['Status']?.select?.name ?? 'idle').toLowerCase()
    const status: Status = (STATUSES as string[]).includes(statusRaw) ? (statusRaw as Status) : 'idle'
    const roomRaw = (p['Room']?.select?.name ?? '').toLowerCase()
    const task = plain(p['Current Task']?.rich_text)
    const updated: string = p['Updated']?.last_edited_time ?? row.last_edited_time ?? ''
    if (updated > latest) latest = updated

    const match = (agentId && byAgentId.get(agentId)) || byName.get(norm(name))
    let id = match?.id ?? (agentId || `notion-${row.id}`)
    if (usedIds.has(id)) id = `${id}-${i}`
    usedIds.add(id)
    return {
      id,
      agentId: agentId || undefined,
      name,
      short: match?.short ?? name.split(/\s*[·•|]\s*/)[0],
      room: ROOM_MAP[roomRaw] ?? match?.room ?? 'growth',
      status,
      task: task || placeholder(status),
      look: match?.look ?? DEFAULT_LOOK,
      updated,
      matched: Boolean(match),
    }
  })
  // keep the familiar desk order from the sample file; unknown agents go last
  const order = new Map(sample.agents.map((a, i) => [a.id, i]))
  agents.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
  return { agents, latest }
}

export function notionAgentsPlugin(opts: Options): Plugin {
  let cache: { at: number; body: string } | null = null
  let inflight: Promise<string> | null = null

  const build = async (): Promise<string> => {
    const sample = loadSample()
    const rows = await queryAll(opts.token!, opts.databaseId!)
    const { agents, latest } = mapRows(rows, sample)
    return JSON.stringify({
      _note: 'LIVE data from the Notion "Agent Status Board".',
      source: 'notion',
      fetchedAt: new Date().toISOString(),
      updatedAt: latest,
      rooms: sample.rooms,
      agents,
    })
  }

  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    const send = (code: number, body: string) => {
      res.statusCode = code
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(body)
    }
    if (req.method && req.method !== 'GET') return send(405, JSON.stringify({ error: 'Method not allowed' }))
    if (!opts.token || !opts.databaseId)
      return send(502, JSON.stringify({ error: 'Notion is not configured (missing NOTION_TOKEN / NOTION_DATABASE_ID in .env.local)' }))
    try {
      if (!cache || Date.now() - cache.at > CACHE_MS) {
        inflight ??= build().finally(() => (inflight = null))
        cache = { at: Date.now(), body: await inflight }
      }
      send(200, cache.body)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error'
      // never include request headers / token in the message
      send(502, JSON.stringify({ error: `Could not read Notion: ${msg.replace(/(ntn_|secret_)\w+/g, '[redacted]')}` }))
    }
  }

  return {
    name: 'pixel-office-notion-agents',
    configureServer(server) {
      server.middlewares.use('/api/agents', (req, res) => void handler(req, res))
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/agents', (req, res) => void handler(req, res))
    },
  }
}
