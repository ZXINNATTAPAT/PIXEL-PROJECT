import assert from 'node:assert/strict'
import { test } from 'node:test'
import { advanceActor, CAMPUS_HEIGHT, CAMPUS_ROOMS, CAMPUS_WIDTH, createActor, distance, findRoute, homeFor, nodeById, ROOM_HEIGHT, ROOM_WIDTH, sendActor, waypoints } from '../src/game/campus.ts'

test('four rooms share edges and every home connects directly through shared doors', () => {
  assert.equal(CAMPUS_WIDTH, ROOM_WIDTH * 2)
  assert.equal(CAMPUS_HEIGHT, ROOM_HEIGHT * 2)
  assert.deepEqual(CAMPUS_ROOMS.map(({ x, y }) => [x, y]), [[0, 0], [ROOM_WIDTH, 0], [0, ROOM_HEIGHT], [ROOM_WIDTH, ROOM_HEIGHT]])
  for (const node of waypoints) {
    assert.notEqual(node.room, 'hall')
    assert.ok(node.x >= 0 && node.x <= CAMPUS_WIDTH && node.y >= 0 && node.y <= CAMPUS_HEIGHT)
    for (const id of node.links) assert.ok(nodeById.get(id)?.links.includes(node.id))
    const route = findRoute(node.id, 'lounge:mid')
    assert.ok(route.length || node.id === 'lounge:mid')
    let previous = node.id
    for (const id of route) {
      assert.ok(nodeById.get(previous)!.links.includes(id))
      previous = id
    }
  }
  assert.equal(homeFor('unknown-room', 12), 'cps:home4')
  assert.deepEqual(findRoute('missing', 'lounge:mid'), [])
})

test('a walk crosses shared room doors and reaches the destination without teleporting', () => {
  const actor = createActor('test', homeFor('exec', 0), 'idle', 0)
  sendActor(actor, 'lounge:mid', true)
  assert.ok(actor.route.some((id) => id.endsWith(':north')))
  assert.ok(actor.route.every((id) => !id.startsWith('hall:')))
  for (let i = 0; i < 1000 && actor.route.length; i++) {
    const before = { x: actor.x, y: actor.y }
    advanceActor(actor, 50, false)
    assert.ok(distance(before, actor) <= 4.751)
    assert.ok(Number.isFinite(actor.x) && Number.isFinite(actor.y))
  }
  assert.equal(actor.node, 'lounge:mid')
  assert.ok(distance(actor, nodeById.get('lounge:mid')!) < .01)
})

test('changing destinations midway preserves the current safe edge', () => {
  const actor = createActor('test', homeFor('exec', 0), 'working', 0)
  sendActor(actor, 'lounge:mid', true)
  advanceActor(actor, 50, false)
  const next = actor.route[0]
  sendActor(actor, 'growth:mid', true)
  assert.equal(actor.route[0], next)
  sendActor(actor, 'missing', true)
  assert.equal(actor.route[0], next)
})

test('working agents return to their desk; reduced motion leaves idle agents still', () => {
  const actor = createActor('test', homeFor('cps', 0), 'idle', 0)
  advanceActor(actor, 5000, false)
  assert.equal(actor.route.length, 0)
  sendActor(actor, actor.home, true)
  advanceActor(actor, 50, false)
  assert.ok(Number.isFinite(actor.x))
  actor.node = 'lounge:mid'
  Object.assign(actor, { x: nodeById.get(actor.node)!.x, y: nodeById.get(actor.node)!.y, status: 'working', manual: 0 })
  advanceActor(actor, 50, false)
  assert.equal(actor.route.at(-1), actor.home)
})

test('manual visits hold at the destination before a working agent returns', () => {
  const actor = createActor('test', homeFor('exec', 0), 'working', 0)
  sendActor(actor, 'lounge:mid', true)
  for (let i = 0; i < 1000 && actor.route.length; i++) advanceActor(actor, 50, false)
  assert.equal(actor.node, 'lounge:mid')
  assert.equal(actor.manual, 15_000)
  advanceActor(actor, 1000, false)
  assert.equal(actor.route.length, 0)
  advanceActor(actor, 14_001, false)
  assert.equal(actor.route.at(-1), actor.home)
})
