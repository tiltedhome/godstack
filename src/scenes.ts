// One scene per level, and every scene is the same picture: a form, a road round it, and
// traffic on the road. The traffic is a real simulation (traffic.ts), not an animation, so
// what the report says about jams can be watched happening:
//
//   0 who      the form, and light traffic that flows
//   1 clock    the same, with the level's clock ticking and one car picked out to follow
//   2 jam      the road fills past what it can carry; one car brakes, briefly; the jam that
//              forms stays, and rolls backwards, while the cars go forwards through it
//   3 crowd    more traffic; the jam is now the most permanent thing on the road
//   4 pileup   something new forms where the jam is, out of what passes through it, and the
//              next scene is the inside of that
//
// A tap makes the nearest car brake. A long press makes it keep a gap instead, which is the
// only thing in the whole cut that makes a jam go away.
//
// draw(ctx, t, f, accent): t is wall-clock seconds (idle motion), f says which beat is on
// screen and how far in, accent is the level's colour on this loop. Scenes are drawn in
// units: the stage's short side is 195 of them, origin at its centre, y pointing down.

import {
  MONO, TAU, alpha, bubble, circle, clamp, easeIn, easeOut, easeOutBack, glow, lerp, line, rgba, rng, rrect, seg, stroke, text, type Ctx,
} from './draw.ts'
import { LAST, type Frame } from './engine.ts'
import { BEATS, LAYERS } from './lore.ts'
import { faces, orbs, usingGL, wire } from './paint.ts'
import { CAUSE, CAUSE_CORRECTED } from './minutes.ts'
import { accentFor, calmLoop, causeFor, grumbleFor, headStart, sayingFor } from './rotate.ts'
import { PLATONIC, depthShade, fibSphere, gridStack, helix, metatron, project, torus, torusPoint, type P, type Tri, type V3, type View } from './solid.ts'
import { LENGTH, Ring, VMAX, type Car } from './traffic.ts'

// What the renderer tells every scene: how the form has been turned by hand, which loop this
// is, and whether motion is reduced (in which case the traffic is worked out, not watched).
export const stage = { yaw: 0, pitch: 0, loop: 1, still: false }
export function setLoop(loop: number) {
  stage.loop = loop
}

// A label a scene wants drawn over itself, pointing at something. Scenes only say where, in
// their own units; the renderer draws the text at a fixed, readable size.
export interface Tag {
  x: number
  y: number
  text: string
  a: number
  ring: boolean
  side?: 1 | -1 // force the label below (1) or above (-1) what it points at
}
export const tags: Tag[] = []
function tag(x: number, y: number, s: string, a = 1, ring = true, side?: 1 | -1) {
  if (a > 0.02 && s) tags.push({ x, y, text: s, a: Math.min(1, a), ring, side })
}

// What the road is doing, for the corner of the stage and for the tests.
export interface Stats {
  count: number // cars on the road
  inJam: number // cars in the biggest jam
  share: number // fraction of all cars that are in a jam
  passed: number // how many times a car has been through a jam and out the other side
  turnover: number // how many times over the jam has replaced everything in it
  calm: boolean // is anything on the road keeping a gap?
  free: boolean // nothing interacting: the strings before the Wreck
  stopped: boolean // gridlock
}

export interface Scene {
  ring: Ring
  // where the new thing forms, in scene units: the middle of the jam
  made: [number, number]
  update(dt: number, f: Frame): void
  draw(ctx: Ctx, t: number, f: Frame, accent: string): void
  // a tap at (x, y), in scene units: the nearest car brakes, and says something
  poke(x: number, y: number): string
  // a long press: the nearest car starts (or stops) keeping a gap
  hold(x: number, y: number): string
  stats(): Stats
  reset(): void
}

/* ----------------------------------------------------------------- helpers */

const BRAKE = '#ff5a4d'
const CALM = '#9af2c4'
const WHITE = '#ffffff'
const wrapL = (x: number) => ((x % LENGTH) + LENGTH) % LENGTH
const shortWay = (d: number) => (d > LENGTH / 2 ? d - LENGTH : d < -LENGTH / 2 ? d + LENGTH : d)
const ringEdges = (n: number): [number, number][] => Array.from({ length: n }, (_, i) => [i, (i + 1) % n])
const pathEdges = (n: number): [number, number][] => Array.from({ length: n - 1 }, (_, i) => [i, i + 1])
const ROAD_N = 96
const ROAD_EDGES = ringEdges(ROAD_N)
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function mix(a: string, b: string, t: number): string {
  const p = parseInt(a.slice(1), 16)
  const q = parseInt(b.slice(1), 16)
  const ch = (s: number) => Math.round(lerp((p >> s) & 255, (q >> s) & 255, clamp(t)))
  return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)
}

