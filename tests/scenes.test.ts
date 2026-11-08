import { expect, it } from 'vitest'
import { SCENES } from '../src/scenes.ts'
import { LAYERS } from '../src/lore.ts'

it('gives every collective a real network that percolates right as the One emerges', () => {
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
