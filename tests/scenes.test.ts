import { expect, it } from 'vitest'
import { SCENES, setLoop } from '../src/scenes.ts'
import { LAYERS } from '../src/lore.ts'

it('gives every collective a real network that percolates right as the One emerges', () => {
  setLoop(1)
  expect(SCENES).toHaveLength(LAYERS.length)
  SCENES.forEach((scene, i) => {
    const g = scene.graph
    const at = (p: number) => g.meanDegree(p)
    // the HUD reports this number, so it must be the drawn graph's real 2E/N
    expect(at(0.3), LAYERS[i].id).toBeLessThan(1)
    expect(at(0.5), LAYERS[i].id).toBeGreaterThanOrEqual(1)
    const crossing = Array.from({ length: 101 }, (_, k) => k / 100).find((p) => at(p) >= 1)!
    expect(crossing, LAYERS[i].id).toBeGreaterThanOrEqual(0.4)
    expect(crossing, LAYERS[i].id).toBeLessThanOrEqual(0.5)
  })
})

it('puts the One at the centre and the plane below on one of the members', () => {
  for (const scene of SCENES) {
    expect(scene.focus).toEqual([0, 0])
    const [x, y] = scene.socket(1)
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
    // on the stage, and not on top of the One
    expect(Math.hypot(x, y)).toBeLessThan(110)
    expect(Math.hypot(x, y)).toBeGreaterThan(2)
  }
})

it('lets later loops percolate sooner, and never later', () => {
  const crossing = (g: (typeof SCENES)[number]['graph']) => Array.from({ length: 101 }, (_, k) => k / 100).find((p) => g.meanDegree(p) >= 1)!
  setLoop(1)
  const first = SCENES.map((s) => crossing(s.graph))
  setLoop(5)
  const fifth = SCENES.map((s) => crossing(s.graph))
  fifth.forEach((c, i) => expect(c).toBeLessThan(first[i]))
  setLoop(1)
})