// Small lights. On the GPU they are point sprites and bloom; without it they are dots.
function dots(ctx: Ctx, pts: P[], r: number, color: string, a: number) {
  if (!pts.length) return
  if (usingGL()) return orbs(ctx, pts, r, color, a)
  ctx.fillStyle = color
  for (const p of pts) {
    ctx.globalAlpha = a * (0.35 + 0.65 * depthShade(p.z))
    ctx.beginPath()
    ctx.arc(p.x, p.y, r * p.k * 0.8, 0, TAU)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// Pin-pricks: far-off stars, drawn crisp on the 2D canvas whatever the GPU is doing.
function specks(ctx: Ctx, pts: P[], r: number, color: string, a: number) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = color
  for (const p of pts) {
    ctx.globalAlpha = a * (0.45 + 0.55 * depthShade(p.z))
    ctx.beginPath()
    ctx.arc(p.x, p.y, (r * p.k) / 2, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

function glint(ctx: Ctx, x: number, y: number, r: number, color: string, a = 1) {
  ctx.save()
  ctx.globalAlpha *= a
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 ? r * 0.16 : r
    const th = (i / 8) * TAU
    ctx.lineTo(x + Math.cos(th) * rr, y + Math.sin(th) * rr)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

/* ------------------------------------------------------------------- level */

abstract class Level implements Scene {
  ring!: Ring
  made: [number, number] = [0, 0]
  protected R = 50 // the form's radius, in scene units
  protected road = 1.6 // the road's radius, in form radii
  protected pitch = -0.52 // seen from a little above
  protected turn = 0.04 // how fast the whole thing idles round
  protected counts = [18, 18, 40, 46, 52] // cars on the road, beat by beat
  protected size = 1.7 // a car, in scene units
  protected solid = 0 // radius (in form radii) of anything opaque in the middle
  protected period = 0 // seconds between ticks of its clock, as drawn; 0 for no clock
  protected pts: P[] = [] // where the cars were last drawn
  protected focus = 0 // where on the road the jam is, eased
  protected site: number | null = null // where the braking started
  protected clock = 0
  private siteAt = 0
  private inside = new Set<number>() // cars that are in a jam just now
  private exits = 0 // how many have left one
  private jamSize = 0 // how big the jam usually is
  private beat = -1
  private braked = false
  private words = 0
  private index: number

  constructor(readonly id: string, private seed: number) {
    this.index = LAYERS.findIndex((L) => L.id === id)
  }

  reset() {
    this.ring = new Ring(this.counts[0] + headStart(stage.loop), 0.5, this.seed)
    this.ring.tagged = 0
    this.forget()
    this.beat = -1
    this.braked = false
    this.site = null
    this.focus = 0
    this.setup()
  }

  private forget() {
    this.inside.clear()
    this.exits = 0
    this.jamSize = 0
  }

  protected setup() {}
  protected enter(_beat: number) {}
  protected advance(_dt: number, _f: Frame) {}
  protected abstract form(ctx: Ctx, t: number, f: Frame, accent: string, view: View): void
  protected abstract glyph(ctx: Ctx, x: number, y: number, s: number, t: number, color: string): void

  // A point on the road. `lift` raises it off the road, in form radii.
  protected roadPoint(s: number, lift = 0): V3 {
    const th = (s / LENGTH) * TAU
    return [Math.cos(th) * this.road, -lift, Math.sin(th) * this.road]
  }
  protected at(s: number, view: View, lift = 0): P {
    return project(this.roadPoint(s, lift), view, this.R)
  }
  protected view(t: number): View {
    return { yaw: t * this.turn + stage.yaw, pitch: this.pitch + stage.pitch }
  }

  /* ---- what happens */

  update(dt: number, f: Frame) {
    const fresh = f.beat !== this.beat
    if (fresh) {
      // going back to before the jam: forget it
      if (f.beat < 2) {
        this.forget()
        this.braked = false
        this.site = null
      }
      this.beat = f.beat
      this.ring.setCount(this.counts[f.beat] + headStart(stage.loop))
      if (calmLoop(stage.loop)) this.ring.setCalm(true)
      this.enter(f.beat)
    }
    // with motion reduced nothing is watched, so each beat is worked out in one go
    if (stage.still) {
      if (fresh) for (let k = 0; k < 170; k++) this.tick(0.1, { ...f, age: k * 0.1 })
      return
    }
    this.tick(dt, f)
  }

  private tick(dt: number, f: Frame) {
    const ring = this.ring
    this.clock += dt
    this.script(f)
    this.advance(dt, f)
    ring.step(dt)
    const jam = ring.jam()
    if (jam && jam.size >= 3) {
      this.focus = wrapL(this.focus + shortWay(jam.at - this.focus) * Math.min(1, dt * 3))
      this.jamSize += (jam.size - this.jamSize) * Math.min(1, dt * 0.5)
    }
    // the Ship of Theseus, counted: every car that has been in a jam and come out again
    if (this.beat >= 2) for (const c of ring.cars) {
      if (c.slowFor > 1.5) this.inside.add(c.id)
      else if (c.slowFor === 0 && this.inside.delete(c.id)) this.exits++
    }
  }

  // The accident. Once the road is full enough, one car brakes for a second and a bit. That
  // is all that ever happens to this road, and it is over before the jam has properly formed.
  protected script(f: Frame) {
    const ring = this.ring
    if (f.beat < 2 || this.braked || ring.free) return
    if (f.beat === 2 && f.age < 1.1) return
    if (ring.count < this.counts[2] - 6) return
    this.braked = true
    const i = (Math.max(0, ring.tagged) + 5) % ring.count
    ring.brake(i, 1.3)
    this.site = ring.cars[i].x
    this.siteAt = this.clock
  }

  private nearest(x: number, y: number): number {
    let best = -1
    let bd = Infinity
    for (let i = 0; i < this.pts.length && i < this.ring.count; i++) {
      const d = Math.hypot(this.pts[i].x - x, this.pts[i].y - y) - this.pts[i].z * 3 // nearer cars win ties
      if (d < bd) {
        bd = d
        best = i
      }
    }
    return best
  }

  poke(x: number, y: number): string {
    const ring = this.ring
    if (ring.free) return 'cannot brake: no mass yet'
    if (ring.limit < 0.05) return 'already stopped'
    const i = this.nearest(x, y)
    if (i < 0) return ''
    ring.brake(i, 1.1)
    if (this.site === null) {
      this.site = ring.cars[i].x
      this.siteAt = this.clock
    }
    return grumbleFor(this.id, this.words++)
  }

  hold(x: number, y: number): string {
    if (this.ring.free) return 'nothing to keep a gap from'
    const c = this.ring.cars[this.nearest(x, y)]
    if (!c) return ''
    c.calm = !c.calm
    return c.calm ? 'keeping a gap' : 'tailgating again'
  }

  stats(): Stats {
    const ring = this.ring
    const jam = ring.jam()
    return {
      count: ring.count,
      inJam: jam?.size ?? 0,
      share: ring.jammed(),
      passed: this.exits,
      turnover: this.jamSize >= 2 ? Math.floor(this.exits / this.jamSize) : 0,
      calm: ring.cars.some((c) => c.calm),
      free: ring.free,
      stopped: ring.limit < 0.05,
    }
  }

  /* ---- what it looks like */

  draw(ctx: Ctx, t: number, f: Frame, accent: string) {
    const view = this.view(t)
    this.form(ctx, t, f, accent, view)
    this.lane(ctx, view, accent)
    this.pulse(ctx, t, f, accent)
    this.traffic(ctx, view, accent, t)
    this.product(ctx, t, f, view)
    this.callouts(f, view)
  }

  protected hidden(p: P): boolean {
    return this.solid > 0 && p.z < 0 && Math.hypot(p.x, p.y) < this.solid * this.R * p.k
  }

  // The road, the place where the braking began, and a glow over the jam.
  private lane(ctx: Ctx, view: View, accent: string) {
    const pts: P[] = []
    for (let i = 0; i < ROAD_N; i++) pts.push(this.at((i / ROAD_N) * LENGTH, view))
    wire(ctx, pts, ROAD_EDGES, accent, 0.34, 0.8)
    const jam = this.ring.jam()
    if (jam && jam.size >= 3 && this.ring.limit > 0.05) {
      const span = wrapL(jam.front - jam.back) + 1.6
      const K = Math.max(3, Math.ceil(span / 1.2))
      ctx.beginPath()
      for (let j = 0; j <= K; j++) {
        const p = this.at(jam.back - 0.8 + (span * j) / K, view)
        if (j) ctx.lineTo(p.x, p.y)
        else ctx.moveTo(p.x, p.y)
      }
      stroke(ctx, rgba(BRAKE, 0.2), this.size * 3.6)
    }
    if (this.site !== null) {
      const p = this.at(this.site, view)
      if (!this.hidden(p)) {
        const age = this.clock - this.siteAt
        const r = 2.4 * p.k
        const a = 0.45 + 0.55 * (1 - seg(age, 0, 5))
        line(ctx, p.x - r, p.y - r, p.x + r, p.y + r, rgba(WHITE, a), 0.7)
        line(ctx, p.x - r, p.y + r, p.x + r, p.y - r, rgba(WHITE, a), 0.7)
        // said once, where it happened, and then left as a mark
        if (age < 7) tag(p.x, p.y, age < 1.6 ? 'one of them brakes' : 'it braked here. it is long gone.', seg(age, 0, 0.4) * (1 - seg(age, 6, 7)), false)
      }
    }
  }

  // Its clock, as a ring that leaves the middle once a frame.
  private pulse(ctx: Ctx, t: number, f: Frame, accent: string) {
    if (!this.period || this.ring.limit < 0.05) return
    const loud = f.beat === 1 ? f.u : f.from === 1 ? 1 - f.u : 0
    const a = 0.1 + 0.5 * loud
    ctx.save()
    ctx.strokeStyle = accent
    if (this.period < 0.2) {
      // too fast to see as ticks: a shimmer
      ctx.globalAlpha = a * (0.6 + 0.4 * Math.sin(t * 60))
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.arc(0, 0, this.R * 0.62, 0, TAU)
      ctx.stroke()
    } else {
      const ph = (t / this.period) % 1
      ctx.globalAlpha = a * (1 - ph)
      ctx.lineWidth = 0.9
      ctx.beginPath()
      ctx.ellipse(0, 0, this.R * (0.25 + 1.5 * ph), this.R * (0.25 + 1.5 * ph) * Math.abs(Math.sin(this.pitch + stage.pitch)), 0, 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
  }

  private traffic(ctx: Ctx, view: View, accent: string, t: number) {
    const ring = this.ring
    const n = ring.count
    const pts = this.pts
    pts.length = n
    for (let i = 0; i < n; i++) pts[i] = this.at(ring.cars[i].x, view)
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => pts[a].z - pts[b].z)
    const tagged = ring.tagged
    for (const i of order) {
      const c = ring.cars[i]
      const p = pts[i]
      if (this.hidden(p)) continue
      const depth = depthShade(p.z / this.road)
      const heat = ring.free ? 0 : clamp(1.15 - c.v / (0.5 * VMAX))
      const color = mix(accent, BRAKE, heat)
      const r = this.size * p.k * (0.78 + 0.44 * depth)
      ctx.save()
      ctx.globalAlpha = 0.3 + 0.7 * depth
      // a tail as long as it is fast
      const back = this.at(c.x - c.v * 1.5 - 0.3, view)
      line(ctx, back.x, back.y, p.x, p.y, rgba(color, 0.4), r * 0.9)
      this.car(ctx, p, c, r, color, t)
      if (c.calm) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, r + 2.6, 0, TAU)
        stroke(ctx, CALM, 0.9)
      }
      if (i === tagged) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, r + 1.5, 0, TAU)
        stroke(ctx, WHITE, 0.8)
      }
      ctx.restore()
    }
  }

  protected car(ctx: Ctx, p: P, _c: Car, r: number, color: string, _t: number) {
    glow(ctx, p.x, p.y, r * 3, color, 0.5)
    circle(ctx, p.x, p.y, r, color)
  }

  // The new thing, forming where the jam is, out of what passes through it.
  private product(ctx: Ctx, t: number, f: Frame, view: View) {
    const k = f.beat === LAST ? f.leap : 0
    const p = this.at(this.focus, view, 0.22 * easeOut(k))
    this.made = [p.x, p.y]
    if (k <= 0) return
    const next = LAYERS[(this.index + 1) % LAYERS.length]
    const color = accentFor(next.palette.accent, this.index === LAYERS.length - 1 ? stage.loop + 1 : stage.loop)
    // every car that goes through leaves a little behind
    const jam = this.ring.jam()
    if (jam) {
      const gather = seg(k, 0, 0.25) * (1 - seg(k, 0.8, 1))
      this.ring.cars.forEach((c, i) => {
        if (!this.ring.slow(i) || !this.pts[i]) return
        const u = (t * 0.7 + hash(c.id)) % 1
        alpha(ctx, gather * Math.sin(u * Math.PI), () => circle(ctx, lerp(this.pts[i].x, p.x, u), lerp(this.pts[i].y, p.y, u), 0.8, color))
      })
    }
    const s = easeOutBack(seg(k, 0.15, 0.7))
    if (s > 0.01) {
      glow(ctx, p.x, p.y, 20 * s, color, 0.55)
      this.glyph(ctx, p.x, p.y, s, t, color)
    }
    // its first words, which the dive leaves behind
    const said = seg(k, 0.74, 0.86) * (1 - seg(f.dive, 0, 0.18))
    if (said > 0) alpha(ctx, said, () => bubble(ctx, sayingFor(this.id, stage.loop), p.x, p.y - 18, 5.6, 0))
  }

  // The beat's label, pointing at whatever the beat is about.
  protected callouts(f: Frame, view: View) {
    const beat = LAYERS[this.index].beats[BEATS[f.beat]]
    const car = this.pts[Math.max(0, this.ring.tagged)]
    const jam = this.ring.jam()
    if (f.beat === 0) {
      const [x, y] = this.anchor(view)
      tag(x, y, beat.tag, f.u)
    } else if (f.beat === 1 && car) tag(car.x, car.y, beat.tag, f.u)
    else if (f.beat === LAST) tag(this.made[0], this.made[1] + 3, f.leap > 0.5 ? beat.tag : '', seg(f.leap, 0.5, 0.62) * (1 - seg(f.dive, 0, 0.15)), true, 1)
    else if (jam && jam.size >= 3) {
      const p = this.at(this.focus, view)
      tag(p.x, p.y, beat.tag, f.u)
    } else if (car) tag(car.x, car.y, beat.tag, f.u * 0.9)
  }

  // Where the first beat's label points: the form itself.
  protected anchor(_view: View): [number, number] {
    return [0, -this.R * 0.2]
  }
}

/* ----------------------------------------------------------- the made things */

// A cloud of hydrogen with ambitions.
function clump(ctx: Ctx, x: number, y: number, s: number, t: number, color: string) {
  for (let i = 0; i < 9; i++) {
    const th = i * 2.4 + t * 0.2
    const d = (i ? 3.4 + 1.6 * hash(i) : 0) * s
    alpha(ctx, 0.5, () => circle(ctx, x + Math.cos(th) * d, y + Math.sin(th) * d * 0.7, (3.6 - i * 0.2) * s, mix(color, WHITE, 0.25)))
  }
}

function star(ctx: Ctx, x: number, y: number, s: number, t: number, color: string) {
  glint(ctx, x, y, (9 + Math.sin(t * 3) * 0.8) * s, mix(color, WHITE, 0.4), 0.9)
  circle(ctx, x, y, 2.6 * s, WHITE)
}

function world(ctx: Ctx, x: number, y: number, s: number, _t: number, color: string) {
  const r = 5 * s
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r)
  g.addColorStop(0, mix(color, WHITE, 0.55))
  g.addColorStop(0.6, color)
  g.addColorStop(1, mix(color, '#000000', 0.7))
  circle(ctx, x, y, r, g)
  ctx.beginPath()
  ctx.arc(x, y, r + 1.1 * s, 0, TAU)
  stroke(ctx, rgba(color, 0.5), 0.5)
}

const LETTERS = ['#ff8a8a', '#ffd166', '#7fe0c6', '#8fb8ff']
function gene(ctx: Ctx, x: number, y: number, s: number, t: number, color: string) {
  ctx.beginPath()
  for (let i = 0; i < 7; i++) {
    const px = x + (i - 3) * 2.5 * s
    const py = y + Math.sin(i * 1.1 + t * 2) * 1.3 * s
    if (i) ctx.lineTo(px, py)
    else ctx.moveTo(px, py)
  }
  stroke(ctx, rgba(color, 0.8), 0.7 * s)
  for (let i = 0; i < 7; i++) circle(ctx, x + (i - 3) * 2.5 * s, y + Math.sin(i * 1.1 + t * 2) * 1.3 * s, 1.25 * s, LETTERS[(i * 7 + 1) % 4])
}

function brain(ctx: Ctx, x: number, y: number, s: number, t: number, color: string) {
  const r = 5.4 * s
  circle(ctx, x, y, r, rgba(color, 0.3))
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  stroke(ctx, color, 0.7 * s)
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(x + (i - 1) * r * 0.5, y + (i % 2 ? 0.3 : -0.2) * r, r * 0.42, 0.4 + i, 3.4 + i)
    stroke(ctx, rgba(color, 0.9), 0.55 * s)
  }
  // a thought, going round
  const th = t * 6
  circle(ctx, x + Math.cos(th) * r * 0.55, y + Math.sin(th * 1.3) * r * 0.5, 0.9 * s, WHITE)
}

