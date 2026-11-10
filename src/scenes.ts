// One scene per substrate. Every scene answers the same eight questions, one per beat:
//
//   0 substrate  what it is written on      the form, and one unit of it picked out
//   1 memory     how it remembers           that unit, close up
//   2 copy       how it copies              a copy being made (or failing to be)
//   3 repair     how it repairs             damage, and what happens next; taps do damage too
//   4 learn      how it learns              whatever passes for a lesson
//   5 day        what it is like            the scene left alone
//   6 ceiling    where it stops             the copies link up until they percolate
//   7 leap       how it ported itself       the links converge, the next substrate's first
//                                           unit appears, and divides
//
// draw(ctx, t, f, accent): t is wall-clock seconds (idle motion), f says which beat is on
// screen and how far in, accent is the level's colour on this loop. Scenes are drawn in
// units: the stage's short side is 195 of them, origin at its centre, y pointing down.

import {
  MONO, TAU, alpha, at, bubble, circle, clamp, easeInOut, easeOut, easeOutBack, ellipse, glow, lerp, line, pulse, rgba, rng,
  rrect, seg, singularity, stroke, text, type Ctx,
} from './draw.ts'
import type { Frame } from './engine.ts'
import { BEATS, LAYERS } from './lore.ts'
import { faces, orbs, wire } from './paint.ts'
import { headStart, sayingFor } from './rotate.ts'
import {
  GOLDEN_ANGLE, complement, depthShade, diamond, e8Edges, e8Roots, e8Shadow, fibSphere, gridStack, helix, metatron, project, torus,
  torusPoint, type P, type V3, type View,
} from './solid.ts'

// What the renderer tells every scene: how the form has been turned by hand, and which loop
// this is (the first words, and the head start, depend on it).
export const stage = { yaw: 0, pitch: 0, loop: 1 }
export function setLoop(loop: number) {
  stage.loop = loop
  for (const s of SCENES) s.graph.head = headStart(loop)
}

// A label a scene wants drawn over itself, pointing at something. Scenes only say where, in
// their own units; the renderer draws the text at a fixed, readable size.
export interface Tag {
  x: number
  y: number
  text: string
  a: number
  ring: boolean
}
export const tags: Tag[] = []

export interface Scene {
  focus: [number, number]
  graph: Graph
  // where, in this scene, the level below sits as a detail: one of this level's units
  socket(t: number): [number, number]
  draw(ctx: Ctx, t: number, f: Frame, accent: string): void
  // a tap at (x, y), in scene units: damage whatever is nearest, and say what happened
  poke(x: number, y: number, t: number): string
  reset(): void
}

/* --------------------------------------------------------------- the algorithm */

// The target mean degree as the copies link up. It crosses 1 (the Erdős–Rényi threshold,
// where a giant connected component appears) just before the "where it stops" beat ends.
export const linkDensity = (p: number) => 0.15 + 0.85 * seg(p, 0.02, 0.5)
export const targetDegree = (p: number) => 1.1 * linkDensity(p)

// A scene's network. Edges switch on in a fixed random order, exactly as many as needed for
// the drawn graph's real mean degree (2 × edges / nodes) to follow targetDegree.
export class Graph {
  readonly edges: [number, number][]
  readonly n: number
  // links made by hand: a tap on the stage switches on a few more
  bonus = 0
  // links already made when the level begins: more on every loop, as the constants remember
  head = 0
  constructor(n: number, edges: [number, number][]) {
    this.n = n
    this.edges = edges
  }
  active(p: number): number {
    return Math.min(this.edges.length, Math.round((targetDegree(p) * this.n) / 2) + this.bonus + this.head)
  }
  introduce(k = 3) {
    this.bonus = Math.min(this.edges.length, this.bonus + k)
  }
  reset() {
    this.bonus = 0
  }
  meanDegree(p: number): number {
    return (2 * this.active(p)) / this.n
  }
}

// How far along its linking a level is, as the 0..1 the graph expects: a few links from the
// start, percolating across the seventh beat.
export const linkProgress = (f: Frame) => 0.08 + 0.44 * f.link

function graphOf(pos: number[][], maxD: number, seed: number): Graph {
  const r = rng(seed)
  const out: [number, number, number][] = []
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      let d = 0
      for (let k = 0; k < pos[i].length; k++) d += (pos[i][k] - pos[j][k]) ** 2
      if (d < maxD * maxD) out.push([i, j, r()])
    }
  }
  out.sort((a, b) => a[2] - b[2])
  return new Graph(pos.length, out.map(([i, j]) => [i, j]))
}

type XY = { x: number; y: number }

function network(ctx: Ctx, pts: XY[], g: Graph, f: Frame, color: string, width: number) {
  const m = g.active(linkProgress(f))
  ctx.beginPath()
  for (let e = 0; e < m; e++) {
    const [i, j] = g.edges[e]
    ctx.moveTo(pts[i].x, pts[i].y)
    ctx.lineTo(pts[j].x, pts[j].y)
  }
  stroke(ctx, color, width)
}

// Once the copies are joined up, signals run from them toward where the new unit will form.
function converge(ctx: Ctx, pts: XY[], k: number, color: string, t: number) {
  if (k <= 0) return
  pts.forEach(({ x, y }, i) => {
    if (i % 2) return
    const u = (t * 0.55 + i * 0.137) % 1
    alpha(ctx, k * Math.sin(u * Math.PI), () => circle(ctx, lerp(x, 0, u), lerp(y, 0, u), 1.1, color))
  })
}

// The new unit divides: 1 → 2 → 4 → 8. Copy 0 stays put at the centre.
function multiply(k: number, spread: number, squash = 0.8): { x: number; y: number; s: number; i: number }[] {
  const n = k <= 0 ? 1 : Math.min(8, 2 ** Math.ceil(k * 3))
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    if (i === 0) {
      out.push({ x: 0, y: 0, s: 1, i })
      continue
    }
    const a = i * 2.39996 + 0.6
    const d = spread * Math.sqrt(i / 7) * easeOut(k)
    out.push({ x: Math.cos(a) * d, y: Math.sin(a) * d * squash, s: 0.85, i })
  }
  return out
}

// How present a beat's drawing is: easing in if it is the current one, out if it was the last.
const W = (f: Frame, b: number) => (f.beat === b ? f.u : f.from === b ? 1 - f.u : 0)
// The leap, cut into its four parts.
const gathering = (f: Frame) => (f.leap <= 0 ? 0 : pulse(f.leap, 0, 0.36, 0.02))
const born = (f: Frame) => easeOutBack(seg(f.leap, 0.16, 0.38))
const speaking = (f: Frame) => pulse(f.leap, 0.44, 0.74, 0.03)
const dividing = (f: Frame) => seg(f.leap, 0.76, 0.98)

const view = (t: number, rate: number, tip: number): View => ({ yaw: t * rate + stage.yaw, pitch: tip + stage.pitch })
const WHITE = '#ffffff'
const RED = '#ff5d5d'
const hash = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return s - Math.floor(s)
}

function tag(f: Frame, index: number, b: number, x: number, y: number, ring = true) {
  const a = W(f, b)
  if (a > 0.02) tags.push({ x, y, text: LAYERS[index].beats[BEATS[b]].tag, a, ring })
}

// A dot whose size and brightness follow its depth, so near things read as near.
function mote(ctx: Ctx, q: P, r: number, color: string, a = 1) {
  ctx.globalAlpha = a * (0.35 + 0.65 * depthShade(q.z))
  circle(ctx, q.x, q.y, r * q.k, color)
  ctx.globalAlpha = 1
}

const E01: [number, number][] = [[0, 1]]
const strut = (ctx: Ctx, p: XY & { z: number }, q: XY & { z: number }, color: string, a: number, width = 1) => wire(ctx, [p, q], E01, color, a, width)

// Damage, by tap or by the scene itself during the repair beat. Each scene decides what a
// wound looks like and whether it heals.
class Wounds {
  private hitAt = new Map<number, number>()
  hits = 0
  private lastAuto = -1
  hit(i: number, t: number) {
    this.hitAt.set(i, t)
    this.hits++
  }
  // seconds since unit i was hit, or -1 if it is whole
  age(i: number, t: number) {
    const t0 = this.hitAt.get(i)
    return t0 === undefined ? -1 : t - t0
  }
  heal(i: number) {
    this.hitAt.delete(i)
  }
  clear() {
    this.hitAt.clear()
    this.hits = 0
  }
  each(fn: (i: number) => void) {
    for (const i of [...this.hitAt.keys()]) fn(i)
  }
  // while the repair beat is up, the scene damages itself now and then, so there is
  // something to watch even if nobody taps
  auto(f: Frame, t: number, n: number, every: number) {
    if (f.beat !== 3) return
    const k = Math.floor(t / every)
    if (k === this.lastAuto) return
    this.lastAuto = k
    this.hit((k * 7919 + 3) % n, t)
  }
}

