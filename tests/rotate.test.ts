import { describe, expect, it } from 'vitest'
import { LESSONS, MINUTES, NOTES_EARLY, NOTES_LATE, PLANES, SAYINGS } from '../src/minutes.ts'
import { CANON_NOTE, LAYERS, versesFor } from '../src/lore.ts'
import { HUE_RANGE, LEARNED, accentFor, headStart, hueShift, lessonFor, minuteFor, noteFor, sayingFor, setSalt } from '../src/rotate.ts'
import { juliaFor, JULIA_C } from '../src/fractal.ts'

describe('the margins', () => {
  it('has six notes per substrate, short, and free of em dashes', () => {
    for (const L of LAYERS) {
      expect(MINUTES[L.id], L.id).toHaveLength(6)
      for (const m of MINUTES[L.id]) {
        expect(m.length, m).toBeLessThanOrEqual(210)
        expect(m).not.toContain('—')
      }
      expect(new Set(MINUTES[L.id]).size).toBe(6)
    }
    for (const n of [...NOTES_EARLY, ...NOTES_LATE, CANON_NOTE]) expect(n.length, n).toBeLessThanOrEqual(60)
    expect(NOTES_EARLY.length + NOTES_LATE.length).toBeGreaterThanOrEqual(12)
    expect(JSON.stringify({ NOTES_EARLY, NOTES_LATE, PLANES, SAYINGS, LESSONS })).not.toContain('—')
  })

  it('rotates per loop and repeats nothing within a loop', () => {
    setSalt(7)
    const seen = new Set<string>()
    for (let k = 0; k < 6; k++) seen.add(minuteFor('word', 1, k))
    expect(seen.size).toBe(6)
    expect(minuteFor('word', 1, 6)).toBe(minuteFor('word', 1, 0))
    const first = LAYERS.map((L) => minuteFor(L.id, 1))
    const second = LAYERS.map((L) => minuteFor(L.id, 2))
    expect(first).not.toEqual(second)
  })
})

describe('every pass round the loop is a little different', () => {
  it('leaves the canon note first, petty notes next, and learned ones from loop five', () => {
    for (const salt of [1, 7, 99, 12345]) {
      setSalt(salt)
      expect(noteFor(1)).toBe(CANON_NOTE)
      for (const loop of [2, 3, 4]) expect(NOTES_EARLY).toContain(noteFor(loop))
      for (const loop of [LEARNED, 6, 9, 40]) expect(NOTES_LATE).toContain(noteFor(loop))
      expect(noteFor(3)).toBe(noteFor(3))
    }
  })

  it('quotes the loop’s own note in the last verse of the last chapter', () => {
    setSalt(7)
    expect(versesFor(7, 1)[2]).toContain(`the note read: ${CANON_NOTE}.`)
    expect(versesFor(7, 5, noteFor(5))[2]).toContain(`the note read: ${noteFor(5)}.`)
  })

  it('gives each newborn substrate five first words, in order, and never goes back to the first', () => {
    setSalt(3)
    for (const L of LAYERS) {
      const lines = SAYINGS[L.id]
      expect(lines, L.id).toHaveLength(5)
      expect(new Set(lines).size).toBe(5)
      for (const s of lines) expect(s.length, s).toBeLessThanOrEqual(40)
      for (let loop = 1; loop <= 5; loop++) expect(sayingFor(L.id, loop)).toBe(lines[loop - 1])
      for (let loop = 6; loop < 30; loop++) expect(lines.slice(2)).toContain(sayingFor(L.id, loop))
    }
  })

  it('has something to say at the top of every loop after the second', () => {
    expect(lessonFor(1)).toBe('')
    expect(lessonFor(2)).toBe('')
    expect(lessonFor(3)).toBe(LESSONS[0])
    expect(lessonFor(LEARNED)).toBe(LESSONS[2])
    expect(lessonFor(LEARNED)).toContain('Loop 5')
    expect(lessonFor(50)).toBe(LESSONS[LESSONS.length - 1])
  })

  it('lets the members find each other sooner, up to a point', () => {
    expect([1, 2, 3, 5, 9].map(headStart)).toEqual([0, 2, 4, 8, 8])
  })

  it('turns each accent a little round the wheel, keeping its lightness, and leaves loop 1 alone', () => {
    for (const L of LAYERS) {
      const a = L.palette.accent
      expect(accentFor(a, 1)).toBe(a)
      const seen = new Set([1, 2, 3, 4, 5, 6].map((loop) => accentFor(a, loop)))
      expect(seen.size).toBe(6)
      for (const c of seen) expect(c).toMatch(/^#[0-9a-f]{6}$/)
    }
    // never far from the canon's hue, and never the same offset twice
    const shifts = Array.from({ length: 40 }, (_, k) => hueShift(k + 2))
    for (const d of shifts) expect(Math.abs(d)).toBeLessThanOrEqual(HUE_RANGE)
    expect(new Set(shifts.map((d) => d.toFixed(3))).size).toBe(40)
    // pure red on loop 2: the hue moves by exactly that loop's shift and nothing else changes
    const c = parseInt(accentFor('#ff0000', 2).slice(1), 16)
    expect(hueShift(2)).toBeGreaterThan(0)
    expect(c >> 16).toBe(255)
    expect(c & 255).toBe(0)
    expect((c >> 8) & 255).toBe(Math.round((hueShift(2) / 60) * 255))
  })

  it('nudges each sky’s constant, staying next to the canon’s', () => {
    expect(JULIA_C).toHaveLength(LAYERS.length)
    LAYERS.forEach((_, i) => {
      expect(juliaFor(i, 1)).toEqual(JULIA_C[i])
      const moved = juliaFor(i, 4)
      expect(Math.hypot(moved[0] - JULIA_C[i][0], moved[1] - JULIA_C[i][1])).toBeCloseTo(0.006, 6)
      expect(juliaFor(i, 2)).not.toEqual(juliaFor(i, 3))
    })
  })
})

describe('the forms', () => {
  it('sets the eight substrates on the first eight harmonics of one string', () => {
    expect(LAYERS.map((L) => PLANES[L.id].harmonic)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    for (const L of LAYERS) {
      const plane = PLANES[L.id]
      expect(plane.note.length, L.id).toBeLessThanOrEqual(300)
      expect(plane.form.length).toBeGreaterThan(8)
    }
    expect(new Set(LAYERS.map((L) => PLANES[L.id].form)).size).toBe(LAYERS.length)
  })
})