function model(ctx: Ctx, x: number, y: number, s: number, t: number, color: string) {
  const w = 13 * s
  const h = 8.5 * s
  rrect(ctx, x - w / 2, y - h / 2, w, h, 2.2 * s, rgba('#0b0a12', 0.9))
  rrect(ctx, x - w / 2, y - h / 2, w, h, 2.2 * s)
  stroke(ctx, color, 0.7 * s)
  for (let i = 0; i < 2; i++) line(ctx, x - w * 0.34, y - h * 0.16 + i * h * 0.28, x + w * (i ? 0.02 : 0.3), y - h * 0.16 + i * h * 0.28, rgba(color, 0.8), 0.7 * s)
  if (Math.sin(t * 7) > 0) rrect(ctx, x + w * 0.08, y + h * 0.02, 1.4 * s, 2.4 * s, 0.2, color)
}

function light(ctx: Ctx, x: number, y: number, s: number, t: number, color: string) {
  for (let i = 0; i < 3; i++) {
    const ph = (t * 1.6 + i / 3) % 1
    ctx.beginPath()
    ctx.arc(x, y, (1.5 + ph * 7) * s, 0, TAU)
    stroke(ctx, rgba(mix(color, WHITE, 0.5), 1 - ph), 0.7 * s)
  }
  circle(ctx, x, y, 1.8 * s, WHITE)
}