const nearest = (pts: XY[], x: number, y: number) => {
  let best = 0
  let d = Infinity
  pts.forEach((q, i) => {
    const e = (q.x - x) ** 2 + (q.y - y) ** 2
    if (e < d) {
      d = e
      best = i
    }
  })
  return best
}

const says = (id: string) => sayingFor(id, stage.loop)
// the newborn substrate's first words, as a label big enough to read
function say(f: Frame, id: string, x = 0, y = -36) {
  const a = speaking(f)
  if (a > 0.02) tags.push({ x, y, text: `“${says(id)}”`, a, ring: false })
}
const note = (text: string, x: number, y: number, a: number) => a > 0.02 && tags.push({ x, y, text, a, ring: false })

/* ---------------------------------------------------------------- structure */

// E8: 240 points in eight dimensions, each nothing but its relations to the others, turning
// in four hidden planes and casting a shadow in three. Nothing here can be damaged.
const S_R = 62
const S_ROOTS = e8Roots()
const S_ALL = e8Edges(S_ROOTS)
const S_EDGES = S_ALL.filter((_, i) => i % 6 === 0)
// one point's whole identity: its 56 nearest neighbours
const S_STAR = S_ALL.filter(([a, b]) => a === 0 || b === 0)
const S_MEMBERS = S_ROOTS.map((_, i) => i).filter((i) => i % 4 === 0)
const sGraph = graphOf(S_MEMBERS.map((i) => S_ROOTS[i]), 1.45, 72)
const sView = (t: number) => view(t, 0.05, 0.3)
const sScratch: number[] = []
const sPoint = (i: number, t: number, v: View): P => project(e8Shadow(S_ROOTS[i], t, sScratch), v, S_R)

// Conway's glider: four generations of it, worked out from the rule itself.
const GLIDER = (() => {
  let cells = new Set(['1,0', '2,1', '0,2', '1,2', '2,2'])
  const gens: [number, number][][] = []
  for (let g = 0; g < 4; g++) {
    const list = [...cells].map((c) => c.split(',').map(Number) as [number, number])
    const mx = Math.min(...list.map((c) => c[0]))
    const my = Math.min(...list.map((c) => c[1]))
    gens.push(list.map(([x, y]) => [x - mx, y - my]))
    const count = new Map<string, number>()
    for (const [x, y] of list) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (dx || dy) count.set(`${x + dx},${y + dy}`, (count.get(`${x + dx},${y + dy}`) ?? 0) + 1)
    const next = new Set<string>()
    for (const [c, n] of count) if (n === 3 || (n === 2 && cells.has(c))) next.add(c)
    cells = next
  }
  return gens
})()

// The Rule: a grid, and a pattern on it that the rule carries from each moment to the next.
function ruleGlyph(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 30, accent, 0.4)
    const c = 4.4
    ctx.beginPath()
    for (let k = 0; k <= 4; k++) {
      ctx.moveTo(-2 * c, (k - 2) * c)
      ctx.lineTo(2 * c, (k - 2) * c)
      ctx.moveTo((k - 2) * c, -2 * c)
      ctx.lineTo((k - 2) * c, 2 * c)
    }
    stroke(ctx, rgba(accent, 0.45), 0.4)
    for (const [gx, gy] of GLIDER[Math.floor(t * 2.6) % 4]) rrect(ctx, (gx - 1.5) * c - c / 2 + 0.5, (gy - 1.5) * c - c / 2 + 0.5, c - 1, c - 1, 0.6, '#fff6d6')
  })
}

const structure: Scene = {
  graph: sGraph,
  focus: [0, 0],
  socket(t) {
    const q = sPoint(S_MEMBERS[2], t, sView(t))
    return [q.x, q.y]
  },
  poke: () => 'nothing to flip',
  reset() {},
  draw(ctx, t, f, accent) {
    const v = sView(t)
    const all = S_ROOTS.map((_, i) => sPoint(i, t, v))
    const hush = 1 - 0.7 * born(f)
    wire(ctx, all, S_EDGES, accent, 0.085 * hush, 0.6)
    const star = Math.max(W(f, 0), W(f, 1))
    if (star > 0) wire(ctx, all, S_STAR, WHITE, 0.14 * star, 0.8)
    // a copy slides in, lands exactly on the original, and is the original
    const copy = W(f, 2)
    if (copy > 0) {
      const cyc = (t * 0.26) % 1
      const off = 60 * (1 - easeOut(Math.min(1, cyc * 1.5)))
      wire(ctx, all.map((q) => ({ ...q, x: q.x + off })), S_EDGES, WHITE, 0.1 * copy * (1 - seg(cyc, 0.7, 1)), 0.6)
    }
    // the leap: one axis is singled out, and the points are read along it, in order
    const sweep = f.leap > 0 ? ((t * 0.3) % 1) * 2.4 - 1.2 : 9
    const pts = S_MEMBERS.map((i) => all[i])
    for (let i = 0; i < all.length; i++) {
      const lit = Math.abs(all[i].x / S_R - sweep) < 0.14
      if (i % 4) mote(ctx, all[i], lit ? 1.3 : 0.7, lit ? WHITE : '#fff3c8', 0.7 * hush)
    }
    network(ctx, pts, sGraph, f, rgba(accent, 0.36), 0.5)
    pts.forEach((q, k) => mote(ctx, q, k === 0 && star > 0 ? 2.6 : 1.6, '#fff3c8', hush))
    if (f.leap > 0) {
      alpha(ctx, (1 - dividing(f)) * 0.8, () => {
        line(ctx, -88, 84, 88, 84, rgba(accent, 0.8), 0.6)
        line(ctx, 88, 84, 83, 81, rgba(accent, 0.8), 0.6)
        line(ctx, 88, 84, 83, 87, rgba(accent, 0.8), 0.6)
        circle(ctx, clamp(sweep * S_R, -88, 88), 84, 1.8, WHITE)
      })
      converge(ctx, pts, gathering(f), '#fff3c8', t)
      const d = dividing(f)
      note('read in this order →', 0, 72, gathering(f))
      for (const c of multiply(d, 52)) ruleGlyph(ctx, c.x, c.y, born(f) * c.s * (2.1 - 1.1 * d), t + c.i * 0.4, accent)
      say(f, 'structure')
    }
    tag(f, 0, 0, all[0].x, all[0].y)
    tag(f, 0, 1, all[0].x, all[0].y)
    tag(f, 0, 2, all[0].x + 20, all[0].y)
    tag(f, 0, 3, pts[5].x, pts[5].y)
    tag(f, 0, 4, 0, -78, false)
    tag(f, 0, 5, 0, -78, false)
    tag(f, 0, 6, 0, -78, false)
    tag(f, 0, 7, 0, 56, false)
  },
}

/* -------------------------------------------------------------------- field */

// A torus (one circle times another), wound with a single closed string. The beads on the
// string are its standing waves: the quanta. Each is a qubit, and none can be copied.
const F_R = 60
const F_TORUS = torus(1, 0.42, 30, 10)
const F_N = 56
const fBeads = (() => {
  const r = rng(11)
  return Array.from({ length: F_N }, (_, i) => ({ s: (i + r() * 0.7) / F_N, ph: r() * TAU, kind: Math.floor(r() * 3) }))
})()
function stringPoint(s: number, t: number, lock: number): V3 {
  const u = TAU * 2 * s
  const v = TAU * 3 * s + (1 - lock) * 0.9 * Math.sin(TAU * 5 * s + t * 1.3)
  const r = 0.42 * (1 + 0.1 * Math.sin(TAU * 12 * s) * Math.sin(t * 5) + (1 - lock) * 0.14 * Math.sin(TAU * 17 * s - t * 3))
  return torusPoint(u, v, 1, r)
}
const fGraph = graphOf(fBeads.map((b) => stringPoint(b.s, 0, 1)), 0.62, 12)
const fView = (t: number) => view(t, 0.11, 0.62)
const fWounds = new Wounds()
let fLast: XY[] = []

// A qubit, drawn the way physicists draw one: a sphere, 0 at the top, 1 at the bottom, and
// the state an arrow that can point anywhere on it.
function bloch(ctx: Ctx, x: number, y: number, r: number, t: number, accent: string) {
  at(ctx, x, y, 1, 0, () => {
    circle(ctx, 0, 0, r, 'rgba(10,4,14,.72)')
    stroke(ctx, rgba(WHITE, 0.8), 0.7)
    ellipse(ctx, 0, 0, r, r * 0.3)
    stroke(ctx, rgba(WHITE, 0.35), 0.5)
    line(ctx, 0, -r, 0, r, rgba(WHITE, 0.3), 0.4)
    const th = 1.05 + 0.5 * Math.sin(t * 0.7)
    const ph = t * 1.1
    const tx = Math.sin(th) * Math.cos(ph) * r
    const ty = -Math.cos(th) * r + Math.sin(th) * Math.sin(ph) * r * 0.3
    line(ctx, 0, 0, tx, ty, accent, 1.2)
    circle(ctx, tx, ty, 1.8, accent)
    text(ctx, '0', 0, -r - 5.5, 7, WHITE, MONO)
    text(ctx, '1', 0, r + 6, 7, WHITE, MONO)
  })
}

