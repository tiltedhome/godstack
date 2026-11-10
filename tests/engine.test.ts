import { describe, expect, it } from 'vitest'
import { DUR, advance, back, initial, progress, step, trigger } from '../src/engine.ts'

const N = 7
const run = (s = initial(), seconds: number, autoplay = true, dt = 0.05) => {
  for (let t = 0; t < seconds; t += dt) s = step(s, dt, autoplay, DUR, N)
  return s
}

describe('engine', () => {
  it('waits in idle without autoplay', () => {
    expect(run(initial(), 30, false)).toMatchObject({ index: 0, phase: 'idle' })
  })

  it('autoplays idle → act → hold → zoom → next idle', () => {
    let s = run(initial(), DUR.autoIdle + 0.1)
    expect(s.phase).toBe('act')
    s = run(s, DUR.act + 0.1)
    expect(s.phase).toBe('hold')
    s = run(s, DUR.hold + 0.1)
    expect(s.phase).toBe('zoom')
    s = run(s, DUR.zoom + 0.1)
    expect(s).toMatchObject({ index: 1, octave: 1, phase: 'idle' })
  })

  it('wraps from the top plane back to the bottom, one loop on', () => {
    const s = run(advance(initial(6, 1)), DUR.zoom + 0.1)
    expect(s).toMatchObject({ index: 0, octave: 2, phase: 'idle' })
  })

  it('trigger starts the accident, then skips to its end', () => {
    const a = trigger(initial())
    expect(a.phase).toBe('act')
    expect(trigger(a).phase).toBe('hold')
    const z = { ...a, phase: 'zoom' as const }
    expect(trigger(z)).toBe(z)
  })

  it('back steps down a plane and across loops, but not below the first plane', () => {
    expect(back(initial(3, 1), N)).toMatchObject({ index: 2, octave: 1 })
    expect(back(initial(0, 2), N)).toMatchObject({ index: 6, octave: 1 })
    expect(back(initial(0, 1), N)).toMatchObject({ index: 0, octave: 1 })
  })

  it('reports drawing progress', () => {
    expect(progress(initial(), DUR)).toBe(0)
    expect(progress({ ...initial(), phase: 'act', t: DUR.act / 2 }, DUR)).toBeCloseTo(0.5)
    expect(progress({ ...initial(), phase: 'zoom', t: 0 }, DUR)).toBe(1)
  })
})