function wreck(ctx: Ctx, x: number, y: number, s: number, t: number, color: string) {
  for (let i = 0; i < 12; i++) {
    const th = (i / 12) * TAU + 0.2
    const len = (5 + 4 * hash(i + Math.floor(t * 9))) * s
    line(ctx, x + Math.cos(th) * 1.6 * s, y + Math.sin(th) * 1.6 * s, x + Math.cos(th) * len, y + Math.sin(th) * len, rgba(i % 2 ? color : BRAKE, 0.9), 0.8 * s)
  }
  circle(ctx, x, y, 2 * s, WHITE)
}

/* ----------------------------------------------------------------- strings */

// A torus wound with one string, and a road round its waist where, to begin with, nothing
// notices anything and everything does the speed limit.
class Strings extends Level {
  protected R = 38
  protected road = 1.74
  protected counts = [40, 40, 40, 46, 52]
  protected size = 1.5
  private mesh = torus(1, 0.36, 26, 10)
  private edges = ringEdges(180)

  protected setup() {
    this.ring.free = true
  }

  protected enter(beat: number) {
    const was = this.ring.free
    this.ring.free = beat < 2
    // the Wreck: nobody braked. Everything acquired weight at once, unevenly.
    if (was && !this.ring.free) {
      const r = rng(11)
      for (const c of this.ring.cars) c.v *= 0.4 + 0.6 * r()
    }
  }