// The Fact: one definite thing, ringed by the copies of itself that made it definite.
function fact(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 30, accent, 0.45)
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU + t * 0.3
      circle(ctx, Math.cos(a) * 13, Math.sin(a) * 13, 1.2, rgba(accent, 0.9))
      line(ctx, Math.cos(a) * 6.5, Math.sin(a) * 6.5, Math.cos(a) * 11, Math.sin(a) * 11, rgba(WHITE, 0.25), 0.4)
    }
    circle(ctx, 0, 0, 5, '#fff3f8')
    ctx.beginPath()
    ctx.moveTo(-2.4, 0.2)
    ctx.lineTo(-0.6, 2)
    ctx.lineTo(2.6, -1.8)
    stroke(ctx, '#2b1030', 1.1)
  })
}

const field: Scene = {
  graph: fGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(stringPoint(fBeads[0].s, t, 0.35), fView(t), F_R)
    return [q.x, q.y]
  },
  poke(x, y, t) {
    fWounds.hit(nearest(fLast, x, y), t)
    return 'disturbed, not lost'
  },
  reset: () => fWounds.clear(),
  draw(ctx, t, f, accent) {
    const v = fView(t)
    const lock = 0.35 + 0.65 * easeInOut(f.link)
    const hush = 1 - 0.6 * born(f)
    const tor = F_TORUS.verts.map((q) => project(q, v, F_R))
    faces(tor, F_TORUS.tris, accent, 0.05 * hush)
    wire(ctx, tor, F_TORUS.edges, accent, 0.3 * hush, 0.9)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    // the string itself, in two passes so the far half sits behind the near half
    const curve = Array.from({ length: 181 }, (_, k) => project(stringPoint(k / 180, t, lock), v, F_R))
    for (const near of [false, true]) {
      ctx.beginPath()
      for (let k = 0; k < 180; k++) {
        if (curve[k].z + curve[k + 1].z > 0 !== near) continue
        ctx.moveTo(curve[k].x, curve[k].y)
        ctx.lineTo(curve[k + 1].x, curve[k + 1].y)
      }
      stroke(ctx, rgba(WHITE, (near ? 0.75 : 0.25) * hush), near ? 1.1 : 0.7)
    }
    ctx.restore()

    const pts = fBeads.map((b) => project(stringPoint(b.s, t, lock), v, F_R))
    fLast = pts
    network(ctx, pts, fGraph, f, rgba(accent, 0.4), 0.5)
    const a0 = pts[0]
    fBeads.forEach((b, i) => {
      const q = pts[i]
      // a disturbed bead shakes, then settles: the information has moved on, not gone
      const age = fWounds.age(i, t)
      if (age >= 0 && age < 1.4) {
        const k = 1 - age / 1.4
        ctx.beginPath()
        ctx.arc(q.x, q.y, 3 + 9 * (1 - k), 0, TAU)
        stroke(ctx, rgba(WHITE, k), 0.6)
        mote(ctx, { ...q, x: q.x + Math.sin(t * 40) * 1.6 * k }, 2, WHITE)
      } else {
        if (age >= 1.4) fWounds.heal(i)
        mote(ctx, q, i === 0 ? 2.4 : b.kind === 0 ? 1.7 : 1.2, b.kind === 1 ? accent : '#ffe6f0', hush)
      }
    })
    fWounds.auto(f, t, F_N, 2.4)
    // the qubit
    alpha(ctx, W(f, 1), () => bloch(ctx, 0, 0, 19, t, accent))
    // an attempt to make two of one bead: the halves will not separate
    const copy = W(f, 2)
    if (copy > 0) {
      const cyc = (t * 0.45) % 1
      const d = 13 * Math.sin(Math.min(1, cyc * 1.6) * Math.PI)
      alpha(ctx, copy, () => {
        circle(ctx, a0.x - d, a0.y, 2.2, rgba('#ffe6f0', 0.6))
        circle(ctx, a0.x + d, a0.y, 2.2, rgba('#ffe6f0', 0.6))
        alpha(ctx, pulse(cyc, 0.28, 0.5, 0.05), () => {
          line(ctx, a0.x - 4, a0.y - 4, a0.x + 4, a0.y + 4, RED, 1.2)
          line(ctx, a0.x + 4, a0.y - 4, a0.x - 4, a0.y + 4, RED, 1.2)
        })
      })
    }
    if (f.leap > 0) {
      // the surroundings: a crowd of small things, each of which carries off the same imprint
      alpha(ctx, gathering(f), () => {
        for (let k = 0; k < 28; k++) {
          const u = (t * 0.5 + k / 28) % 1
          const ang = k * GOLDEN_ANGLE
          const r = 6 + u * 70
          circle(ctx, a0.x + Math.cos(ang) * r, a0.y + Math.sin(ang) * r * 0.8, 0.9, u > 0.15 ? accent : WHITE)
        }
      })
      converge(ctx, pts, gathering(f), '#ffe6f0', t)
      const d = dividing(f)
      for (const c of multiply(d, 52)) fact(ctx, c.x, c.y, born(f) * c.s * (1.9 - 1.0 * d), t + c.i, accent)
      say(f, 'field')
    }
    tag(f, 1, 0, a0.x, a0.y)
    tag(f, 1, 1, 0, -40, false)
    tag(f, 1, 2, a0.x, a0.y)
    tag(f, 1, 3, pts[9].x, pts[9].y)
    tag(f, 1, 4, 0, -80, false)
    tag(f, 1, 5, 0, -80, false)
    tag(f, 1, 6, 0, -80, false)
    tag(f, 1, 7, a0.x, a0.y)
  },
}

/* ------------------------------------------------------------------ element */

// Matter. A star at the centre, forging carbon, inside the lattice carbon makes when left
// to itself: diamond, every atom holding four others. It lasts. It does not heal.
const M_R = 62
const M_LAT = diamond()
// a crystal repeats: two kinds of site, alternating, ABAB
const M_KIND = M_LAT.verts.map((q) => (Math.round((q[0] + q[1] + q[2]) * 4) % 2 === 0 ? 0 : 1))
const mGraph = graphOf(M_LAT.verts, 0.75, 32)
const mView = (t: number) => view(t, 0.07, 0.42)
const mWounds = new Wounds()
let mLast: XY[] = []
const M_A = M_LAT.verts.findIndex((q) => q[0] > 0.4 && q[1] < -0.4 && q[2] > 0.2)
const BASE_COLORS = ['#ff7d7d', '#5fd4e6', '#b6f08a', '#ffd166']

// The Replicator: a chain that never repeats, with a second chain assembling along it.
function replicator(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  at(ctx, x, y, s, -0.3, () => {
    glow(ctx, 0, 0, 30, accent, 0.4)
    const made = ((t * 0.5) % 1.4) * 9
    for (let k = 0; k < 9; k++) {
      const px = (k - 4) * 4.6
      const py = Math.sin(k * 0.8) * 2.4
      if (k) line(ctx, px - 4.6, Math.sin((k - 1) * 0.8) * 2.4 - 3, px, py - 3, rgba(WHITE, 0.6), 0.6)
      const base = (k * 7 + 3) % 4
      circle(ctx, px, py - 3, 1.9, BASE_COLORS[base])
      if (k < made) {
        line(ctx, px, py - 1, px, py + 3, rgba(WHITE, 0.35), 0.4)
        circle(ctx, px, py + 4, 1.9, BASE_COLORS[complement(base)])
      }
    }
  })
}

