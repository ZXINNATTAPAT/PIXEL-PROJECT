import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { inflateSync } from 'node:zlib'
import { CHARACTER_SHEETS } from '../src/game/raster-sprites.ts'

function readPng(name: string) {
  const data = readFileSync(new URL(`../public/images/tensura/${name}`, import.meta.url))
  assert.equal(data.subarray(1, 4).toString(), 'PNG')
  assert.equal(data[24], 8, 'Assets use an 8-bit channel depth')
  assert.equal(data[25], 6, 'Assets retain RGBA transparency')
  const chunks: Buffer[] = []
  for (let offset = 8; offset < data.length;) {
    const size = data.readUInt32BE(offset)
    if (data.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(data.subarray(offset + 8, offset + 8 + size))
    offset += size + 12
  }
  // The first pixel has zero left/up predictors for every PNG filter type.
  assert.equal(inflateSync(Buffer.concat(chunks))[4], 0, 'Top-left corner is transparent')
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
}

test('every named character and goblin has a transparent square sheet with four equally sized cells', () => {
  assert.equal(Object.keys(CHARACTER_SHEETS).length, 5)
  for (const name of Object.values(CHARACTER_SHEETS)) {
    const { width, height } = readPng(name)
    assert.equal(width, height)
    assert.equal(width % 2, 0)
    assert.ok(width >= 512)
  }
})

test('the generated desk retains the composition used by the animated crystal and monitor masks', () => {
  assert.deepEqual(readPng('tempest-desk-v4.png'), { width: 1536, height: 1024 })
})
