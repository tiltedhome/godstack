import { expect, it } from 'vitest'
import { BIRTH, CUES, LEAP_CUES, MODES, TAPS, degreeSemis, harmonicSemis, infinity, modeFor, rootSemis, thueMorse, tickFor } from '../src/audio.ts'
import { BEATS, LAYERS } from '../src/lore.ts'

it('plays Nørgård’s infinity series', () => {
  expect(Array.from({ length: 16 }, (_, n) => infinity(n))).toEqual([0, 1, -1, 2, 1, 0, -2, 3, -1, 2, 0, 1, 2, -1, -3, 4])
})

it('is self-similar: every second note is the whole series, inverted', () => {
  for (let n = 0; n < 512; n++) expect(infinity(2 * n) + infinity(n)).toBe(0)
})

it('gates rhythm with Thue–Morse', () => {
  expect(Array.from({ length: 16 }, (_, n) => thueMorse(n)).join('')).toBe('0110100110010110')
})

it('tunes the eight substrates to the first eight harmonics of one string, in just intonation', () => {
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
  // the eighth harmonic is the fundamental again, three octaves up: the loop closing
  expect(roots[7]).toBeCloseTo(0, 9)
  expect(harmonicSemis(8)).toBeCloseTo(0, 9)
  expect([-1, 0, 4, 5, 7].map((d) => degreeSemis(d))).toEqual([-3, 0, 9, 12, 16])
})

it('retunes the string a fifth higher every loop, deals the modes round and quickens the pulse', () => {
  for (let loop = 1; loop < 6; loop++) expect((rootSemis(0, loop + 1) - rootSemis(0, loop) + 12) % 12).toBe(7)
  expect(MODES).toHaveLength(7)
  expect(new Set(MODES.map((m) => m.join(','))).size).toBe(7)
  for (const m of MODES) expect(m).toHaveLength(5)
  LAYERS.forEach((_, i) => {
    expect(modeFor(i, 1)).toBe(MODES[i % 7])
    expect(modeFor(i, 2)).toBe(MODES[(i + 1) % 7])
    expect(modeFor(i, 8)).toBe(MODES[i % 7])
    expect(tickFor(i, 2)).toBeLessThan(tickFor(i, 1))
    if (i) expect(tickFor(i)).toBeLessThan(tickFor(i - 1))
  })
  // it never gets frantic, however many times round
  expect(tickFor(7, 99)).toBeGreaterThan(0.29)
})

it('has a sound for every beat of every level, for each birth, and for a tap', () => {
  for (const L of LAYERS) {
    expect(CUES[L.id], L.id).toHaveLength(BEATS.length)
    expect(BIRTH[L.id].length).toBeGreaterThan(1)
    expect(TAPS[L.id].length).toBeGreaterThan(1)
  }
  // a tap sounds different on every substrate, and so does a birth
  expect(new Set(LAYERS.map((L) => TAPS[L.id])).size).toBe(LAYERS.length)
  expect(new Set(LAYERS.map((L) => BIRTH[L.id])).size).toBe(LAYERS.length)
  // through the leap: gather, be born, divide, in that order
  expect(LEAP_CUES.map(([, what]) => what)).toEqual(['swell', 'birth', 'divide'])
  LEAP_CUES.forEach(([at], i) => {
    expect(at).toBeGreaterThan(0)
    expect(at).toBeLessThan(1)
    if (i) expect(at).toBeGreaterThan(LEAP_CUES[i - 1][0])
  })
})