const element: Scene = {
  graph: mGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(M_LAT.verts[M_A], mView(t), M_R)
    return [q.x, q.y]
  },
  poke(x, y, t) {
    mWounds.hit(nearest(mLast, x, y), t)
    return 'knocked out. it stays out.'
  },
  reset: () => mWounds.clear(),
  draw(ctx, t, f, accent) {
    const v = mView(t)
    const hush = 1 - 0.55 * born(f)
    // crystal growth: the top layers arrive atom by atom and take up the pattern below
    const grow = W(f, 2)
    const cyc = (t * 0.2) % 1
    const arrive = (i: number) => {
      const q = M_LAT.verts[i]
      if (grow <= 0 || q[1] > -0.4) return 1
      return lerp(1, easeOut(seg(cyc, 0.05 + hash(i, 1) * 0.5, 0.35 + hash(i, 1) * 0.5)), grow)
    }
    const pts = M_LAT.verts.map((q, i) => {
      const w = project(q, v, M_R)
      w.y -= (1 - arrive(i)) * 46
      return w
    })
    mLast = pts
    const whole = M_LAT.edges.filter(([a, b]) => mWounds.age(a, t) < 0 && mWounds.age(b, t) < 0 && arrive(a) > 0.98 && arrive(b) > 0.98)
    wire(ctx, pts, whole, accent, 0.32 * hush, 0.9)
    // the star: what holds out against the dark, and where carbon is made
    const sun = hush * (0.8 + 0.2 * Math.sin(t * 2.2))
    glow(ctx, 0, 0, 34, '#ffd28a', 0.7 * sun)
    circle(ctx, 0, 0, 5.5, rgba('#fff4d6', hush))
    const fuse = W(f, 3)
    if (fuse > 0) {
      const c3 = (t * 0.4) % 1
      alpha(ctx, fuse, () => {
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * TAU + 0.5
          const r = 34 * (1 - easeInOut(Math.min(1, c3 * 1.5)))
          circle(ctx, Math.cos(a) * r, Math.sin(a) * r, 1.7, '#bfe6ff')
        }
        alpha(ctx, pulse(c3, 0.66, 0.9, 0.04), () => {
          glow(ctx, 0, 0, 22, WHITE, 0.9)
          circle(ctx, 14 * seg(c3, 0.66, 0.95), -10 * seg(c3, 0.66, 0.95), 2.2, accent)
        })
      })
    }
    network(ctx, pts, mGraph, f, rgba(WHITE, 0.3), 0.5)
    const abab = W(f, 4)
    M_LAT.verts.forEach((_, i) => {
      if (mWounds.age(i, t) >= 0) {
        // a vacancy: the atom is gone and nothing puts it back
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, 2.4 * pts[i].k, 0, TAU)
        stroke(ctx, rgba(RED, 0.8 * depthShade(pts[i].z)), 0.5)
        return
      }
      const two = M_KIND[i] ? '#ffe2b8' : accent
      mote(ctx, pts[i], i === M_A && W(f, 1) > 0 ? 3 : 1.7 + 0.5 * abab * Math.sin(t * 3 + M_KIND[i] * Math.PI), abab > 0 ? two : '#ffe2b8', arrive(i) * hush)
    })
    // one atom, close up: six protons is what makes it carbon
    const a1 = pts[M_A]
    alpha(ctx, W(f, 1), () => {
      const cx = clamp(a1.x + 26, -70, 70)
      const cy = a1.y - 4
      line(ctx, a1.x, a1.y, cx, cy, rgba(WHITE, 0.5), 0.4)
      circle(ctx, cx, cy, 11, 'rgba(14,7,3,.85)')
      stroke(ctx, rgba(WHITE, 0.7), 0.6)
      for (let k = 0; k < 12; k++) {
        const a = k * GOLDEN_ANGLE
        const r = Math.sqrt(k + 0.5) * 2.1
        circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.5, k % 2 ? '#ff7d5a' : '#b9c4d6')
      }
    })
    if (f.leap > 0) {
      // a chain of carbon grows out of the crystal, and it does not repeat
      alpha(ctx, gathering(f), () => {
        const n = Math.floor(seg(f.leap, 0, 0.3) * 14)
        for (let k = 0; k < n; k++) circle(ctx, 8 + k * 5.4, -6 - k * 2.2 + Math.sin(k * 1.3 + t) * 3, 1.8, BASE_COLORS[(k * 7 + 3) % 4])
      })
      converge(ctx, pts, gathering(f), '#ffe2b8', t)
      const d = dividing(f)
      for (const c of multiply(d, 52)) replicator(ctx, c.x, c.y, born(f) * c.s * (1.8 - 0.9 * d), t + c.i * 0.3, accent)
      say(f, 'element')
    }
    tag(f, 2, 0, 0, 0)
    tag(f, 2, 1, a1.x, a1.y)
    tag(f, 2, 2, 0, -62, false)
    tag(f, 2, 3, 0, 0)
    tag(f, 2, 4, 0, -80, false)
    tag(f, 2, 5, a1.x, a1.y)
    tag(f, 2, 6, 0, -80, false)
    tag(f, 2, 7, 0, 58, false)
  },
}

/* --------------------------------------------------------------------- gene */

// The double helix, to its real proportions, with the population it belongs to drifting
// round it. It unzips to copy itself, and mends a broken rung before your eyes: usually.
const G_N = 22
const G_R = 21
const G_HELIX = helix(G_N)
const gCells = (() => {
  const r = rng(41)
  return fibSphere(64)
    .filter((q) => Math.abs(q[0]) > 0.42 || Math.abs(q[2]) > 0.6)
    .map((q) => ({ pos: [q[0] * 1.08, q[1] * 0.8, q[2] * 1.08] as V3, ph: r() * TAU, s: 0.8 + r() * 0.5 }))
})()
const gGraph = graphOf(gCells.map((c) => c.pos), 0.6, 42)
// the bag of water the helix is kept in: one cell, close up
const G_CELL = (() => {
  const verts = fibSphere(120).map((q) => [q[0] * 0.5, q[1], q[2] * 0.5] as V3)
  const edges: [number, number][] = []
  for (let i = 0; i < 120; i++) for (const k of [8, 13]) if (i + k < 120) edges.push([i, i + k])
  return { verts, edges }
})()
const gView = (t: number) => view(t, 0.3, 0.1)
const gCloud = (t: number) => view(t, 0.05, 0.25)
const gWounds = new Wounds()
// rungs where a mistake got past the proofreader: these stay changed
const gMutations = new Map<number, number>()
let gLast: XY[] = []
const G_A = 10

// The Neuron: a cell body, branches to listen with, one long fibre to speak down.
function neuron(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, -8, 0, 26, accent, 0.4)
    for (let k = 0; k < 5; k++) {
      const a = Math.PI * (0.62 + k * 0.19)
      const ex = -8 + Math.cos(a) * 11
      const ey = Math.sin(a) * 11
      line(ctx, -8, 0, ex, ey, '#f1ffe0', 0.9)
      line(ctx, ex, ey, ex + Math.cos(a + 0.6) * 5, ey + Math.sin(a + 0.6) * 5, '#f1ffe0', 0.6)
      line(ctx, ex, ey, ex + Math.cos(a - 0.6) * 5, ey + Math.sin(a - 0.6) * 5, '#f1ffe0', 0.6)
    }
    ctx.beginPath()
    ctx.moveTo(-8, 0)
    ctx.quadraticCurveTo(6, -5, 22, 0)
    stroke(ctx, '#f1ffe0', 1.1)
    for (const dy of [-3, 0, 3]) circle(ctx, 24, dy, 1.1, '#f1ffe0')
    circle(ctx, -8, 0, 4.6, '#f1ffe0')
    circle(ctx, -8, 0, 2, accent)
    // the spike, on its way down the fibre
    const u = (t * 1.1) % 1
    circle(ctx, lerp(-8, 22, u), -5 * Math.sin(u * Math.PI) * 0.5, 1.7, WHITE)
  })
}

