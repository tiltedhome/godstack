import { afterEach, describe, expect, it } from 'vitest'
import { DUR, LAST, frame, initial, type Frame } from '../src/engine.ts'
import { LAYERS } from '../src/lore.ts'
import { GRUMBLES } from '../src/minutes.ts'
import { ZOOM, dive } from '../src/render.ts'
import { SCENES, setLoop, stage, tags, type Scene } from '../src/scenes.ts'
import type { Ctx } from '../src/draw.ts'

// A canvas that accepts anything: the scenes are being asked what they do, not what they draw.
const gradient = { addColorStop() {} }
const ctx = new Proxy({} as Record<string, unknown>, {
  get: (t, k) => (k in t ? t[k as string] : k === 'measureText' ? () => ({ width: 10 }) : String(k).startsWith('create') ? () => gradient : () => {}),
  set: (t, k, v) => ((t[k as string] = v), true),
}) as unknown as Ctx

const at = (beat: number, t = DUR.settle): Frame => frame({ ...initial(0, 1, beat), t }, DUR)
// Play a scene for a while on one beat, as the renderer would.
function play(scene: Scene, beat: number, seconds: number, from = 0) {
  for (let k = 0; k < seconds * 30; k++) scene.update(1 / 30, at(beat, from + k / 30))
}
const scene = (id: string) => SCENES[LAYERS.findIndex((L) => L.id === id)]

afterEach(() => {
  setLoop(1)
  stage.still = false
  for (const s of SCENES) s.reset()
})

describe('every scene', () => {
  it('is a road with traffic on it, one scene per level', () => {
    expect(SCENES).toHaveLength(LAYERS.length)
    for (const s of SCENES) expect(s.ring.count).toBeGreaterThanOrEqual(18)
  })

  it('flows freely until the road fills up', () => {
    for (const s of SCENES) {
      play(s, 0, 8)
      play(s, 1, 8)
      const st = s.stats()
      // (the Wheel's arms slow whatever is in them from the start, crowd or no crowd)
      if (s !== scene('wheel')) expect(st.inJam, LAYERS[SCENES.indexOf(s)].id).toBeLessThan(3)
      expect(st.passed).toBe(0)
      expect(st.turnover).toBe(0)
    }
  })

  it('jams on the third beat, and the jam replaces every car in it and stays', () => {
    SCENES.forEach((s, i) => {
      play(s, 2, 45)
      const st = s.stats()
      expect(st.count, LAYERS[i].id).toBeGreaterThanOrEqual(38)
      expect(st.share, LAYERS[i].id).toBeGreaterThan(0.08)
      expect(st.passed, LAYERS[i].id).toBeGreaterThan(st.inJam)
      expect(st.turnover, LAYERS[i].id).toBeGreaterThanOrEqual(1)
      expect(st.free).toBe(false)
    })
  })

  it('forgets the jam if the reader goes back to before it', () => {
    const s = scene('genes')
    play(s, 2, 30)
    expect(s.stats().passed).toBeGreaterThan(0)
    play(s, 1, 25)
    expect(s.stats()).toMatchObject({ passed: 0, turnover: 0, inJam: 0 })
    expect(s.stats().count).toBeLessThan(24)
  })

  it('forms the new thing where the jam is', () => {
    for (const s of SCENES) {
      play(s, 2, 20)
      play(s, LAST, DUR.leap + 1)
      tags.length = 0
      s.draw(ctx, 3, at(LAST, DUR.leap + 1), '#ffffff')
      expect(Number.isFinite(s.made[0]) && Number.isFinite(s.made[1])).toBe(true)
      // somewhere on the road, not in the middle of the stage
      expect(Math.hypot(...s.made)).toBeGreaterThan(15)
      expect(Math.hypot(...s.made)).toBeLessThan(110)
    }
  })

  it('labels each beat with its tag', () => {
    SCENES.forEach((s, i) => {
      for (const beat of [0, 1, 2]) {
        play(s, beat, beat === 2 ? 12 : 2)
        tags.length = 0
        s.draw(ctx, 2, at(beat), '#ffffff')
        expect(tags.map((t) => t.text), `${LAYERS[i].id} beat ${beat}`).toContain(Object.values(LAYERS[i].beats)[beat].tag)
      }
    })
  })
})

