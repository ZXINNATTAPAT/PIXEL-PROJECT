import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { tensuraLook } from '../src/game/tensura-look.ts'
import { distance, homeFor, nodeById } from '../src/game/campus.ts'
import type { Agent, OfficeData } from '../src/model.ts'

const data = JSON.parse(readFileSync(new URL('../src/data/agents.json', import.meta.url), 'utf8')) as OfficeData

test('named Tensura characters have their own theme and every uncertain identity is a goblin', () => {
  const known = new Set(['raphael', 'diablo', 'testarossa', 'michael'])
  for (const agent of data.agents) assert.equal(tensuraLook(agent).theme, known.has(agent.id) ? agent.id : 'goblin')
  assert.equal(tensuraLook({ ...data.agents[0], id: 'future-agent' } as Agent).theme, 'goblin')
  assert.equal(tensuraLook({ ...data.agents[0], id: '__proto__' } as Agent).theme, 'goblin')
})

test('every current agent has a unique permanent personal workstation', () => {
  const counts: Record<string, number> = {}
  const homes = data.agents.map((agent) => {
    const index = counts[agent.room] ?? 0
    counts[agent.room] = index + 1
    return homeFor(agent.room, index)
  })
  assert.equal(new Set(homes).size, data.agents.length)
  for (let i = 0; i < homes.length; i++) {
    for (let j = i + 1; j < homes.length; j++) {
      assert.ok(distance(nodeById.get(homes[i])!, nodeById.get(homes[j])!) >= 120, 'Personal desks have room around them')
    }
  }
})