  protected script() {
    /* nobody saw what stopped */
  }

  protected form(ctx: Ctx, t: number, f: Frame, accent: string, view: View) {
    const pts = this.mesh.verts.map((v) => project(v, view, this.R))
    wire(ctx, pts, this.mesh.edges, accent, 0.2, 0.6)
    faces(pts, this.mesh.tris, accent, 0.05)
    // heavier once there is mass: the string shakes less and glows more
    const massive = f.beat >= 2 ? 1 : 0
    const sp: P[] = []
    for (let i = 0; i < 180; i++) {
      const s = i / 180
      const w = 1 + (0.07 - 0.04 * massive) * Math.sin(s * TAU * 9 + t * (6 - 3 * massive))
      sp.push(project(torusPoint(s * TAU * 2, s * TAU * 3, 1, 0.39 * w), view, this.R))
    }
    wire(ctx, sp, this.edges, WHITE, 0.5, 0.9)
  }

  protected car(ctx: Ctx, p: P, _c: Car, r: number, color: string) {
    glow(ctx, p.x, p.y, r * 3.4, color, 0.6)
    circle(ctx, p.x, p.y, r * 0.85, mix(color, WHITE, 0.4))
  }

  protected glyph = clump
}

/* ------------------------------------------------------------------- wheel */

const TAN_PITCH = Math.tan((12 * Math.PI) / 180)

// A galaxy. Every dot goes round on its own orbit and slows a little where the arm is, which
// is the only reason there is an arm. The road is one of those orbits, picked out.
class Wheel extends Level {
  protected R = 56
  protected road = 0.95
  protected pitch = -0.92
  protected turn = 0
  protected size = 1.45
  protected period = 9
  private dotsAt: { a: number; th: number; y: number; id: number }[] = []
  private pattern = 0

  protected setup() {
    const r = rng(5)
    this.dotsAt = Array.from({ length: 900 }, (_, id) => {
      const a = 0.1 + 1.2 * Math.pow(r(), 0.8)
      return { a, th: r() * TAU, y: (r() - 0.5) * 0.07 * (1.4 - a), id }
    })
    this.pattern = 0
    // settle the disc into its arms before anyone looks
    for (let k = 0; k < 240; k++) this.spin(0.1)
    this.ring.drag = (x) => 1 - 0.68 * this.arm(this.road, (x / LENGTH) * TAU)
  }

  // How much of an arm there is at this radius and angle, 0 to 1: two logarithmic spirals,
  // trailing, pitched at twelve degrees, turning more slowly than anything in them.
  private arm(a: number, th: number): number {
    return Math.pow(0.5 + 0.5 * Math.cos(2 * (th - this.pattern + Math.log(Math.max(a, 0.05)) / TAN_PITCH)), 5)
  }

  private spin(dt: number) {
    this.pattern += 0.11 * dt
    for (const d of this.dotsAt) d.th += (0.42 / Math.max(d.a, 0.32)) * (1 - 0.6 * this.arm(d.a, d.th)) * dt
  }

  protected advance(dt: number) {
    this.spin(dt)
  }