describe('the reader', () => {
  it('can make a car brake with a tap, and hear about it', () => {
    SCENES.forEach((s, i) => {
      if (LAYERS[i].id === 'strings') return
      play(s, 1, 3)
      s.draw(ctx, 1, at(1), '#ffffff')
      const said = [0, 1, 2].map(() => s.poke(40, 10))
      expect(said).toEqual(GRUMBLES[LAYERS[i].id].slice(0, 3))
      expect(s.ring.cars.some((c) => c.braking > 0)).toBe(true)
    })
  })

  it('cannot brake anything that has no mass', () => {
    const s = scene('strings')
    play(s, 0, 3)
    s.draw(ctx, 1, at(0), '#ffffff')
    expect(s.stats().free).toBe(true)
    expect(s.poke(0, 0)).toBe('cannot brake: no mass yet')
    expect(s.hold(0, 0)).toBe('nothing to keep a gap from')
    play(s, 2, 30)
    expect(s.stats().free).toBe(false)
    expect(s.stats().share).toBeGreaterThan(0.08)
    expect(GRUMBLES.strings).toContain(s.poke(0, 0))
  })

  it('can ask one car to keep a gap, which is the only thing that clears a jam', () => {
    const s = scene('apes')
    play(s, 2, 30)
    expect(s.stats().inJam).toBeGreaterThanOrEqual(3)
    s.draw(ctx, 1, at(2), '#ffffff')
    expect(s.hold(0, 60)).toBe('keeping a gap')
    expect(s.stats().calm).toBe(true)
    play(s, 2, 90, 30)
    expect(s.stats().share).toBe(0)
    // and it can change its mind
    s.draw(ctx, 1, at(2), '#ffffff')
    const calm = s.ring.cars.findIndex((c) => c.calm)
    const p = (s as unknown as { pts: { x: number; y: number }[] }).pts[calm]
    expect(s.hold(p.x, p.y)).toBe('tailgating again')
    expect(s.stats().calm).toBe(false)
  })
})

describe('the loops', () => {
  it('put more traffic on every road each time round', () => {
    const before = SCENES.map((s) => s.ring.count)
    setLoop(3)
    for (const s of SCENES) s.reset()
    SCENES.forEach((s, i) => expect(s.ring.count).toBe(before[i] + 4))
  })

  it('have one car on every road keeping a gap from the third loop, so the jams do not last', () => {
    setLoop(3)
    const s = scene('rock')
    s.reset()
    play(s, 2, 12)
    expect(s.stats().calm).toBe(true)
    play(s, 2, 100, 12)
    expect(s.stats().share).toBeLessThan(0.08)
  })

  it('work each beat out in one go when motion is reduced', () => {
    stage.still = true
    const s = scene('machines')
    s.update(0, at(2))
    expect(s.stats().count).toBeGreaterThanOrEqual(38)
    expect(s.stats().share).toBeGreaterThan(0.08)
    const then = s.stats().passed
    // and nothing moves between beats
    for (let k = 0; k < 50; k++) s.update(1 / 30, at(2))
    expect(s.stats().passed).toBe(then)
  })
})

describe('the last level', () => {
  it('fills the road, and then everything stops', () => {
    const s = scene('light')
    play(s, 2, 10)
    play(s, 3, 20)
    expect(s.stats().count).toBeGreaterThan(60)
    for (let k = 0; k < (DUR.leap + 3) * 30; k++) s.update(1 / 30, at(LAST, k / 30))
    const st = s.stats()
    expect(st.stopped).toBe(true)
    expect(s.ring.meanSpeed()).toBeLessThan(0.01)
    s.draw(ctx, 1, at(LAST, DUR.leap + 3), '#ffffff')
    expect(s.poke(0, 0)).toBe('already stopped')
  })

  it('puts up a sign, and then corrects it', () => {
    const s = scene('light')
    play(s, LAST, 3)
    const sign = (t: number) => {
      tags.length = 0
      s.draw(ctx, 1, at(LAST, t), '#ffffff')
      return tags.map((x) => x.text).find((x) => x.startsWith('CAUSE OF DELAY'))
    }
    expect(sign(2)).toBeUndefined()
    expect(sign(DUR.leap)).toBe('CAUSE OF DELAY: an earlier incident')
    expect(sign(DUR.leap + 4)).toBe('CAUSE OF DELAY: a later incident')
  })
})

describe('the dive', () => {
  it('starts on the road it is leaving and ends inside the thing that formed on it', () => {
    const sock: [number, number] = [40, -12]
    const start = dive(sock, 0)
    expect(start.outer).toEqual({ c: [0, 0], z: 1 })
    expect(start.inner.z).toBeCloseTo(1 / ZOOM)
    // the level being entered sits, tiny, exactly where the new thing formed
    expect(-start.inner.c[0] * start.inner.z).toBeCloseTo(sock[0])
    expect(-start.inner.c[1] * start.inner.z).toBeCloseTo(sock[1])
    const end = dive(sock, 1)
    expect(end.inner.c[0]).toBeCloseTo(0)
    expect(end.inner.c[1]).toBeCloseTo(0)
    expect(end.inner.z).toBe(1)
    expect(end.outer.z).toBe(ZOOM)
    expect(end.outer.c).toEqual(sock)
    // and the two stay registered on that spot all the way in
    for (const u of [0.2, 0.5, 0.8]) {
      const cam = dive(sock, u)
      expect((sock[0] - cam.outer.c[0]) * cam.outer.z).toBeCloseTo(-cam.inner.c[0] * cam.inner.z)
    }
  })
})
