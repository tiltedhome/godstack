import { describe, expect, it } from 'vitest'
import { DUR, LAST, NBEATS, backward, forward, frame, holdFor, initial, leapt, progress, readingTime, skip, step } from '../src/engine.ts'
import { BEATS, LAYERS } from '../src/lore.ts'

const N = LAYERS.length
const run = (s = initial(), seconds: number, playing = true, dwell = 10, dt = 0.05) => {
  for (let t = 0; t < seconds; t += dt) s = step(s, dt, playing, DUR, N, dwell)
  return s
}

describe('engine', () => {
  it('has five beats a level', () => {
    expect(NBEATS).toBe(BEATS.length)
    expect(LAST).toBe(4)
  })

  it('plays itself, holding each beat for as long as it takes to read', () => {
    let s = run(initial(), 9.9)
    expect(s.beat).toBe(0)
    s = run(s, 0.3)
    expect(s).toMatchObject({ beat: 1, from: 0 })
    // the last beat is held for its text, then dives
    s = run(initial(0, 1, LAST), 9.8)
    expect(s.phase).toBe('read')
    s = run(s, 0.4)
    expect(s.phase).toBe('zoom')
    s = run(s, DUR.zoom + 0.1)
    expect(s).toMatchObject({ index: 1, octave: 1, beat: 0, phase: 'read' })
  })

  it('waits for ever once it is paused', () => {
    expect(run(initial(), 600, false)).toMatchObject({ index: 0, beat: 0, phase: 'read' })
    expect(run(initial(2, 1, LAST), 600, false)).toMatchObject({ index: 2, beat: LAST, phase: 'read' })
  })

  it('never cuts the pile-up short of forming, however short its text', () => {
    const s = initial(3, 1, LAST)
    expect(holdFor(s, DUR, 1)).toBeGreaterThan(DUR.leap)
    expect(run(s, DUR.leap + 1, true, 1).phase).toBe('read')
    expect(run(s, DUR.leap + 2.2, true, 1).phase).toBe('zoom')
  })

  it('gives longer text longer, at about the speed people read', () => {
    expect(readingTime(440)).toBeGreaterThan(readingTime(260) + 6)
    const lengths = LAYERS.flatMap((L) => BEATS.map((b) => L.beats[b].text.length))
    // nothing flashes past, and nothing is on screen for half a minute
    expect(readingTime(Math.min(...lengths))).toBeGreaterThan(10)
    expect(readingTime(Math.max(...lengths))).toBeLessThan(22)
    // the whole loop takes about a quarter of an hour, not the half hour the last cut did
    const total = lengths.reduce((a, n) => a + readingTime(n), 0) + N * (DUR.leap + DUR.zoom)
    expect(total / 60).toBeGreaterThan(10)
    expect(total / 60).toBeLessThan(15)
  })

  it('counts down on the button', () => {
    const s = initial()
    expect(progress(s, DUR, 10)).toBe(0)
    expect(progress({ ...s, t: 5 }, DUR, 10)).toBeCloseTo(0.5)
    expect(progress({ ...s, t: 50 }, DUR, 10)).toBe(1)
    expect(progress({ ...s, phase: 'zoom' }, DUR, 10)).toBe(1)
  })

  it('goes forward a beat at a time, and lets the pile-up finish before it dives', () => {
    let s = initial()
    for (let b = 1; b <= LAST; b++) {
      s = forward(s, DUR)
      expect(s).toMatchObject({ beat: b, from: b - 1, t: 0, phase: 'read' })
    }
    expect(leapt(s, DUR)).toBe(false)
    s = forward(s, DUR)
    expect(s).toMatchObject({ beat: LAST, phase: 'read', t: DUR.leap })
    expect(leapt(s, DUR)).toBe(true)
    s = forward(s, DUR)
    expect(s.phase).toBe('zoom')
    expect(forward(s, DUR)).toBe(s)
  })

  it('goes back a beat, across levels and loops, and stops at the very beginning', () => {
    expect(backward(initial(), N, DUR)).toEqual(initial())
    expect(backward(initial(2, 1, 3), N, DUR)).toMatchObject({ index: 2, beat: 2, from: 3 })
    expect(backward(initial(2), N, DUR)).toMatchObject({ index: 1, octave: 1, beat: LAST, t: DUR.leap })
    expect(backward(initial(0, 3), N, DUR)).toMatchObject({ index: N - 1, octave: 2, beat: LAST })
    expect(backward({ ...initial(1, 1, LAST), phase: 'zoom' }, N, DUR)).toMatchObject({ index: 1, phase: 'read', t: DUR.leap })
  })

  it('skips to the next level, and wraps round into the next loop', () => {
    let s = skip(initial(4, 1, 1))
    expect(s).toMatchObject({ index: 4, beat: LAST, phase: 'zoom', t: 0 })
    expect(skip(s)).toBe(s)
    s = run(s, DUR.zoom + 0.1)
    expect(s).toMatchObject({ index: 5, octave: 1, beat: 0 })
    s = run(skip(initial(N - 1, 2)), DUR.zoom + 0.1)
    expect(s).toMatchObject({ index: 0, octave: 3, beat: 0 })
  })

  it('tells the scenes where they are', () => {
    expect(frame(initial(), DUR)).toEqual({ beat: 0, from: 0, u: 0, age: 0, leap: 0, dive: 0 })
    const eased = frame({ ...initial(0, 1, 2), t: DUR.settle }, DUR)
    expect(eased).toMatchObject({ beat: 2, u: 1, leap: 0, age: DUR.settle })
    const half = frame({ ...initial(0, 1, LAST), t: DUR.leap / 2 }, DUR)
    expect(half.leap).toBeCloseTo(0.5)
    expect(frame({ ...initial(0, 1, LAST), t: 99 }, DUR).leap).toBe(1)
    const diving = frame({ ...initial(0, 1, LAST), phase: 'zoom', t: DUR.zoom / 2 }, DUR)
    expect(diving).toMatchObject({ beat: LAST, u: 1, leap: 1 })
    expect(diving.dive).toBeCloseTo(0.5)
  })
})