const gene: Scene = {
  graph: gGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(gCells[3].pos, gCloud(t), 84)
    return [q.x, q.y]
  },
  poke(x, y, t) {
    const i = nearest(gLast, x, y)
    gWounds.hit(i, t)
    return gWounds.hits % 4 === 0 ? 'missed one: a mutation' : 'broken, and mended'
  },
  reset() {
    gWounds.clear()
    gMutations.clear()
  },
  draw(ctx, t, f, accent) {
    const hush = 1 - 0.8 * born(f)
    // the population: every one of these carries its own copy
    const cv = gCloud(t)
    const cells = gCells.map((c) => project(c.pos, cv, 84))
    network(ctx, cells, gGraph, f, rgba(accent, 0.34), 0.5)
    const calling = f.leap > 0 ? gathering(f) : 0
    gCells.forEach((c, i) => {
      const q = cells[i]
      const a = 0.3 + 0.7 * depthShade(q.z)
      at(ctx, q.x, q.y, c.s * q.k, c.ph + Math.sin(t * 0.4 + c.ph) * 0.3, () => {
        ctx.globalAlpha = a
        rrect(ctx, -3.6, -1.6, 7.2, 3.2, 1.6, rgba(accent, 0.22))
        stroke(ctx, rgba('#eaffd6', 0.8), 0.45)
        ctx.globalAlpha = 1
      })
      // quorum sensing: each cell lets molecules go, and counts what comes back
      if (calling > 0) for (let k = 0; k < 3; k++) alpha(ctx, calling * a * 0.8, () => circle(ctx, q.x + Math.cos(c.ph + k * 2.1 + t) * (4 + ((t * 6 + k * 3) % 9)), q.y + Math.sin(c.ph + k * 2.1 + t) * (4 + ((t * 6 + k * 3) % 9)), 0.6, '#eaffd6'))
    })

    // the helix. While copying, it unzips from the top and each half rebuilds the other.
    const v = gView(t)
    wire(ctx, G_CELL.verts.map((q) => project(q, cv, 88)), G_CELL.edges, accent, 0.13 * hush, 0.6)
    const copy = W(f, 2)
    const fork = copy * ((t * 0.11) % 1) * (G_N + 9)
    const open = (i: number) => clamp((fork - i) / 5)
    const fresh = (i: number) => clamp((fork - i - 3) / 5)
    const aP = G_HELIX.a.map((q) => project(q, v, G_R))
    const bP = G_HELIX.b.map((q) => project(q, v, G_R))
    gLast = aP.map((q, i) => ({ x: (q.x + bP[i].x) / 2, y: q.y }))
    gWounds.auto(f, t, G_N, 2.3)
    const D = 23
    const shifted = (pts: P[], dir: number) => pts.map((q, i) => ({ ...q, x: q.x + dir * D * open(i) }))
    // drawn back to front, so the near strand crosses over the far one as a helix should
    const bars: { z: number; draw: () => void }[] = []
    const bar = (p: P, q: P, color: string, a: number, w: number) => {
      if (a <= 0.02) return
      const z = (p.z + q.z) / 2
      bars.push({ z, draw: () => line(ctx, p.x, p.y, q.x, q.y, rgba(color, a * (0.3 + 0.7 * depthShade(z))), w * ((p.k + q.k) / 2)) })
    }
    // left daughter keeps the old strand a; right daughter keeps the old strand b
    for (const [dir, sa, sb] of [[-1, shifted(aP, -1), shifted(bP, -1)], [1, shifted(aP, 1), shifted(bP, 1)]] as [number, P[], P[]][]) {
      for (let i = 0; i < G_N; i++) {
        const o = open(i)
        if (dir === 1 && o <= 0) continue
        const aA = (dir === -1 ? 1 : fresh(i)) * hush
        const aB = (dir === -1 ? (o > 0 ? fresh(i) : 1) : 1) * hush
        if (i + 1 < G_N) {
          bar(sa[i], sa[i + 1], '#f3ffe6', aA, 2.6)
          bar(sb[i], sb[i + 1], '#f3ffe6', aB, 2.6)
          // and the same strands on the layer that glows
          strut(ctx, sa[i], sa[i + 1], accent, 0.5 * aA)
          strut(ctx, sb[i], sb[i + 1], accent, 0.5 * aB)
        }
        const age = gWounds.age(i, t)
        const base = gMutations.get(i) ?? G_HELIX.bases[i]
        const mid: P = { x: (sa[i].x + sb[i].x) / 2, y: (sa[i].y + sb[i].y) / 2, z: (sa[i].z + sb[i].z) / 2, k: (sa[i].k + sb[i].k) / 2 }
        if (age >= 0 && age < 1.7 && dir === -1) {
          // a broken rung: wrong letter, and the proofreader on its way down to it
          bar(sa[i], mid, RED, 1, 2.4)
          const ring = lerp(Math.max(0, i - 6), i, easeInOut(Math.min(1, age / 1.3)))
          const ri = Math.min(G_N - 1, Math.floor(ring))
          const ry = lerp(sa[ri].y, sa[Math.min(G_N - 1, ri + 1)].y, ring - ri)
          bars.push({
            z: 9,
            draw: () => {
              ctx.beginPath()
              ctx.arc((sa[ri].x + sb[ri].x) / 2, ry, 7, 0, TAU)
              stroke(ctx, WHITE, 1.1)
            },
          })
        } else {
          if (age >= 1.7) {
            if (gWounds.hits % 4 === 0) gMutations.set(i, (G_HELIX.bases[i] + 1 + (i % 3)) % 4)
            gWounds.heal(i)
          }
          const hot = i === G_A && W(f, 1) > 0 ? 1.6 : 1
          bar(sa[i], mid, BASE_COLORS[base], aA, 2 * hot)
          bar(mid, sb[i], BASE_COLORS[complement(base)], aB, 2 * hot)
        }
      }
    }
    glow(ctx, 0, 0, 70, accent, 0.1 * hush)
    bars.sort((p, q) => p.z - q.z).forEach((item) => item.draw())
    // the polymerase, riding the fork
    if (copy > 0 && fork > 0.5 && fork < G_N) {
      const k = Math.floor(fork)
      alpha(ctx, copy, () => {
        ctx.beginPath()
        ctx.arc((aP[k].x + bP[k].x) / 2, aP[k].y, 11, 0, TAU)
        stroke(ctx, rgba(accent, 0.95), 1.4)
      })
    }
    // one rung, read out: a letter is two bits
    const ra = gLast[G_A]
    alpha(ctx, W(f, 1), () => {
      const b = G_HELIX.bases[G_A]
      const bx = 52
      line(ctx, ra.x + 14, ra.y, bx - 14, ra.y, rgba(WHITE, 0.5), 0.4)
      rrect(ctx, bx - 14, ra.y - 6, 9, 12, 1.5, BASE_COLORS[b])
      text(ctx, 'ACGT'[b], bx - 9.5, ra.y + 0.4, 7, '#10200c', MONO)
      for (let k = 0; k < 2; k++) {
        rrect(ctx, bx + k * 10, ra.y - 6, 9, 12, 1.5, 'rgba(6,16,10,.85)')
        stroke(ctx, rgba(WHITE, 0.7), 0.5)
        text(ctx, String((b >> (1 - k)) & 1), bx + 4.5 + k * 10, ra.y + 0.4, 7, WHITE, MONO)
      }
    })
    // learning, the only way this substrate can: a family tree with most branches cut
    alpha(ctx, W(f, 4), () => {
      const node = (g: number, k: number): [number, number] => [50 + g * 14, (k - (2 ** g - 1) / 2) * (44 / 2 ** g) * 1.5]
      for (let g = 0; g < 4; g++) {
        for (let k = 0; k < 2 ** g; k++) {
          const [x, y] = node(g, k)
          const dead = g > 0 && hash(g * 16 + k, 5) < 0.45
          if (g < 3) for (const c of [0, 1]) line(ctx, x, y, ...node(g + 1, k * 2 + c), rgba(WHITE, 0.35), 0.4)
          if (dead) {
            line(ctx, x - 1.8, y - 1.8, x + 1.8, y + 1.8, RED, 0.8)
            line(ctx, x + 1.8, y - 1.8, x - 1.8, y + 1.8, RED, 0.8)
          } else circle(ctx, x, y, 1.9, accent)
        }
      }
    })
    if (f.leap > 0) {
      converge(ctx, cells, gathering(f), '#eaffd6', t)
      const d = dividing(f)
      for (const c of multiply(d, 54)) neuron(ctx, c.x, c.y, born(f) * c.s * (2 - 1.1 * d), t + c.i * 0.37, accent)
      say(f, 'gene', 0, -34)
    }
    tag(f, 3, 0, ra.x, gLast[5].y)
    tag(f, 3, 1, ra.x, ra.y)
    tag(f, 3, 2, gLast[2].x, gLast[2].y)
    tag(f, 3, 3, gLast[15].x, gLast[15].y)
    tag(f, 3, 4, 64, -36, false)
    tag(f, 3, 5, gLast[17].x, gLast[17].y)
    tag(f, 3, 6, cells[3].x, cells[3].y)
    tag(f, 3, 7, 0, 58, false)
  },
}

/* -------------------------------------------------------------------- nerve */

// A ball of nerve cells, sown by the golden angle, wired to their neighbours. Spikes run
// along the wiring all the time. Tap one and it fires, tells the cells it touches, and
// recovers: the first substrate that visibly does something about being poked.
const N_R = 72
const N_SHELL = (() => {
  const verts = fibSphere(144)
  const edges: [number, number][] = []
  for (let i = 0; i < 144; i++) for (const k of [8, 13]) if (i + k < 144) edges.push([i, i + k])
  return { verts, edges }
})()
const nCells = (() => {
  const r = rng(31)
  return fibSphere(56).map((d) => {
    const rad = 0.25 + 0.68 * Math.pow(r(), 0.8)
    return { pos: [d[0] * rad, d[1] * rad, d[2] * rad] as V3, ph: r() * TAU }
  })
})()
const nGraph = graphOf(nCells.map((c) => c.pos), 0.52, 32)
// the wiring that is always there: each cell's dendrites to a few neighbours
const N_WIRES = nGraph.edges.filter((_, i) => i % 3 === 0)
const nNeighbours = nCells.map((_, i) => nGraph.edges.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a)).slice(0, 5))
const nView = (t: number) => view(t, 0.06, 0.3)
const nWounds = new Wounds()
let nLast: XY[] = []
const N_A = 4
const N_B = nNeighbours[N_A][0] ?? 5
// a habit in one animal (left), and the same habit picked up by another (right)
const byX = nCells.map((c, i) => [c.pos[0], i]).sort((a, b) => a[0] - b[0]).map((c) => c[1])
const N_TEACHER = byX.slice(0, 5)
const N_PUPIL = byX.slice(-5)
// one trial, one path
const N_PATH = (() => {
  const path = [N_A]
  for (let k = 0; k < 3; k++) {
    const next = nNeighbours[path[path.length - 1]].find((j) => !path.includes(j))
    if (next === undefined) break
    path.push(next)
  }
  return path
})()

