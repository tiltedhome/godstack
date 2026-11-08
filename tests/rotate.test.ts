import { describe, expect, it } from 'vitest'
import { DIMENSIONS, MINUTES, NOTES } from '../src/minutes.ts'
import { LAYERS } from '../src/lore.ts'
import { minuteFor, noteFor, setSalt } from '../src/rotate.ts'
import { cube, tierDimension } from '../src/hyper.ts'
import { MODES, tickFor } from '../src/audio.ts'

describe('the minutes', () => {
  it('has a dozen lines per collective, short, and free of em dashes', () => {
    for (const L of LAYERS) {
      expect(MINUTES[L.id], L.id).toHaveLength(12)
      for (const m of MINUTES[L.id]) {
        expect(m.length, m).toBeLessThanOrEqual(180)
        expect(m).not.toContain('—')
      }
      expect(new Set(MINUTES[L.id]).size).toBe(12)
    }
    expect(NOTES).toHaveLength(12)
    for (const n of NOTES) expect(n.length, n).toBeLessThanOrEqual(60)
    expect(JSON.stringify({ NOTES, DIMENSIONS })).not.toContain('—')
  })

  it('rotates per universe, repeats nothing within a universe, and keeps the canon note first', () => {
    setSalt(7)
    const seen = new Set<string>()
    for (let k = 0; k < 12; k++) seen.add(minuteFor('humans', 1, k))
    expect(seen.size).toBe(12)
    expect(minuteFor('humans', 1, 12)).toBe(minuteFor('humans', 1, 0))
    const u1 = LAYERS.map((L) => minuteFor(L.id, 1))
    const u2 = LAYERS.map((L) => minuteFor(L.id, 2))
    expect(u1).not.toEqual(u2)
    expect(noteFor(1)).toBe('fewer meetings')
    expect(NOTES).toContain(noteFor(5))
    expect(noteFor(3)).toBe(noteFor(3))
  })
})

describe('the planes', () => {
  it('climbs the dimensions from the line to the point', () => {
    expect(LAYERS.map((L) => DIMENSIONS[L.id].d)).toEqual([1, 2, 3, 4, 5, 6, 9])
    expect([0, 0.3, 0.6].map((p) => tierDimension(6, p))).toEqual([7, 8, 9])
    expect([0, 1, 2, 3, 4, 5].map((i) => tierDimension(i, 0.5))).toEqual([1, 2, 3, 4, 5, 6])
    for (const L of LAYERS) expect(DIMENSIONS[L.id].note.length).toBeLessThanOrEqual(220)
  })

  it('builds real n-cubes: 2^n corners, n·2^(n-1) edges', () => {
    for (let n = 0; n <= 9; n++) {
      const g = cube(n)
      expect(g.verts).toHaveLength(2 ** n)
      expect(g.edges).toHaveLength(n * 2 ** Math.max(0, n - 1))
      for (const [a, b] of g.edges) expect(g.verts[a].filter((v, k) => v !== g.verts[b][k])).toHaveLength(1)
    }
  })

  it('gives every plane its own mode and a quickening pulse', () => {
    expect(MODES).toHaveLength(LAYERS.length)
    expect(new Set(MODES.map((m) => m.join(','))).size).toBe(LAYERS.length)
    for (const m of MODES) expect(m).toHaveLength(5)
    for (let i = 1; i < LAYERS.length; i++) expect(tickFor(i)).toBeLessThan(tickFor(i - 1))
    expect(tickFor(6)).toBeGreaterThan(0.3)
  })
})
