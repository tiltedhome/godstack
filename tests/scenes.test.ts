import { expect, it } from 'vitest'
import { SCENES, linkProgress, setLoop } from '../src/scenes.ts'
import { DUR, LAST, frame, initial } from '../src/engine.ts'
import { LAYERS } from '../src/lore.ts'

// the linking, as the scenes see it: none until the seventh beat, complete by the leap
const linkedAt = (beat: number, part: number) => linkProgress(frame({ ...initial(0, 1, beat), t: DUR.settle * part }, DUR))

it('gives every substrate a real network that percolates on the beat where it hits its ceiling', () => {
  setLoop(1)
  expect(SCENES).toHaveLength(LAYERS.length)
  SCENES.forEach((scene, i) => {
    const g = scene.graph
    // the readout is the drawn graph's real mean degree, 2E/N, so it has to be honest
    for (let beat = 0; beat < LAST - 1; beat++) expect(g.meanDegree(linkedAt(beat, 1)), LAYERS[i].id).toBeLessThan(0.5)
    expect(g.meanDegree(linkedAt(LAST - 1, 0.3)), LAYERS[i].id).toBeLessThan(1)
    // past 1 a giant connected component appears (Erdős and Rényi): the copies are one crowd
    expect(g.meanDegree(linkedAt(LAST - 1, 1)), LAYERS[i].id).toBeGreaterThanOrEqual(1)
    expect(g.meanDegree(linkedAt(LAST, 1)), LAYERS[i].id).toBeGreaterThanOrEqual(1)
  })
})

it('puts the new substrate at the centre and the old one on one of the units', () => {
  for (const scene of SCENES) {
    expect(scene.focus).toEqual([0, 0])
    const [x, y] = scene.socket(1)
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
    // on the stage, and not on top of where the new unit will form
    expect(Math.hypot(x, y)).toBeLessThan(110)
    expect(Math.hypot(x, y)).toBeGreaterThan(2)
  }
})

it('lets later loops link up sooner, and never later', () => {
  setLoop(1)
  const first = SCENES.map((s) => s.graph.meanDegree(linkedAt(LAST - 1, 0.5)))
  setLoop(5)
  const fifth = SCENES.map((s) => s.graph.meanDegree(linkedAt(LAST - 1, 0.5)))
  fifth.forEach((k, i) => expect(k).toBeGreaterThan(first[i]))
  setLoop(1)
})

it('answers a tap differently on every substrate: that is the lesson', () => {
  const words = SCENES.map((s) => s.poke(10, 10, 1))
  for (const w of words) expect(w.length).toBeGreaterThan(8)
  expect(new Set(words).size).toBe(SCENES.length)
  // the Structure cannot be damaged; the Element cannot heal; the Gene mends, mostly
  expect(words[0]).toBe('nothing to flip')
  expect(words[2]).toMatch(/stays out/)
  expect(words[3]).toMatch(/mended/)
  const gene = SCENES[3]
  const tries = Array.from({ length: 8 }, () => gene.poke(10, 10, 1))
  expect(tries.filter((w) => /mutation/.test(w)).length).toBe(2)
  for (const s of SCENES) s.reset()
})
