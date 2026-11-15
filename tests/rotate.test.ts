import { describe, expect, it } from 'vitest'
import { JULIA_C, juliaFor } from '../src/fractal.ts'
import { LAYERS } from '../src/lore.ts'
import { CAST, CAUSE, CAUSES_EARLY, CAUSES_LATE, CAUSE_CORRECTED, GRUMBLES, HECKLES, KEVIN, LESSONS, PLANES, SAYINGS } from '../src/minutes.ts'
import { HUE_RANGE, KEVIN_TELLS, LEARNED, accentFor, calmLoop, causeFor, grumbleFor, headStart, heckleFor, hueShift, lessonFor, sayingFor, setSalt } from '../src/rotate.ts'

describe('the margin', () => {
  it('has at least four heckles a level, from a cast of four, short, and free of em dashes', () => {
    expect(Object.keys(CAST)).toEqual(['Pedant', 'Legal', 'Intern', 'Kevin'])
    for (const L of LAYERS) {
      const list = HECKLES[L.id]
      expect(list.length, L.id).toBeGreaterThanOrEqual(4)
      // all four regulars turn up at every level
      expect(new Set(list.map(([who]) => who)).size, L.id).toBe(4)
      for (const [who, text] of list) {
        expect(CAST[who]).toBeTruthy()
        expect(text.length, `${L.id} ${who}`).toBeLessThanOrEqual(220)
        expect(text.length).toBeGreaterThan(60)
        expect(text).not.toContain('—')
      }
    }
    expect(KEVIN[0]).toBe('Kevin')
  })

  it('gives the Intern an exclamation mark and Kevin something to minute', () => {
    for (const L of LAYERS) expect(HECKLES[L.id].filter(([who]) => who === 'Intern').some(([, t]) => /[!?]/.test(t)), L.id).toBe(true)
    const kevin = LAYERS.flatMap((L) => HECKLES[L.id]).filter(([who]) => who === 'Kevin').map(([, t]) => t).join(' ')
    expect(kevin.match(/[Mm]inute/g)!.length).toBeGreaterThanOrEqual(3)
  })

  it('rotates per loop and repeats nothing until every heckle has been heard', () => {
    setSalt(1234)
    for (const L of LAYERS) {
      const n = HECKLES[L.id].length
      const seen = new Set(Array.from({ length: n }, (_, k) => heckleFor(L.id, 1, k)[1]))
      expect(seen.size, L.id).toBe(n)
      expect(heckleFor(L.id, 1, n)).toEqual(heckleFor(L.id, 1, 0))
    }
    const firsts = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((loop) => heckleFor('genes', loop)[1]))
    expect(firsts.size).toBeGreaterThan(1)
  })

  it('lets Kevin explain himself to anyone who has been round five times', () => {
    setSalt(7)
    expect(heckleFor('machines', KEVIN_TELLS - 1)).not.toEqual(KEVIN)
    expect(heckleFor('machines', KEVIN_TELLS)).toEqual(KEVIN)
    expect(heckleFor('machines', KEVIN_TELLS, 1)).not.toEqual(KEVIN)
    expect(heckleFor('apes', KEVIN_TELLS)).not.toEqual(KEVIN)
  })
})

describe('the sign', () => {
  it('blames an earlier incident first, makes excuses next, and then works it out', () => {
    setSalt(99)
    expect(causeFor(1)).toBe(CAUSE)
    expect(CAUSE).toBe('an earlier incident')
    expect(CAUSE_CORRECTED).toBe('a later incident')
    for (let loop = 2; loop < LEARNED; loop++) expect(CAUSES_EARLY).toContain(causeFor(loop))
    for (let loop = LEARNED; loop < 12; loop++) expect(CAUSES_LATE).toContain(causeFor(loop))
    expect(CAUSES_EARLY).not.toContain(CAUSE)
  })

  it('fits on a road sign', () => {
    for (const c of [CAUSE, CAUSE_CORRECTED, ...CAUSES_EARLY, ...CAUSES_LATE]) {
      expect(c.length, c).toBeLessThanOrEqual(44)
      expect(c).not.toContain('—')
    }
    expect(new Set([...CAUSES_EARLY, ...CAUSES_LATE]).size).toBe(CAUSES_EARLY.length + CAUSES_LATE.length)
  })
})

describe('the traffic', () => {
  it('gives each new slowdown five first words, in order, and never goes back to the first', () => {
    setSalt(5)
    for (const L of LAYERS) {
      const list = SAYINGS[L.id]
      expect(list).toHaveLength(5)
      for (const s of list) expect(s.length, s).toBeLessThanOrEqual(28)
      expect([1, 2, 3, 4, 5].map((loop) => sayingFor(L.id, loop))).toEqual(list)
      for (let loop = 6; loop < 40; loop++) expect(list.slice(2)).toContain(sayingFor(L.id, loop))
    }
  })

  it('grumbles in turn when it is made to brake', () => {
    for (const L of LAYERS) {
      const list = GRUMBLES[L.id]
      expect(list.length).toBeGreaterThanOrEqual(5)
      for (const s of list) expect(s.length, s).toBeLessThanOrEqual(26)
      expect(Array.from({ length: list.length * 2 }, (_, k) => grumbleFor(L.id, k))).toEqual([...list, ...list])
      // nothing it grumbles is also its product's first word
      for (const s of list) expect(SAYINGS[L.id]).not.toContain(s)
    }
  })

  it('gets a little heavier every loop, up to a point, and learns to keep a gap on the third', () => {
    expect([1, 2, 3, 5, 9].map(headStart)).toEqual([0, 2, 4, 8, 8])
    expect([1, 2, 3, 4, 9].map(calmLoop)).toEqual([false, false, true, true, true])
  })

  it('has something to say at the top of every loop after the second', () => {
    expect(lessonFor(1)).toBe('')
    expect(lessonFor(2)).toBe('')
    expect(lessonFor(3)).toBe(LESSONS[0])
    expect(lessonFor(3)).toMatch(/^Loop 3\./)
    expect(lessonFor(3)).toContain('You can decline to pass it on')
    expect(lessonFor(4)).toBe(LESSONS[1])
    expect(lessonFor(40)).toBe(LESSONS[LESSONS.length - 1])
    for (const l of LESSONS) expect(l).not.toContain('—')
  })
})

describe('the look', () => {
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

  it('sets the eight levels on the first eight harmonics of one string, each round its own form', () => {
    expect(LAYERS.map((L) => PLANES[L.id].harmonic)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    for (const L of LAYERS) {
      const plane = PLANES[L.id]
      expect(plane.note.length, L.id).toBeLessThanOrEqual(320)
      expect(plane.form.length).toBeGreaterThan(8)
      expect(plane.note, L.id).toContain('road')
    }
    expect(new Set(LAYERS.map((L) => PLANES[L.id].form)).size).toBe(LAYERS.length)
  })
})
