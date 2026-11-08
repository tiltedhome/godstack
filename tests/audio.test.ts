import { expect, it } from 'vitest'
import { CUES, degreeSemis, infinity, rootSemis, thueMorse } from '../src/audio.ts'
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

it('climbs a fifth per generation and lands on the pentatonic scale', () => {
  expect(LAYERS.map((_, i) => rootSemis(i))).toEqual([0, 7, 2, 9, 4, 11, 6])
  expect([-1, 0, 4, 5, 7].map((d) => degreeSemis(d))).toEqual([-3, 0, 9, 12, 16])
})

it('cues sound effects for every scene, in order, inside the accident', () => {
  for (const L of LAYERS) {
    const cues = CUES[L.id]
    expect(cues.length).toBeGreaterThanOrEqual(5)
    cues.forEach(([p], i) => {
      expect(p).toBeGreaterThan(0)
      expect(p).toBeLessThanOrEqual(1)
      if (i) expect(p).toBeGreaterThanOrEqual(cues[i - 1][0])
    })
  }
})

it('keeps climbing by fifths across the universe boundary instead of resetting', async () => {
  const { absoluteGeneration } = await import('../src/audio.ts')
  const seq = [1, 2].flatMap((octave) => LAYERS.map((_, index) => rootSemis(absoluteGeneration({ index, octave }))))
  for (let i = 1; i < seq.length; i++) expect((seq[i] - seq[i - 1] + 12) % 12).toBe(7)
  // C# at the Verdict, then G# for the next Tortoise (not back to G)
  expect(seq.slice(6, 8)).toEqual([6, 1])
})