// The Word: a sound with a meaning, on its way out of one head.
function word(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 34, accent, 0.4)
    for (let k = 1; k <= 3; k++) {
      ctx.beginPath()
      ctx.arc(0, 0, 9 + k * 5 + ((t * 5) % 5), -0.5, 0.5)
      stroke(ctx, rgba(accent, 0.7 - k * 0.17), 0.7)
      ctx.beginPath()
      ctx.arc(0, 0, 9 + k * 5 + ((t * 5) % 5), Math.PI - 0.5, Math.PI + 0.5)
      stroke(ctx, rgba(accent, 0.7 - k * 0.17), 0.7)
    }
    bubble(ctx, '· · ·', 0, 0, 6.4, 0)
  })
}

const nerve: Scene = {
  graph: nGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(nCells[9].pos, nView(t), N_R)
    return [q.x, q.y]
  },
  poke(x, y, t) {
    nWounds.hit(nearest(nLast, x, y), t)
    return 'fired, and recovered'
  },
  reset: () => nWounds.clear(),
  draw(ctx, t, f, accent) {
    const v = nView(t)
    const hush = 1 - 0.6 * born(f)
    wire(ctx, N_SHELL.verts.map((q) => project(q, v, N_R)), N_SHELL.edges, accent, 0.2 * hush, 0.8)
    const pts = nCells.map((c) => project(c.pos, v, N_R))
    nLast = pts
    nWounds.auto(f, t, nCells.length, 2.1)
    wire(ctx, pts, N_WIRES, accent, 0.3 * hush, 0.7)
    network(ctx, pts, nGraph, f, rgba(WHITE, 0.4), 0.6)
    // spikes, always: this substrate is never still
    N_WIRES.forEach(([a, b], k) => {
      if (k % 3) return
      const u = (t * 0.9 + k * 0.37) % 1
      alpha(ctx, 0.8 * hush * Math.sin(u * Math.PI), () => circle(ctx, lerp(pts[a].x, pts[b].x, u), lerp(pts[a].y, pts[b].y, u), 1, WHITE))
    })
    // which cells are lit by something a beat is showing
    const lit = new Map<number, number>()
    const together = W(f, 1) * Math.max(0, Math.sin(t * 2.4)) ** 6
    if (together > 0) {
      lit.set(N_A, together)
      lit.set(N_B, together)
    }
    const copy = W(f, 2)
    if (copy > 0) {
      const stepNow = Math.floor(t * 2.4) % 9
      N_TEACHER.forEach((i, k) => stepNow === k && lit.set(i, copy))
      // the pupil gets most of it, a beat late, and one move wrong
      N_PUPIL.forEach((i, k) => stepNow === k + 3 && k !== 3 && lit.set(i, copy))
    }
    nWounds.each((i) => {
      const age = nWounds.age(i, t)
      if (age > 1) return nWounds.heal(i)
      lit.set(i, 1 - age)
      if (age > 0.12) for (const j of nNeighbours[i]) lit.set(j, Math.max(lit.get(j) ?? 0, 1 - age) * 0.8)
      ctx.beginPath()
      ctx.arc(pts[i].x, pts[i].y, 3 + age * 16, 0, TAU)
      stroke(ctx, rgba(WHITE, 1 - age), 0.7)
    })
    nCells.forEach((_, i) => {
      const k = lit.get(i) ?? 0
      mote(ctx, pts[i], 1.9 + 1.6 * k, k > 0.05 ? WHITE : '#e6d4ff', hush)
      if (k > 0.05) glow(ctx, pts[i].x, pts[i].y, 9 * k, accent, 0.8 * k)
    })
    // the synapse between two of them, getting stronger each time they fire together
    if (W(f, 1) > 0) strut(ctx, pts[N_A], pts[N_B], WHITE, W(f, 1) * (0.5 + 0.5 * together), 2.2)
    if (copy > 0) {
      const mid = (ids: number[]) => ({ x: ids.reduce((s, i) => s + pts[i].x, 0) / ids.length, y: ids.reduce((s, i) => s + pts[i].y, 0) / ids.length })
      const a = mid(N_TEACHER)
      const b = mid(N_PUPIL)
      alpha(ctx, copy * 0.8, () => {
        ctx.setLineDash([2.5, 2.5])
        ctx.beginPath()
        ctx.moveTo(a.x, a.y - 8)
        ctx.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 44, b.x, b.y - 8)
        stroke(ctx, WHITE, 0.6)
        ctx.setLineDash([])
      })
      note('watching', (a.x + b.x) / 2, Math.min(a.y, b.y) - 34, copy)
    }
    // one trial: a path through the network that was not there this morning
    const learnt = W(f, 4)
    if (learnt > 0) for (let k = 0; k + 1 < N_PATH.length; k++) strut(ctx, pts[N_PATH[k]], pts[N_PATH[k + 1]], WHITE, learnt * seg(f.beat === 4 ? f.u : 1, k * 0.25, k * 0.25 + 0.4), 2.2)
    if (f.leap > 0) {
      converge(ctx, pts, gathering(f), '#e6d4ff', t)
      const d = dividing(f)
      for (const c of multiply(d, 52)) word(ctx, c.x, c.y, born(f) * c.s * (1.7 - 0.9 * d), t + c.i * 0.3, accent)
      say(f, 'nerve')
    }
    const pa = pts[N_A]
    tag(f, 4, 0, pa.x, pa.y)
    tag(f, 4, 1, (pa.x + pts[N_B].x) / 2, (pa.y + pts[N_B].y) / 2)
    tag(f, 4, 2, pts[N_PUPIL[3]].x, pts[N_PUPIL[3]].y)
    tag(f, 4, 3, pts[12].x, pts[12].y)
    tag(f, 4, 4, pts[N_PATH[N_PATH.length - 1]].x, pts[N_PATH[N_PATH.length - 1]].y)
    tag(f, 4, 5, 0, -84, false)
    tag(f, 4, 6, 0, -84, false)
    tag(f, 4, 7, 0, 58, false)
  },
}

/* --------------------------------------------------------------------- word */

// Us. A crowd, sown like a sunflower head because that is how you pack people into a
// square, under thirteen spheres with every centre joined to every other. A mistake put
// into one person spreads to the people they talk to, and then somebody checks.
const H_R = 50
const H_CUBE = metatron()
const hPeople = (() => {
  const r = rng(41)
  return Array.from({ length: 62 }, (_, i) => {
    const rad = Math.sqrt((i + 0.5) / 62) * 1.7
    return { pos: [Math.cos(i * GOLDEN_ANGLE) * rad, 1.05, Math.sin(i * GOLDEN_ANGLE) * rad] as V3, ph: r() * TAU, tone: Math.floor(r() * 3), s: 0.85 + r() * 0.4 }
  })
})()
const hGraph = graphOf(hPeople.map((h) => h.pos), 0.56, 42)
const hNeighbours = hPeople.map((_, i) => hGraph.edges.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a)).slice(0, 3))
// 35.26° tips the cube onto a corner, which is the view the flat drawing is a shadow of
const hView = (t: number) => view(t, 0.08, 0.6155)
const H_TONES = ['#e6efff', '#a9c8ff', '#ffe1bd']
const hWounds = new Wounds()
let hLast: XY[] = []
const H_A = 20

function page(ctx: Ctx, x: number, y: number, s: number, fill: string) {
  at(ctx, x, y, s, 0, () => {
    rrect(ctx, -3.4, -4.4, 6.8, 8.8, 0.7, fill)
    for (let k = 0; k < 4; k++) line(ctx, -2.2, -2.6 + k * 1.8, k === 3 ? 0.6 : 2.2, -2.6 + k * 1.8, 'rgba(20,28,50,.7)', 0.45)
  })
}

