import { describe, expect, it } from 'vitest'
import { DUR, LAST, NBEATS, backward, forward, frame, initial, leapt, readingTime, skip, step } from '../src/engine.ts'
import { BEATS, LAYERS } from '../src/lore.ts'

const N = LAYERS.length
const run = (s = initial(), seconds: number, autoplay = true, dwell = 10, dt = 0.05) => {
  for (let t = 0; t < seconds; t += dt) s = step(s, dt, autoplay, DUR, N, dwell)
  return s
}

describe('engine', () => {
  it('has a beat for each of the eight questions', () => {
    expect(NBEATS).toBe(BEATS.length)
    expect(LAST).toBe(7)
  })

  it('waits for the reader: without autoplay nothing ever moves on', () => {
    expect(run(initial(), 600, false)).toMatchObject({ index: 0, beat: 0, phase: 'read' })
    const leap = run(initial(2, 1, LAST), 600, false)
    expect(leap).toMatchObject({ index: 2, beat: LAST, phase: 'read' })
  })

  it('reads on by itself under autoplay, holding each beat for as long as it takes to read', () => {
    let s = run(initial(), 9.9)
    expect(s.beat).toBe(0)
    s = run(s, 0.3)
    expect(s).toMatchObject({ beat: 1, from: 0 })
    // the last beat is held for its text and then for the leap to play out
    s = run(initial(0, 1, LAST), 10 + DUR.leap - 0.2)
    expect(s.phase).toBe('read')
    s = run(s, 0.4)
    expect(s.phase).toBe('zoom')
    s = run(s, DUR.zoom + 0.1)
    expect(s).toMatchObject({ index: 1, octave: 1, beat: 0, phase: 'read' })
  })

  it('gives longer text longer to be read', () => {
    expect(readingTime(480)).toBeGreaterThan(readingTime(200) + 10)
    // the longest beat in the canon gets over half a minute, the shortest still several seconds
    const lengths = LAYERS.flatMap((L) => BEATS.map((b) => L.beats[b].text.length))
    expect(readingTime(Math.max(...lengths))).toBeGreaterThan(30)
    expect(readingTime(Math.min(...lengths))).toBeGreaterThan(8)
  })

  it('steps forward a beat at a time, lets the leap finish, then pulls back', () => {
    let s = initial()
    for (let b = 1; b <= LAST; b++) {
      s = forward(s, DUR)
      expect(s).toMatchObject({ beat: b, from: b - 1, t: 0, phase: 'read' })
    }
    // on the leap, the first press only hurries it to its end
    expect(leapt(s, DUR)).toBe(false)
    s = forward(s, DUR)
    expect(s).toMatchObject({ beat: LAST, phase: 'read', t: DUR.leap })
    expect(leapt(s, DUR)).toBe(true)
    s = forward(s, DUR)
    expect(s.phase).toBe('zoom')
    expect(forward(s, DUR)).toBe(s)
  })

  it('wraps from the last substrate back to the first, one loop on', () => {
    const s = run(skip(initial(N - 1, 1)), DUR.zoom + 0.1)
    expect(s).toMatchObject({ index: 0, octave: 2, beat: 0, phase: 'read' })
  })

  it('steps back a beat, then into the end of the level below, but not before the beginning', () => {
    expect(backward(initial(3, 1, 4), N, DUR)).toMatchObject({ index: 3, beat: 3, from: 4 })
    expect(backward(initial(3, 1, 0), N, DUR)).toMatchObject({ index: 2, octave: 1, beat: LAST, t: DUR.leap })
    expect(backward(initial(0, 2, 0), N, DUR)).toMatchObject({ index: N - 1, octave: 1, beat: LAST })
    const start = initial(0, 1, 0)
    expect(backward(start, N, DUR)).toBe(start)
  })

  it('tells the scenes what to draw', () => {
    expect(frame(initial(), DUR)).toMatchObject({ beat: 0, u: 0, link: 0, leap: 0 })
    expect(frame({ ...initial(0, 1, 2), t: DUR.settle }, DUR)).toMatchObject({ beat: 2, u: 1, link: 0, leap: 0 })
    // the copies link up across the seventh beat, and stay linked through the leap
    expect(frame({ ...initial(0, 1, 6), t: DUR.settle / 2 }, DUR).link).toBeCloseTo(0.5)
    expect(frame({ ...initial(0, 1, LAST), t: DUR.leap / 2 }, DUR)).toMatchObject({ link: 1, leap: 0.5 })
    expect(frame(skip(initial()), DUR)).toMatchObject({ beat: LAST, u: 1, link: 1, leap: 1 })
  })
})