  protected form(ctx: Ctx, t: number, f: Frame, accent: string, view: View) {
    const lit = f.beat > 3 ? 1 : f.beat === 3 ? f.u : 0
    const dim: P[] = []
    const bright: P[] = []
    const sparks: P[] = []
    for (const d of this.dotsAt) {
      const p = project([Math.cos(d.th) * d.a, d.y, Math.sin(d.th) * d.a], view, this.R)
      const arm = this.arm(d.a, d.th)
      if (arm > 0.28) bright.push(p)
      else dim.push(p)
      // where the gas is squeezed, the lights come on
      if (lit > 0 && arm > 0.6 && hash(d.id + Math.floor(t * 1.2 + d.id * 0.31)) < 0.12 * lit) sparks.push(p)
    }
    glow(ctx, 0, 0, this.R * 0.62, accent, 0.55)
    specks(ctx, dim, 1.15, accent, 0.75)
    specks(ctx, bright, 1.7, mix(accent, WHITE, 0.6), 1)
    for (const p of sparks) glint(ctx, p.x, p.y, 3 * p.k, WHITE, 0.9)
  }

  protected car(ctx: Ctx, p: P, _c: Car, r: number, color: string) {
    glow(ctx, p.x, p.y, r * 2.6, color, 0.45)
    circle(ctx, p.x, p.y, r, mix(color, WHITE, 0.2))
  }

  protected anchor(): [number, number] {
    return [0, 0]
  }

  protected glyph = star
}

/* ------------------------------------------------------------------- stars */

// One star, its neighbours a long way off, and the lane of dust that goes round it.
class Stars extends Level {
  protected R = 42
  protected road = 1.55
  protected solid = 0.38
  protected size = 1.25
  protected period = 7
  private far = fibSphere(70)
  // a photon's way out: one step in a random direction, a great many times
  private walk: [number, number][] = (() => {
    const r = rng(9)
    const out: [number, number][] = [[0, 0]]
    let x = 0
    let y = 0
    while (out.length < 400 && Math.hypot(x, y) < 1) {
      const th = r() * TAU
      x += Math.cos(th) * 0.11
      y += Math.sin(th) * 0.11
      out.push([x, y])
    }
    return out
  })()

  protected form(ctx: Ctx, t: number, f: Frame, accent: string, view: View) {
    // the neighbours: four light years off, and not in touch
    const slow: View = { yaw: view.yaw * 0.3, pitch: view.pitch }
    specks(ctx, this.far.map((v) => project([v[0] * 2.9, v[1] * 2.9, v[2] * 2.9], slow, this.R)), 1.5, mix(accent, WHITE, 0.6), 0.8)
    // the debris: two faint lanes either side of the road
    for (const k of [0.86, 1.16]) {
      const lane: P[] = []
      for (let i = 0; i < ROAD_N; i++) {
        const th = (i / ROAD_N) * TAU
        lane.push(project([Math.cos(th) * this.road * k, 0, Math.sin(th) * this.road * k], view, this.R))
      }
      wire(ctx, lane, ROAD_EDGES, accent, 0.1, 0.5)
    }
    const r = this.R * this.solid
    glow(ctx, 0, 0, r * 3.4, accent, 0.7)
    const g = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r)
    g.addColorStop(0, '#fffaf0')
    g.addColorStop(0.55, mix(accent, WHITE, 0.35))
    g.addColorStop(1, accent)
    circle(ctx, 0, 0, r * (1 + 0.012 * Math.sin(t * 2.3)), g)
    orbs(ctx, [project([0, 0, 0], view, this.R)], r, accent, 0.5)
    // on its clock beat: light, stuck in traffic on the way out
    const show = f.beat === 1 ? f.u : f.from === 1 ? 1 - f.u : 0
    if (show > 0.01) {
      const n = Math.max(2, Math.floor(this.walk.length * clamp(f.beat === 1 ? f.age / 13 : 1)))
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const [x, y] = this.walk[i]
        if (i) ctx.lineTo(x * r, y * r)
        else ctx.moveTo(x * r, y * r)
      }
      stroke(ctx, rgba('#3a1a05', 0.75 * show), 0.5)
      const [hx, hy] = this.walk[n - 1]
      alpha(ctx, show, () => circle(ctx, hx * r, hy * r, 1.1, '#3a1a05'))
      // out at last, and gone in a straight line
      if (n === this.walk.length) {
        const d = Math.hypot(hx, hy) || 1
        const u = ((f.age - 13) % 1.6) / 1.6
        alpha(ctx, show * (1 - u), () => line(ctx, hx * r, hy * r, (hx / d) * r * (1 + u * 3), (hy / d) * r * (1 + u * 3), WHITE, 0.8))
      }
    }
  }

  protected car(ctx: Ctx, p: P, c: Car, r: number, color: string) {
    const k = 0.7 + 0.6 * hash(c.id)
    circle(ctx, p.x, p.y, r * k, mix(color, '#d8c2a0', 0.5))
  }

  protected anchor(): [number, number] {
    return [0, 0]
  }

  protected glyph = world
}

/* -------------------------------------------------------------------- rock */