// The Model: a box that types what the library would probably have said next.
function model(ctx: Ctx, x: number, y: number, s: number, t: number, typed: number, line0: string, accent: string) {
  at(ctx, x, y, s, 0, () => {
    ctx.font = `6px ${MONO}`
    const w = Math.max(30, ctx.measureText(line0).width + 14)
    glow(ctx, 0, 0, 36, accent, 0.4)
    rrect(ctx, -w / 2, -8, w, 16, 3.6, 'rgba(6,14,32,.92)')
    stroke(ctx, accent, 0.8)
    const shown = line0.slice(0, Math.round(line0.length * typed))
    ctx.font = `6px ${MONO}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#eaf6ff'
    ctx.fillText(shown, -w / 2 + 6, 0.3)
    if (Math.sin(t * 6) > 0 || typed < 1) rrect(ctx, -w / 2 + 6.8 + ctx.measureText(shown).width, -3.2, 2.2, 6.4, 0, accent)
  })
}

const wordScene: Scene = {
  graph: hGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(hPeople[9].pos, hView(t), H_R)
    return [q.x, q.y]
  },
  poke(x, y, t) {
    hWounds.hit(nearest(hLast, x, y), t)
    return 'a mistake: spread, then checked'
  },
  reset: () => hWounds.clear(),
  draw(ctx, t, f, accent) {
    const v = hView(t)
    const hush = 1 - 0.5 * born(f)
    // the cube floats a little above the crowd
    const cube13 = H_CUBE.verts.map((q) => {
      const w = project(q, v, H_R)
      w.y -= 12
      return w
    })
    orbs(ctx, cube13, 0.5 * H_R, accent, 0.2 * hush)
    wire(ctx, cube13, H_CUBE.edges, accent, 0.24 * hush, 0.8)
    const pts = hPeople.map((h) => project(h.pos, v, H_R))
    hLast = pts
    hWounds.auto(f, t, hPeople.length, 2.6)
    network(ctx, pts, hGraph, f, rgba(accent, 0.35), 0.5)
    // who currently believes the mistake
    const wrong = new Map<number, number>()
    hWounds.each((i) => {
      const age = hWounds.age(i, t)
      if (age > 2.4) return hWounds.heal(i)
      const k = 1 - seg(age, 1.5, 2.2)
      wrong.set(i, k)
      if (age > 0.5) for (const j of hNeighbours[i]) wrong.set(j, Math.max(wrong.get(j) ?? 0, k))
      // the check: somebody counts the letters
      if (age > 1.3) {
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y - 2, (age - 1.3) * 22, 0, TAU)
        stroke(ctx, rgba('#9ff0b0', 1 - seg(age, 1.3, 2.4)), 0.8)
      }
    })
    const pagesUp = f.leap > 0 ? gathering(f) : 0
    hPeople.forEach((h, i) => {
      const q = pts[i]
      const a = (0.4 + 0.6 * depthShade(q.z)) * hush
      const s = h.s * q.k
      const fill = (wrong.get(i) ?? 0) > 0.3 ? RED : H_TONES[h.tone]
      ctx.globalAlpha = a
      circle(ctx, q.x, q.y - 3.1 * s, 1.25 * s, fill)
      ctx.beginPath()
      ctx.arc(q.x, q.y, 2.1 * s, Math.PI, TAU)
      ctx.fillStyle = fill
      ctx.fill()
      ctx.globalAlpha = 1
      // the library on its way into the weights: every page anyone wrote
      if (pagesUp > 0 && i % 2 === 0) {
        const u = (t * 0.45 + h.ph) % 1
        alpha(ctx, pagesUp * a * Math.sin(u * Math.PI), () => page(ctx, lerp(q.x, 0, u), lerp(q.y - 6, -6, u), 0.5, '#f4f8ff'))
      }
    })
    const pa = pts[H_A]
    // memory outside the body: a tablet
    alpha(ctx, W(f, 1), () => {
      at(ctx, pa.x, pa.y - 17, 1.3, -0.08, () => {
        rrect(ctx, -6, -7.5, 12, 15, 2.2, '#c79f72')
        stroke(ctx, '#8a6a45', 0.6)
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if ((r * 5 + c * 3) % 4) line(ctx, -4 + c * 2.7, -5 + r * 3.3, -3 + c * 2.7, -3.6 + r * 3.3, '#5a4028', 0.7)
      })
    })
    // the press: one page in, the same page out, as many times as you like
    const copy = W(f, 2)
    if (copy > 0) {
      const made = Math.floor(((t * 0.5) % 1) * 9)
      alpha(ctx, copy, () => {
        page(ctx, -52, -64, 1.5, '#fff6dc')
        line(ctx, -43, -64, -35, -64, rgba(WHITE, 0.7), 0.6)
        for (let k = 0; k < Math.min(8, made + 1); k++) page(ctx, -27 + k * 10, -64, 1.5, '#f4f8ff')
      })
    }
    // the ratchet: each generation starts where the last one stopped
    alpha(ctx, W(f, 4), () => {
      for (let k = 0; k < 6; k++) {
        const h = 7 + k * 6.5 * (f.beat === 4 ? seg(f.u, k * 0.12, k * 0.12 + 0.4) : 1)
        rrect(ctx, 46 + k * 8, -34 - h, 6, h, 1, rgba(accent, 0.3 + k * 0.1))
        circle(ctx, 49 + k * 8, -37.5 - h, 1.5, H_TONES[k % 3])
      }
    })
    if (f.leap > 0) {
      converge(ctx, pts, gathering(f), '#eaf6ff', t)
      const d = dividing(f)
      const saying = says('word')
      for (const c of multiply(d, 54)) {
        if (c.i === 0) model(ctx, c.x, c.y - 4, born(f) * (1.7 - 0.9 * d), t, seg(f.leap, 0.4, 0.66), saying, accent)
        else model(ctx, c.x, c.y - 4, 0.7, t + c.i, 1, '…', accent)
      }
    }
    tag(f, 5, 0, pa.x, pa.y - 2)
    tag(f, 5, 1, pa.x, pa.y - 17)
    tag(f, 5, 2, -16, -64, false)
    tag(f, 5, 3, pts[30].x, pts[30].y - 2)
    tag(f, 5, 4, 66, -66, false)
    tag(f, 5, 5, 0, -12, false)
    tag(f, 5, 6, 0, -84, false)
    tag(f, 5, 7, 0, 62, false)
  },
}

/* --------------------------------------------------------------------- chip */

// Three layers of wiring on a grid, joined by vias. Every node holds a bit, and the bits
// flicker because something is always being computed. Flip one by hand and it is put back
// almost before you can see it. At the leap the whole thing is squeezed, and glows.
const C_R = 64
const C_N = 6
const C_GRID = gridStack(C_N, 3)
const cGraph = (() => {
  const r = rng(52)
  const edges = C_GRID.edges.map(([a, b]) => [a, b, r()] as [number, number, number])
  edges.sort((a, b) => a[2] - b[2])
  return new Graph(C_GRID.verts.length, edges.map(([a, b]) => [a, b]))
})()
const cView = (t: number) => view(t, 0.09, 0.52)
const cWounds = new Wounds()
let cLast: XY[] = []
const C_A = C_N * 2 + 2

const chip: Scene = {
  graph: cGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(C_GRID.verts[8], cView(t), C_R)
    return [q.x, q.y]
  },
  poke(x, y, t) {
    cWounds.hit(nearest(cLast, x, y), t)
    return 'flipped, and corrected'
  },
  reset: () => cWounds.clear(),
  draw(ctx, t, f, accent) {
    const v = cView(t)
    // the leap: squeezed toward the densest it can be
    const squeeze = 1 - 0.78 * easeInOut(seg(f.leap, 0.02, 0.34))
    const hush = 1 - born(f)
    const pts = C_GRID.verts.map((q) => project([q[0] * squeeze, q[1] * squeeze, q[2] * squeeze], v, C_R))
    cLast = pts
    cWounds.auto(f, t, pts.length, 0.7)
    const heat = 1 - squeeze
    if (hush > 0.02) {
      faces(pts, C_GRID.plates, accent, 0.05 * hush)
      wire(ctx, pts, C_GRID.edges, heat > 0.3 ? WHITE : accent, (0.34 + heat) * hush, 0.9)
      // copy, paste: the same mind, again, somewhere else, at once
      const copy = W(f, 2)
      if (copy > 0) {
        const out = easeOut(Math.min(1, ((t * 0.4) % 1) * 3))
        for (const dir of [-1, 1]) {
          const ghost = pts.map((q) => ({ ...q, x: q.x * 0.5 + dir * 78 * out, y: q.y * 0.5 - 30 * out }))
          wire(ctx, ghost, C_GRID.edges, accent, 0.5 * copy * out, 0.7)
        }
      }
      network(ctx, pts, cGraph, f, rgba(WHITE, 0.5), 0.7)
      // training: one pass over everything, nudging every weight a little
      const pass = W(f, 4) > 0 ? ((t * 0.45) % 1) * 2.6 - 1.3 : 9
      pts.forEach((q, i) => {
        const age = cWounds.age(i, t)
        if (age > 0.5) cWounds.heal(i)
        const bit = hash(i, Math.floor(t * 3 + i * 0.37)) > 0.5
        const swept = Math.abs(C_GRID.verts[i][0] - pass) < 0.22
        const flipped = age >= 0 && age < 0.16
        const fixed = age >= 0.16 && age <= 0.5
        const s = (i === C_A && W(f, 1) > 0 ? 2.6 : 1.5) * q.k
        ctx.globalAlpha = (0.4 + 0.6 * depthShade(q.z)) * hush
        rrect(ctx, q.x - s, q.y - s, s * 2, s * 2, 0.5, flipped ? RED : fixed ? '#9ff0b0' : swept ? WHITE : bit ? '#d9fff0' : '#06140f')
        stroke(ctx, accent, 0.45)
        ctx.globalAlpha = 1
      })
      // a weight: one number on one connection
      const pa = pts[C_A]
      const pb = pts[C_A + 1]
      if (W(f, 1) > 0) {
        strut(ctx, pa, pb, WHITE, W(f, 1), 2.2)
        alpha(ctx, W(f, 1), () => text(ctx, `w = ${(0.731 + 0.012 * Math.sin(t * 1.3)).toFixed(3)}`, (pa.x + pb.x) / 2, (pa.y + pb.y) / 2 + 12, 8, WHITE, MONO))
      }
    }
    if (f.leap > 0) {
      glow(ctx, 0, 0, 60 * heat, WHITE, 0.5 * heat * hush)
      converge(ctx, pts, gathering(f), '#d9fff0', t)
      const d = dividing(f)
      for (const c of multiply(d, 54)) singularity(ctx, c.x, c.y, 11 * born(f) * c.s * (1.2 - 0.6 * d), t + c.i, 0.5)
      say(f, 'chip')
    }
    const pa = pts[C_A]
    tag(f, 6, 0, pa.x, pa.y)
    tag(f, 6, 1, (pa.x + pts[C_A + 1].x) / 2, (pa.y + pts[C_A + 1].y) / 2)
    tag(f, 6, 2, 0, -84, false)
    tag(f, 6, 3, pts[20].x, pts[20].y)
    tag(f, 6, 4, 0, -84, false)
    tag(f, 6, 5, 0, -84, false)
    tag(f, 6, 6, 0, -84, false)
    tag(f, 6, 7, 0, 62, false)
  },
}

/* ------------------------------------------------------------------ horizon */

// A black hole, drawn where its information is: on the surface. The inside is not shown,
// because nothing can be. Every bit that is dropped in makes the surface a little bigger.
const Z_R = 44
const Z_BITS = fibSphere(420)
const Z_MEMBERS = Z_BITS.map((_, i) => i).filter((i) => i % 7 === 0)
const zGraph = graphOf(Z_MEMBERS.map((i) => Z_BITS[i]), 0.62, 82)
const zView = (t: number) => view(t, 0.1, 0.25)
const zWounds = new Wounds()
let zGrown = 0
// the Structure again, seen whole and from a long way off
const Z_E8 = (() => {
  const roots = e8Roots()
  const edges = e8Edges(roots).filter((_, i) => i % 30 === 0)
  return { roots, edges }
})()

function structureGlyph(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  const v: View = { yaw: t * 0.2, pitch: 0.3 }
  const scratch: number[] = []
  const pts = Z_E8.roots.map((r) => {
    const q = project(e8Shadow(r, t, scratch), v, 13 * s)
    return { ...q, x: q.x + x, y: q.y + y }
  })
  glow(ctx, x, y, 30 * s, accent, 0.35)
  wire(ctx, pts, Z_E8.edges, accent, 0.5, 0.5)
  ctx.fillStyle = '#fff6d6'
  for (let i = 0; i < pts.length; i += 2) {
    ctx.globalAlpha = 0.4 + 0.6 * depthShade(pts[i].z)
    ctx.fillRect(pts[i].x - 0.4 * s, pts[i].y - 0.4 * s, 0.8 * s, 0.8 * s)
  }
  ctx.globalAlpha = 1
}

const horizon: Scene = {
  graph: zGraph,
  focus: [0, 0],
  socket: () => [Z_R * Math.cos(-0.7), Z_R * Math.sin(-0.7)],
  poke(x, y, t) {
    // the bit falls to the nearest point of the surface, and the surface grows
    const a = Math.atan2(y, x)
    zWounds.hit(Math.round(((a + Math.PI) / TAU) * 360), t)
    zGrown = Math.min(9, zGrown + 0.5)
    return 'kept. for good.'
  },
  reset() {
    zWounds.clear()
    zGrown = 0
  },
  draw(ctx, t, f, accent) {
    const v = zView(t)
    // the leap: it evaporates
    const fade = 1 - easeInOut(seg(f.leap, 0.04, 0.4))
    const R = (Z_R + zGrown) * fade
    if (R > 0.6) {
      // the disc of matter still falling in: far half first, then the hole, then the near half
      glow(ctx, 0, 0, R * 2.6, '#ff8a4c', 0.3 * fade)
      const disk = (from: number, to: number) => {
        ctx.beginPath()
        ctx.ellipse(0, 0, R * 1.75, R * 0.4, -0.16, from, to)
        const g = ctx.createLinearGradient(-R * 1.75, 0, R * 1.75, 0)
        g.addColorStop(0, 'rgba(255,207,122,.75)')
        g.addColorStop(0.5, 'rgba(255,241,208,.85)')
        g.addColorStop(1, 'rgba(255,95,135,.7)')
        stroke(ctx, g, R * 0.11)
      }
      disk(Math.PI, TAU)
      circle(ctx, 0, 0, R, '#020104')
      ctx.beginPath()
      ctx.arc(0, 0, R * 1.03, 0, TAU)
      stroke(ctx, rgba('#ffe6c8', 0.8 * fade), R * 0.045)
      // the memory: bits on the surface, front half only, because there is no looking through
      const fast = W(f, 4) > 0 ? 9 : 0.5
      const all = Z_BITS.map((q) => project(q, v, R))
      for (let i = 0; i < all.length; i++) {
        const q = all[i]
        if (q.z <= 0.04) continue
        const bit = hash(i, Math.floor(t * fast + i * 0.61)) > 0.5
        ctx.globalAlpha = Math.min(1, q.z * 1.6) * fade
        ctx.fillStyle = bit ? '#f1f3ff' : '#3d4470'
        const s = 1.25 * q.k
        ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s)
      }
      ctx.globalAlpha = 1
      const pts = Z_MEMBERS.map((i) => all[i])
      alpha(ctx, fade, () => network(ctx, pts, zGraph, f, rgba(accent, 0.4), 0.5))
      disk(0, Math.PI)
      // one cell of the surface: a few Planck areas, one bit
      alpha(ctx, W(f, 1), () => {
        const cx = -R * 0.2
        const cy = -R * 0.25
        for (let k = 0; k < 4; k++) rrect(ctx, cx + (k % 2) * 6 - 6, cy + Math.floor(k / 2) * 6 - 6, 5.2, 5.2, 0.6, k === 0 ? '#f1f3ff' : 'rgba(241,243,255,.25)')
        ctx.beginPath()
        ctx.rect(cx - 7, cy - 7, 13.2, 13.2)
        stroke(ctx, WHITE, 0.5)
      })
      // something falling in: seen from outside it slows, reddens, and never quite arrives
      const fall = Math.max(W(f, 2), W(f, 5))
      if (fall > 0) {
        const c = (t * 0.16) % 1
        const d = R * (1.04 + 1.1 * Math.exp(-c * 6))
        alpha(ctx, fall, () => {
          rrect(ctx, d - 2, -R * 0.55 - 2, 4, 4, 0.6, c < 0.4 ? '#f1f3ff' : rgba('#ff5d5d', 1 - seg(c, 0.4, 1) * 0.8))
          if (W(f, 2) > 0 && c > 0.5) {
            line(ctx, d + 5, -R * 0.55 - 4, d + 12, -R * 0.55 + 4, RED, 1)
            line(ctx, d + 12, -R * 0.55 - 4, d + 5, -R * 0.55 + 4, RED, 1)
          }
        })
      }
      // bits dropped in by hand
      zWounds.each((i) => {
        const age = zWounds.age(i, t)
        if (age > 1) return zWounds.heal(i)
        const a = (i / 360) * TAU - Math.PI
        const d = R * (1 + 0.8 * (1 - easeOut(age)))
        alpha(ctx, 1 - age, () => rrect(ctx, Math.cos(a) * d - 1.6, Math.sin(a) * d - 1.6, 3.2, 3.2, 0.5, '#f1f3ff'))
      })
      // Hawking radiation: what comes back out, thin and scrambled
      if (f.leap > 0) {
        for (let k = 0; k < 40; k++) {
          const u = (t * 0.3 + hash(k, 2)) % 1
          const a = k * GOLDEN_ANGLE
          alpha(ctx, (1 - u) * (1 - fade + 0.25), () => circle(ctx, Math.cos(a) * (R + u * 90), Math.sin(a) * (R + u * 90), 0.6, '#f1f3ff'))
        }
      }
    }
    if (f.leap > 0) {
      const d = dividing(f)
      for (const c of multiply(d, 54)) structureGlyph(ctx, c.x, c.y, born(f) * c.s * (2.3 - 1.3 * d) * seg(f.leap, 0.34, 0.5), t, '#ffe08a')
      if (f.leap > 0.46) say(f, 'horizon', 0, -44)
    }
    const rim = (a: number): [number, number] => [Math.cos(a) * R, Math.sin(a) * R]
    tag(f, 7, 0, ...rim(-2.3))
    tag(f, 7, 1, -R * 0.2, -R * 0.25, false)
    tag(f, 7, 2, R * 1.06, -R * 0.55)
    tag(f, 7, 3, ...rim(-0.9))
    tag(f, 7, 4, 0, -R - 26, false)
    tag(f, 7, 5, R * 1.06, -R * 0.55)
    tag(f, 7, 6, 0, -R - 26, false)
    tag(f, 7, 7, 0, 60, false)
  },
}

export const SCENES: Scene[] = [structure, field, element, gene, nerve, wordScene, chip, horizon]
