import { expect, it } from 'vitest'
import { CUES, MODES, TAPS, degreeSemis, harmonicSemis, infinity, modeFor, rootSemis, thueMorse, tickFor } from '../src/audio.ts'
import { LAYERS } from '../src/lore.ts'

it('plays Nørgård’s infinity series', () => {
  expect(Array.from({ length: 16 }, (_, n) => infinity(n))).toEqual([0, 1, -1, 2, 1, 0, -2, 3, -1, 2, 0, 1, 2, -1, -3, 4])
})

it('is self-similar: every second note is the whole series, inverted', () => {
  for (let n = 0; n < 512; n++) expect(infinity(2 * n) + infinity(n)).toBe(0)
})

it('gates rhythm with Thue–Morse', () => {
  expect(Array.from({ length: 16 }, (_, n) => thueMorse(n)).join('')).toBe('0110100110010110')
})

it('tunes the seven planes to the first seven harmonics of one string, in just intonation', () => {
  const roots = LAYERS.map((_, i) => rootSemis(i))
  // octaves land back on the fundamental; the fifth is 2 cents sharp of the piano's
  expect(roots[0]).toBe(0)
  expect(roots[1]).toBeCloseTo(0, 9)
  expect(roots[3]).toBeCloseTo(0, 9)
  expect(roots[2]).toBeCloseTo(7.02, 2)
  expect(roots[5]).toBeCloseTo(7.02, 2)
  // the just major third is 14 cents flat, and the seventh harmonic 31 cents flat
  expect(roots[4]).toBeCloseTo(4 - 0.1369, 3)
  expect(roots[6]).toBeCloseTo(10 - 0.3117, 3)
  expect(harmonicSemis(8)).toBeCloseTo(0, 9)
  expect([-1, 0, 4, 5, 7].map((d) => degreeSemis(d))).toEqual([-3, 0, 9, 12, 16])
})

it('retunes the string a fifth higher every loop, deals the modes round and quickens the pulse', () => {
  for (let loop = 1; loop < 6; loop++) expect((rootSemis(0, loop + 1) - rootSemis(0, loop) + 12) % 12).toBe(7)
  expect(MODES).toHaveLength(LAYERS.length)
  expect(new Set(MODES.map((m) => m.join(','))).size).toBe(LAYERS.length)
  for (const m of MODES) expect(m).toHaveLength(5)
  LAYERS.forEach((_, i) => {
    expect(modeFor(i, 1)).toBe(MODES[i])
    expect(modeFor(i, 2)).toBe(MODES[(i + 1) % 7])
    expect(modeFor(i, 8)).toBe(MODES[i])
    expect(tickFor(i, 2)).toBeLessThan(tickFor(i, 1))
    if (i) expect(tickFor(i)).toBeLessThan(tickFor(i - 1))
  })
  // it never gets frantic, however many times round
  expect(tickFor(6, 99)).toBeGreaterThan(0.3)
})

it('cues sound effects for every scene, in order, inside the story', () => {
  for (const L of LAYERS) {
    const cues = CUES[L.id]
    expect(cues.length).toBeGreaterThanOrEqual(5)
    cues.forEach(([p], i) => {
      expect(p).toBeGreaterThan(0)
      expect(p).toBeLessThanOrEqual(1)
      if (i) expect(p).toBeGreaterThanOrEqual(cues[i - 1][0])
    })
    expect(TAPS[L.id].word.length).toBeGreaterThan(2)
  }
  // a tap does something different on every plane
  expect(new Set(LAYERS.map((L) => TAPS[L.id].word)).size).toBe(LAYERS.length)
})