function icosphere(): { verts: V3[]; edges: [number, number][]; tris: Tri[] } {
  const base = PLATONIC.icosahedron
  const verts: V3[] = base.verts.map((v) => {
    const d = Math.hypot(v[0], v[1], v[2])
    return [v[0] / d, v[1] / d, v[2] / d]
  })
  const mid = new Map<string, number>()
  const midpoint = (a: number, b: number) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`
    let m = mid.get(key)
    if (m === undefined) {
      const v: V3 = [verts[a][0] + verts[b][0], verts[a][1] + verts[b][1], verts[a][2] + verts[b][2]]
      const d = Math.hypot(v[0], v[1], v[2])
      m = verts.push([v[0] / d, v[1] / d, v[2] / d]) - 1
      mid.set(key, m)
    }
    return m
  }
  const tris: Tri[] = []
  for (const [a, b, c] of base.tris) {
    const ab = midpoint(a, b)
    const bc = midpoint(b, c)
    const ca = midpoint(c, a)
    tris.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
  }
  const seen = new Set<string>()
  const edges: [number, number][] = []
  for (const tri of tris) {
    for (let k = 0; k < 3; k++) {
      const a = tri[k]
      const b = tri[(k + 1) % 3]
      const key = a < b ? `${a},${b}` : `${b},${a}`
      if (!seen.has(key)) {
        seen.add(key)
        edges.push([a, b])
      }
    }
  }
  return { verts, edges, tris }
}

const TILT = 0.42

// A planet, and a current going round it. Where the braking starts there is a vent.
class Rock extends Level {
  protected R = 37
  protected road = 1.42
  protected solid = 0.97
  protected size = 1.5
  protected period = 5
  protected turn = 0.07
  private mesh = icosphere()

  protected roadPoint(s: number, lift = 0): V3 {
    const th = (s / LENGTH) * TAU
    const r = this.road + lift
    return [Math.cos(th) * r, Math.sin(th) * r * Math.sin(TILT), Math.sin(th) * r * Math.cos(TILT)]
  }

  protected form(ctx: Ctx, t: number, f: Frame, accent: string, view: View) {
    const pts = this.mesh.verts.map((v) => project(v, view, this.R))
    faces(pts, this.mesh.tris, accent, 0.1)
    wire(ctx, pts, this.mesh.edges, accent, 0.4, 0.7)
    if (!usingGL()) alpha(ctx, 0.35, () => circle(ctx, 0, 0, this.R * 0.99, rgba('#04100e', 0.9)))
    // the vent: on the surface, under the place the braking began
    if (this.site !== null && f.beat >= 2) {
      const v = this.roadPoint(this.site)
      const d = Math.hypot(v[0], v[1], v[2])
      const n: V3 = [v[0] / d, v[1] / d, v[2] / d]
      const base = project(n, view, this.R)
      if (base.z > -0.1) {
        const tip = project([n[0] * 1.14, n[1] * 1.14, n[2] * 1.14], view, this.R)
        line(ctx, base.x, base.y, tip.x, tip.y, mix(accent, WHITE, 0.5), 2.2)
        for (let i = 0; i < 5; i++) {
          const u = (t * 0.5 + i / 5) % 1
          const q = project([n[0] * (1.14 + u * 0.26), n[1] * (1.14 + u * 0.26), n[2] * (1.14 + u * 0.26)], view, this.R)
          alpha(ctx, (1 - u) * 0.8, () => circle(ctx, q.x + Math.sin(t * 3 + i) * 1.2, q.y, 0.9 + u, WHITE))
        }
      }
    }
  }

  // two atoms, holding hands
  protected car(ctx: Ctx, p: P, c: Car, r: number, color: string, t: number) {
    const th = hash(c.id) * TAU + t * 1.5
    const dx = Math.cos(th) * r * 0.8
    const dy = Math.sin(th) * r * 0.8
    circle(ctx, p.x - dx, p.y - dy, r * 0.85, color)
    circle(ctx, p.x + dx, p.y + dy, r * 0.6, mix(color, WHITE, 0.5))
  }

  protected glyph = gene
}

/* ------------------------------------------------------------------- genes */

// The double helix, and the cells that carry it round.
class Genes extends Level {
  protected R = 42
  protected road = 1.6
  protected size = 2.1
  protected period = 2.5
  protected turn = 0.16
  private h = helix(30)
  private strand = pathEdges(30)
  private rungs: [number, number][][] = [[], [], [], []]

  constructor(id: string, seed: number) {
    super(id, seed)
    this.h.bases.forEach((b, i) => this.rungs[b].push([i, i + 30]))
  }

  protected form(ctx: Ctx, _t: number, _f: Frame, accent: string, view: View) {
    const sy = 0.9 / (14.5 * 0.34)
    const map = (v: V3) => project([v[0] * 0.44, v[1] * sy, v[2] * 0.44], view, this.R)
    const a = this.h.a.map(map)
    const b = this.h.b.map(map)
    wire(ctx, a, this.strand, accent, 0.8, 1.3)
    wire(ctx, b, this.strand, accent, 0.8, 1.3)
    const both = a.concat(b)
    this.rungs.forEach((edges, base) => wire(ctx, both, edges, LETTERS[base], 0.7, 1.1))
    dots(ctx, both, 1.3, mix(accent, WHITE, 0.3), 0.7)
  }

  // a cell: a skin, and the sentence inside it
  protected car(ctx: Ctx, p: P, _c: Car, r: number, color: string) {
    circle(ctx, p.x, p.y, r, rgba(color, 0.28))
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, TAU)
    stroke(ctx, color, 0.6)
    circle(ctx, p.x, p.y, r * 0.38, WHITE)
  }

  protected anchor(): [number, number] {
    return [0, -this.R * 0.5]
  }

  protected glyph = brain
}

/* -------------------------------------------------------------------- apes */

const WORDS = ['the', 'of', 'and', 'no', 'lol', 'why', 'ok', 'but', 'so', 'is', 'um', 'I', 'you', 'we', 'yes', 'hm', 'not', 'my']

// Thirteen heads, and a ring road of words.
class Apes extends Level {
  protected R = 31
  protected road = 1.95
  protected size = 2.2
  protected period = 0.4
  protected turn = 0.1
  private m = metatron()

  protected form(ctx: Ctx, _t: number, f: Frame, accent: string, view: View) {
    const pts = this.m.verts.map((v) => project([v[0] * 0.92, v[1] * 0.92, v[2] * 0.92], view, this.R))
    // the patterns nobody can see whole: every head joined to every other
    const all = f.beat >= 3 ? 0.34 : f.beat === 2 ? 0.1 + 0.14 * f.u : 0.1
    wire(ctx, pts, this.m.edges, accent, all, 0.6)
    wire(ctx, pts, this.m.shell, accent, 0.5, 0.9)
    orbs(ctx, pts.slice(1), this.R * 0.3, accent, 0.5)
    orbs(ctx, [pts[0]], this.R * 0.3, mix(accent, WHITE, 0.5), 0.8)
  }

  // a word, in a small speech bubble; the near ones can be read
  protected car(ctx: Ctx, p: P, c: Car, r: number, color: string) {
    const w = r * 3.1
    const h = r * 1.7
    rrect(ctx, p.x - w / 2, p.y - h / 2, w, h, h / 2, color)
    if (p.z > 0.6) text(ctx, WORDS[c.id % WORDS.length], p.x, p.y + 0.15, h * 0.72, '#0b0a12', MONO)
  }

  protected glyph = model
}

/* ---------------------------------------------------------------- machines */

// A chip, and the bus that goes round it.
class Machines extends Level {
  protected R = 40
  protected road = 1.5
  protected size = 1.5
  protected period = 0.06
  protected turn = 0.08
  private mesh = gridStack(7, 3)

  // a square with its corners eased: |x|^4 + |z|^4 = r^4
  protected roadPoint(s: number, lift = 0): V3 {
    const th = (s / LENGTH) * TAU
    const c = Math.cos(th)
    const z = Math.sin(th)
    const r = this.road / Math.pow(c ** 4 + z ** 4, 0.25)
    return [c * r, -lift, z * r]
  }

  protected form(ctx: Ctx, t: number, _f: Frame, accent: string, view: View) {
    const pts = this.mesh.verts.map((v) => project(v, view, this.R))
    faces(pts, this.mesh.plates, accent, 0.07)
    wire(ctx, pts, this.mesh.edges, accent, 0.42, 0.7)
    // sums, being done
    const live: P[] = []
    for (let i = 0; i < pts.length; i++) if (hash(i + Math.floor(t * 9)) < 0.1) live.push(pts[i])
    dots(ctx, live, 1.4, mix(accent, WHITE, 0.6), 0.9)
  }

  // a bit
  protected car(ctx: Ctx, p: P, _c: Car, r: number, color: string) {
    glow(ctx, p.x, p.y, r * 2.6, color, 0.4)
    ctx.fillStyle = color
    ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2)
  }

  protected glyph = light
}

/* ------------------------------------------------------------------- light */

// A horizon, the record on its surface, and the ring where light goes round. On the last
// beat everything on the ring stops.
class Light extends Level {
  protected R = 37
  protected road = 1.5
  protected solid = 1
  protected size = 1.25
  protected period = 0.02
  protected counts = [18, 18, 44, 70, 92]
  private bits = fibSphere(120)
  private signAt = 4 // seconds into the last beat at which the sign goes up

  protected advance(_dt: number, f: Frame) {
    // gridlock: the lid comes down on every speed at once
    this.ring.limit = f.beat === LAST ? 1 - easeIn(seg(f.leap, 0.05, 0.8)) : 1
  }

  protected form(ctx: Ctx, t: number, f: Frame, accent: string, view: View) {
    const R = this.R
    const stop = f.beat === LAST ? f.leap : 0
    glow(ctx, 0, 0, R * 2.6, '#ff9a5c', 0.3 + 0.25 * stop)
    circle(ctx, 0, 0, R, '#020104')
    ctx.beginPath()
    ctx.arc(0, 0, R * 1.012, 0, TAU)
    stroke(ctx, rgba(accent, 0.75), 0.9)
    // everything that ever fell in, written on the outside
    const tick = stop >= 1 ? 0 : t * (1 - stop)
    ctx.fillStyle = accent
    this.bits.forEach((v, i) => {
      const p = project([v[0] * 0.985, v[1] * 0.985, v[2] * 0.985], view, R)
      if (p.z < 0.05) return
      const on = hash(i + Math.floor(tick * 2 + i * 0.37)) < 0.5
      ctx.globalAlpha = (on ? 0.85 : 0.22) * depthShade(p.z)
      ctx.fillRect(p.x - 0.7, p.y - 0.7, 1.4, 1.4)
    })
    ctx.globalAlpha = 1
  }

  // a photon: a dash, pointing the way it is going
  protected car(ctx: Ctx, p: P, c: Car, r: number, color: string) {
    const th = (c.x / LENGTH) * TAU + stage.yaw
    const dx = -Math.sin(th) * r * 1.5
    line(ctx, p.x - dx, p.y, p.x + dx, p.y, color, r * 0.9)
    circle(ctx, p.x, p.y, r * 0.5, WHITE)
  }

  protected callouts(f: Frame, view: View) {
    super.callouts(f, view)
    // the sign over the last pile-up. The first time round it says the usual thing for a
    // moment, and is then corrected.
    if (f.beat === LAST && f.leap > 0.8 && f.dive < 0.15) {
      const cause = stage.loop > 1 ? causeFor(stage.loop) : f.age < this.signAt + 3.2 ? CAUSE : CAUSE_CORRECTED
      tag(this.made[0], this.made[1] - 46, `CAUSE OF DELAY: ${cause}`, seg(f.leap, 0.8, 0.9), false)
    }
  }

  protected glyph = wreck
}

const make = <T extends Level>(s: T): T => {
  s.reset()
  return s
}

export const SCENES: Scene[] = [
  make(new Strings('strings', 3)),
  make(new Wheel('wheel', 5)),
  make(new Stars('stars', 7)),
  make(new Rock('rock', 11)),
  make(new Genes('genes', 13)),
  make(new Apes('apes', 17)),
  make(new Machines('machines', 19)),
  make(new Light('light', 23)),
]
