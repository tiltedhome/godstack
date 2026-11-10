// One scene per plane. Every scene runs the same algorithm, Many → One → Many:
//   0.00–0.45  the members work; links between them grow until the network percolates
//   0.45–0.66  signals converge and the One emerges
//   0.66–0.85  the One is revealed, and says something
//   0.85–1.00  the One divides into copies, which are the members of the next plane up
// draw(ctx, t, p, accent): t is wall-clock seconds (idle motion), p is progress through that
// algorithm, accent is the plane's colour on this loop.
//
// Each plane is drawn inside a real three-dimensional form (see solid.ts) that the viewer can
// turn by dragging. The members stand on the form, so they turn with it.

import {
  MONO, TAU, alpha, at, bubble, circle, clamp, easeInOut, easeOut, easeOutBack, ellipse, glow, hexPath, lerp, line,
  pulse, rgba, rng, rrect, seg, stroke, text, type Ctx,
} from './draw.ts'
import { cube, cubeCorners, drawHyper } from './hyper.ts'
import { headStart, noteFor, sayingFor } from './rotate.ts'
import {
  GOLDEN_ANGLE, PLATONIC, drawWire, depthShade, e8Edges, e8Roots, e8Shadow, fibSphere, kepler, metatron, penrose, project,
  torus, torusPoint, type P, type V3, type View,
} from './solid.ts'

// What the renderer tells every scene: how the form has been turned by hand, and which loop
// this is (the speech bubbles, the note and the head start all depend on it).
export const stage = { yaw: 0, pitch: 0, loop: 1 }
export function setLoop(loop: number) {
  stage.loop = loop
  for (const s of SCENES) s.graph.head = headStart(loop)
}

export interface Scene {
  focus: [number, number]
  graph: Graph
  // where, in this scene, the previous plane sits as a detail: one of the members
  socket(t: number): [number, number]
  draw(ctx: Ctx, t: number, p: number, accent: string): void
}

/* --------------------------------------------------------------- the algorithm */

// The target mean degree over the act. It crosses 1 (the Erdős–Rényi threshold, where a
// giant connected component appears) right as emergence begins, at p ≈ 0.45.
export const linkDensity = (p: number) => 0.15 + 0.85 * seg(p, 0.02, 0.5)
export const targetDegree = (p: number) => 1.1 * linkDensity(p)

// A scene's network. Edges switch on in a fixed random order, exactly as many as needed for
// the drawn graph's real mean degree (2 × edges / nodes) to follow targetDegree.
export class Graph {
  readonly edges: [number, number][]
  readonly n: number
  // introductions made by hand: a tap on the stage switches on a few more links
  bonus = 0
  // links already made when the plane begins: more on every loop, as the constants remember
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

// Joins every pair of members closer than maxD (in whatever space they live in), then deals
// the edges into a fixed random order.
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

function network(ctx: Ctx, pts: { x: number; y: number }[], g: Graph, p: number, color: string, width: number) {
  const m = g.active(p)
  ctx.beginPath()
  for (let e = 0; e < m; e++) {
    const [i, j] = g.edges[e]
    ctx.moveTo(pts[i].x, pts[i].y)
    ctx.lineTo(pts[j].x, pts[j].y)
  }
  stroke(ctx, color, width)
}

// Once the network percolates, signals run from the members toward where the One will form.
function converge(ctx: Ctx, pts: { x: number; y: number }[], k: number, color: string, t: number) {
  if (k <= 0) return
  pts.forEach(({ x, y }, i) => {
    if (i % 2) return
    const u = (t * 0.55 + i * 0.137) % 1
    alpha(ctx, k * Math.sin(u * Math.PI), () => circle(ctx, lerp(x, 0, u), lerp(y, 0, u), 1.1, color))
  })
}

// The One divides: 1 → 2 → 4 → 8. Copy 0 stays put at the centre.
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

const emerging = (p: number) => pulse(p, 0.42, 0.66)
const born = (p: number) => easeOutBack(seg(p, 0.5, 0.64))
const revealed = (p: number) => seg(p, 0.66, 0.74)
const dividing = (p: number) => seg(p, 0.86, 0.98)
// the window in which the One has something to say
const speaking = (p: number) => pulse(p, 0.69, 0.86, 0.02)

const view = (t: number, rate: number, tip: number): View => ({ yaw: t * rate + stage.yaw, pitch: tip + stage.pitch })
const says = (id: string) => sayingFor(id, stage.loop)
const WHITE = '#ffffff'

// A dot whose size and brightness follow its depth, so near members read as near.
function mote(ctx: Ctx, q: P, r: number, color: string, a = 1) {
  ctx.globalAlpha = a * (0.35 + 0.65 * depthShade(q.z))
  circle(ctx, q.x, q.y, r * q.k, color)
  ctx.globalAlpha = 1
}

/* ---------------------------------------------------------------- overtones */

// A rolled-up dimension is a circle; two of them make a torus. One closed string is wound
// round it, twice the long way for every three times round the tube, and the Overtones are
// beads on that string. Until they lock, the winding is out of tune.
const O_R = 60
const O_TORUS = torus(1, 0.42, 30, 10)
const O_N = 56
const oBeads = (() => {
  const r = rng(11)
  return Array.from({ length: O_N }, (_, i) => ({ s: (i + r() * 0.7) / O_N, ph: r() * TAU, kind: Math.floor(r() * 3) }))
})()
function stringPoint(s: number, t: number, lock: number): V3 {
  const u = TAU * 2 * s
  const v = TAU * 3 * s + (1 - lock) * 0.9 * Math.sin(TAU * 5 * s + t * 1.3)
  const r = 0.42 * (1 + 0.1 * Math.sin(TAU * 12 * s) * Math.sin(t * 5) + (1 - lock) * 0.14 * Math.sin(TAU * 17 * s - t * 3))
  return torusPoint(u, v, 1, r)
}
const oGraph = graphOf(oBeads.map((b) => stringPoint(b.s, 0, 1)), 0.62, 12)
const oView = (t: number) => view(t, 0.11, 0.62)
const oLock = (p: number) => easeInOut(seg(p, 0.3, 0.5))

// Not a solar system: a nucleus, and round it standing waves that close on themselves, a
// whole number of wavelengths to the lap (de Broglie, 1924), plus the two lobes of a p orbital.
function atom(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 30, accent, 0.45)
    alpha(ctx, 0.28, () => {
      ellipse(ctx, -7, -5, 8, 4.4, 0.62, accent)
      ellipse(ctx, 7, 5, 8, 4.4, 0.62, accent)
    })
    ;[[11, 3, 2.1, 0.9], [17, 5, 1.5, 0.5]].forEach(([r0, n, amp, a], ring) => {
      ctx.beginPath()
      for (let k = 0; k <= 72; k++) {
        const th = (k / 72) * TAU
        const r = r0 + amp * Math.sin(n * th) * Math.cos(t * 3 + ring)
        if (k === 0) ctx.moveTo(Math.cos(th) * r, Math.sin(th) * r)
        else ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r)
      }
      stroke(ctx, rgba(WHITE, a), 0.9)
    })
    circle(ctx, 0, 0, 2.4, '#fff3f8')
  })
}

const overtones: Scene = {
  graph: oGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(stringPoint(oBeads[0].s, t, 0), oView(t), O_R)
    return [q.x, q.y]
  },
  draw(ctx, t, p, accent) {
    const v = oView(t)
    const lock = oLock(p)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    drawWire(ctx, O_TORUS.verts.map((q) => project(q, v, O_R)), O_TORUS.edges, accent, 0.3, 0.9)
    // the string itself, in two passes so the far half sits behind the near half
    const curve = Array.from({ length: 181 }, (_, k) => project(stringPoint(k / 180, t, lock), v, O_R))
    for (const near of [false, true]) {
      ctx.beginPath()
      for (let k = 0; k < 180; k++) {
        if (curve[k].z + curve[k + 1].z > 0 !== near) continue
        ctx.moveTo(curve[k].x, curve[k].y)
        ctx.lineTo(curve[k + 1].x, curve[k + 1].y)
      }
      stroke(ctx, rgba(WHITE, near ? 0.75 : 0.25), near ? 1.1 : 0.7)
    }
    ctx.restore()

    const pts = oBeads.map((b) => project(stringPoint(b.s, t, lock), v, O_R))
    network(ctx, pts, oGraph, p, rgba(accent, 0.4), 0.5)
    // the notes that do not fit radiate away: this is review
    const leak = pulse(p, 0.14, 0.42)
    oBeads.forEach((b, i) => {
      const q = pts[i]
      const out = i % 3 === 0 ? leak * Math.max(0, Math.sin(t * 2.2 + b.ph)) : 0
      if (out > 0.05) {
        const d = Math.hypot(q.x, q.y) || 1
        alpha(ctx, out * 0.5, () => line(ctx, q.x, q.y, q.x + (q.x / d) * 9 * out, q.y + (q.y / d) * 9 * out, WHITE, 0.5))
      }
      mote(ctx, q, b.kind === 0 ? 1.7 : 1.2, b.kind === 1 ? accent : '#ffe6f0', 1 - 0.8 * out)
    })
    converge(ctx, pts, emerging(p), '#ffe6f0', t)
    if (p >= 0.5) {
      const d = dividing(p)
      for (const c of multiply(d, 44)) atom(ctx, c.x, c.y, born(p) * c.s * (1.35 - 0.6 * d), t + c.i, accent)
      alpha(ctx, speaking(p), () => bubble(ctx, says('overtones'), 0, -36, 5, -6))
    }
  },
}

/* ------------------------------------------------------------------- orrery */

// Kepler's nest, to his proportions, with a body on each of his six orbits and a good many
// more on the orbits he did not know about. Bodies obey his third law: the period goes as
// the radius to the power three halves, so the inner ones lap the outer ones.
const K_R = 72
const K = kepler()
const K_SHELLS = K.shells.map((s) => ({ ...PLATONIC[s.name], r: s.r }))
const kBodies = (() => {
  const r = rng(21)
  const radii = [...K.orbits, 1.14, 1.27]
  const out = radii.map((a, i) => ({ a, ph: r() * TAU, inc: 0, size: i < 6 ? 2 : 1.6, major: true }))
  for (let i = 0; i < 40; i++) out.push({ a: 0.24 + r() * 0.98, ph: r() * TAU, inc: (r() - 0.5) * 0.3, size: 0.8 + r() * 0.7, major: false })
  return out
})()
const bodyAt = (b: (typeof kBodies)[number], t: number, chaos: number): V3 => {
  const th = b.ph + t * 0.1 * Math.pow(Math.max(0.16, b.a), -1.5)
  const a = b.a * (1 + chaos * 0.07 * Math.sin(t * 1.7 + b.ph * 5))
  return [Math.cos(th) * a, Math.sin(th) * a * b.inc + chaos * 0.05 * Math.sin(t * 2.3 + b.ph), Math.sin(th) * a]
}
const kGraph = graphOf(kBodies.map((b) => bodyAt(b, 0, 0)), 0.5, 22)
const kView = (t: number) => view(t, 0.07, 0.5)
const K_EARTH = 3

// A galaxy, as the density-wave theory has it: two logarithmic arms that are not made of
// anything in particular. The dots drift through; the arms stay.
function spiral(ctx: Ctx, x: number, y: number, s: number, t: number, accent: string) {
  at(ctx, x, y, s, -0.35, () => {
    glow(ctx, 0, 0, 26, accent, 0.5)
    for (let arm = 0; arm < 2; arm++) {
      for (let k = 0; k < 34; k++) {
        const a = 0.6 + k * 0.33
        const r = 2 * Math.exp(0.215 * a)
        const th = a + arm * Math.PI + t * 0.35
        // each dot wanders along its own orbit, so it slows in the arm and leaves it again
        const drift = Math.sin(t * 0.9 + k * 1.7 + arm) * 0.12
        ctx.globalAlpha = 0.9 - k * 0.018
        circle(ctx, Math.cos(th + drift) * r, Math.sin(th + drift) * r * 0.5, k % 5 === 0 ? 1.1 : 0.7, k % 4 === 0 ? accent : '#fff6dc')
      }
    }
    ctx.globalAlpha = 1
    ellipse(ctx, 0, 0, 3.2, 1.9, 0, '#fff6dc')
  })
}

const orrery: Scene = {
  graph: kGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(bodyAt(kBodies[K_EARTH], t, 0), kView(t), K_R)
    return [q.x, q.y]
  },
  draw(ctx, t, p, accent) {
    const v = kView(t)
    const chaos = seg(p, 0.36, 0.48) * (1 - seg(p, 0.6, 0.7) * 0.6)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const hush = 1 - 0.75 * seg(p, 0.5, 0.64)
    K_SHELLS.forEach((s, i) => {
      const pts = s.verts.map((q) => project([q[0] * s.r, q[1] * s.r, q[2] * s.r], v, K_R))
      drawWire(ctx, pts, s.edges, accent, (0.26 + i * 0.07) * (i > 1 ? hush : 1), 1)
    })
    // the six orbits Kepler knew, as the circles his spheres cut in the plane of the planets
    K.orbits.forEach((a) => {
      ctx.beginPath()
      for (let k = 0; k <= 48; k++) {
        const q = project([Math.cos((k / 48) * TAU) * a, 0, Math.sin((k / 48) * TAU) * a], v, K_R)
        if (k === 0) ctx.moveTo(q.x, q.y)
        else ctx.lineTo(q.x, q.y)
      }
      stroke(ctx, rgba(WHITE, 0.16), 0.5)
    })
    ctx.restore()
    alpha(ctx, 1 - seg(p, 0.5, 0.62), () => {
      glow(ctx, 0, 0, 16, '#ffe9b0', 0.8)
      circle(ctx, 0, 0, 2.6, '#fff4d6')
    })

    const pts = kBodies.map((b) => project(bodyAt(b, t, chaos), v, K_R))
    network(ctx, pts, kGraph, p, rgba(accent, 0.38), 0.5)
    kBodies.forEach((b, i) => mote(ctx, pts[i], b.size, b.major ? (i === K_EARTH ? '#9fd4ff' : accent) : '#e9e2d0'))
    // the third body, invited for something to talk about
    const visit = seg(p, 0.27, 0.5)
    if (visit > 0 && visit < 1) {
      const cx = lerp(96, -70, visit)
      const cy = lerp(-78, 46, visit) + Math.sin(visit * Math.PI) * 30
      alpha(ctx, Math.sin(visit * Math.PI), () => {
        line(ctx, cx, cy, cx + 16, cy - 13, rgba(WHITE, 0.5), 1.2)
        circle(ctx, cx, cy, 1.8, WHITE)
      })
    }
    const e = pts[K_EARTH]
    alpha(ctx, pulse(p, 0.07, 0.25, 0.02), () => bubble(ctx, says('orrery'), clamp(e.x, -62, 62), e.y - 10, 5, clamp(e.x, -62, 62) === e.x ? 0 : e.x > 0 ? 8 : -8))
    converge(ctx, pts, emerging(p), '#fff6dc', t)
    if (p >= 0.5) {
      const d = dividing(p)
      for (const c of multiply(d, 44)) spiral(ctx, c.x, c.y, born(p) * c.s * (1.7 - 1.05 * d), t + c.i * 3, accent)
    }
  },
}

/* ------------------------------------------------------------------ cluster */

// A ball of old suns, sown by the golden angle the way a sunflower sows its seeds, and
// crowded toward the middle the way real clusters are. The outer shell is joined along its
// spirals of 8 and 13, which are consecutive Fibonacci numbers and always will be.
const C_R = 74
const C_SHELL = (() => {
  const verts = fibSphere(144)
  const edges: [number, number][] = []
  for (let i = 0; i < 144; i++) for (const k of [8, 13]) if (i + k < 144) edges.push([i, i + k])
  return { verts, edges }
})()
const cStars = (() => {
  const r = rng(31)
  return fibSphere(170).map((d, i) => {
    const rad = 0.1 + 0.82 * Math.pow(r(), 1.7)
    return { pos: [d[0] * rad, d[1] * rad, d[2] * rad] as V3, ph: r() * TAU, size: 0.6 + r() * 0.9, blue: i % 13 === 5, warm: r() }
  })
})()
// every third star sits in the Parliament; the rest are the public gallery
const cMembers = cStars.filter((_, i) => i % 3 === 0)
const cGraph = graphOf(cMembers.map((s) => s.pos), 0.5, 32)
const cView = (t: number) => view(t, 0.06, 0.3)

// The witness: an eye on a small rock, with the cluster reflected in it.
function stargazer(ctx: Ctx, x: number, y: number, s: number, t: number, open: number, accent: string) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 26, accent, 0.35)
    ctx.beginPath()
    ctx.arc(0, 34, 26, Math.PI * 1.22, Math.PI * 1.78)
    ctx.closePath()
    ctx.fillStyle = '#2a1712'
    ctx.fill()
    const h = 7 * Math.max(0.08, open) * (Math.sin(t * 0.7) > 0.985 ? 0.15 : 1)
    ctx.beginPath()
    ctx.moveTo(-13, 0)
    ctx.quadraticCurveTo(0, -h * 1.9, 13, 0)
    ctx.quadraticCurveTo(0, h * 1.9, -13, 0)
    ctx.fillStyle = '#fff4ea'
    ctx.fill()
    ctx.save()
    ctx.clip()
    circle(ctx, 0, 0, 6.2, '#3d6f9e')
    circle(ctx, 0, 0, 3, '#0b0a12')
    for (let k = 0; k < 9; k++) circle(ctx, Math.cos(k * GOLDEN_ANGLE) * Math.sqrt(k) * 0.8 - 1.2, Math.sin(k * GOLDEN_ANGLE) * Math.sqrt(k) * 0.8 - 1.4, 0.35, '#ffe2c4')
    ctx.restore()
    ctx.beginPath()
    ctx.moveTo(-13, 0)
    ctx.quadraticCurveTo(0, -h * 1.9, 13, 0)
    ctx.quadraticCurveTo(0, h * 1.9, -13, 0)
    stroke(ctx, '#2a1712', 0.9)
  })
}

const cluster: Scene = {
  graph: cGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(cMembers[5].pos, cView(t), C_R)
    return [q.x, q.y]
  },
  draw(ctx, t, p, accent) {
    const v = cView(t)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    drawWire(ctx, C_SHELL.verts.map((q) => project(q, v, C_R)), C_SHELL.edges, accent, 0.26, 0.8)
    ctx.restore()
    glow(ctx, 0, 0, 62, accent, 0.16)
    // a blue straggler takes mass from its neighbour: the neighbour dims as it brightens
    const eat = pulse(p, 0.3, 0.44)
    const all = cStars.map((s) => project(s.pos, v, C_R))
    cStars.forEach((s, i) => {
      const tw = 0.7 + 0.3 * Math.sin(t * 1.6 + s.ph)
      if (s.blue) mote(ctx, all[i], s.size * (1.3 + eat * 0.9), '#a9d4ff', tw)
      else if (i % 13 === 6) mote(ctx, all[i], s.size * (1 - eat * 0.7), '#ffc9a0', tw * (1 - eat * 0.6))
      else mote(ctx, all[i], s.size * (i % 3 === 0 ? 1.5 : 1), s.warm > 0.5 ? '#ffd9b0' : '#ffb48a', tw)
    })
    const pts = cStars.flatMap((_, i) => (i % 3 === 0 ? [all[i]] : []))
    network(ctx, pts, cGraph, p, rgba(accent, 0.36), 0.5)
    converge(ctx, pts, emerging(p), '#ffe2c4', t)
    if (p >= 0.5) {
      const d = dividing(p)
      // the reply: 1,679 bits, on their way up
      alpha(ctx, seg(p, 0.76, 0.8) * (1 - d), () => {
        for (let k = 0; k < 12; k++) {
          const u = (k / 12 + t * 0.4) % 1
          alpha(ctx, 1 - u, () => rrect(ctx, -0.6, -12 - u * 70, 1.2, 1.2, 0, k % 3 ? '#ffe2c4' : WHITE))
        }
      })
      for (const c of multiply(d, 42)) stargazer(ctx, c.x, c.y, born(p) * c.s * (1 - 0.4 * d), t + c.i * 2.1, revealed(p), accent)
      alpha(ctx, speaking(p), () => bubble(ctx, says('cluster'), 0, -24, 5, -5))
    }
  },
}

/* ------------------------------------------------------------------- humans */

// Thirteen spheres, twelve touching the thirteenth, and every centre joined to every other:
// Metatron's cube, in the round. Below it, a crowd, sown like a sunflower head because that
// is how you pack people into a square.
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
// 35.26° tips the cube onto a corner, which is the view the flat drawing is a shadow of
const hView = (t: number) => view(t, 0.08, 0.6155)
const H_TONES = ['#e6efff', '#a9c8ff', '#ffe1bd']

// The reader: a box that types what we would probably have said next.
function model(ctx: Ctx, x: number, y: number, s: number, t: number, typed: number, line0: string, accent: string) {
  at(ctx, x, y, s, 0, () => {
    ctx.font = `4.6px ${MONO}`
    const w = Math.max(30, ctx.measureText(line0).width + 12)
    glow(ctx, 0, 0, 34, accent, 0.4)
    rrect(ctx, -w / 2, -7, w, 14, 3.2, 'rgba(6,14,32,.92)')
    stroke(ctx, accent, 0.8)
    const shown = line0.slice(0, Math.round(line0.length * typed))
    ctx.font = `4.6px ${MONO}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#eaf6ff'
    ctx.fillText(shown, -w / 2 + 5, 0.3)
    if (Math.sin(t * 6) > 0 || typed < 1) rrect(ctx, -w / 2 + 5.6 + ctx.measureText(shown).width, -2.6, 1.9, 5.2, 0, accent)
  })
}

const humans: Scene = {
  graph: hGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(hPeople[9].pos, hView(t), H_R)
    return [q.x, q.y]
  },
  draw(ctx, t, p, accent) {
    const v = hView(t)
    ctx.save()
    ctx.translate(0, -12)
    ctx.globalCompositeOperation = 'lighter'
    const cube13 = H_CUBE.verts.map((q) => project(q, v, H_R))
    drawWire(ctx, cube13, H_CUBE.edges, accent, 0.24, 0.8)
    for (const q of cube13) {
      ctx.beginPath()
      ctx.arc(q.x, q.y, 0.5 * H_R * q.k, 0, TAU)
      stroke(ctx, rgba(accent, 0.1 + 0.16 * depthShade(q.z)), 0.7)
    }
    ctx.restore()

    const pts = hPeople.map((h) => project(h.pos, v, H_R))
    network(ctx, pts, hGraph, p, rgba(accent, 0.35), 0.5)
    // five thousand years of writing ourselves down: pages rise, and nobody catches them
    const writing = pulse(p, 0.03, 0.42)
    hPeople.forEach((h, i) => {
      const q = pts[i]
      const a = 0.4 + 0.6 * depthShade(q.z)
      const s = h.s * q.k
      ctx.globalAlpha = a
      circle(ctx, q.x, q.y - 3.1 * s, 1.25 * s, H_TONES[h.tone])
      ctx.beginPath()
      ctx.arc(q.x, q.y, 2.1 * s, Math.PI, TAU)
      ctx.fillStyle = H_TONES[h.tone]
      ctx.fill()
      ctx.globalAlpha = 1
      if (writing > 0 && i % 4 === 0) {
        const u = (t * 0.22 + h.ph) % 1
        alpha(ctx, writing * a * Math.sin(u * Math.PI), () => rrect(ctx, q.x - 0.9, q.y - 6 - u * 26, 1.8, 2.3, 0.3, '#f4f8ff'))
      }
    })
    // and the question that went up and did not come back
    alpha(ctx, pulse(p, 0.13, 0.3), () => text(ctx, 'is anyone there?', 0, -84 - seg(p, 0.13, 0.3) * 8, 4.6, rgba('#eaf6ff', 0.8), MONO))
    converge(ctx, pts, emerging(p), '#eaf6ff', t)
    if (p >= 0.5) {
      const d = dividing(p)
      const saying = says('humans')
      for (const c of multiply(d, 42)) {
        if (c.i === 0) model(ctx, c.x, c.y, born(p) * (1 - 0.35 * d), t, seg(p, 0.66, 0.82), saying, accent)
        else model(ctx, c.x, c.y, 0.5, t + c.i, 1, '…', accent)
      }
    }
  },
}

/* -------------------------------------------------------------------- polis */

// Latent space: a five-dimensional cube turning in all five, with a copy of the Model on every
// corner and another on every corner of a half-size cube inside it. When the copies try to
// compress the universe the cube shrinks; when that fails they add scale, and it grows.
const P_R = 66
const P_CUBE = cube(5)
const pGraph = (() => {
  const r = rng(52)
  const edges: [number, number, number][] = []
  for (const [a, b] of P_CUBE.edges) edges.push([a, b, r()], [a + 32, b + 32, r()])
  for (let i = 0; i < 32; i++) edges.push([i, i + 32, r()])
  edges.sort((a, b) => a[2] - b[2])
  return new Graph(64, edges.map(([a, b]) => [a, b]))
})()
const pScale = (p: number) => 1 - 0.3 * easeInOut(seg(p, 0.16, 0.3)) + 0.3 * easeOutBack(seg(p, 0.32, 0.4)) + 0.16 * easeInOut(seg(p, 0.4, 0.56))
const pSpin = () => ({ yaw: stage.yaw, pitch: stage.pitch })
const pCorners = (t: number, p: number) => {
  const outer = cubeCorners(5, t, pSpin(), P_R * pScale(p))
  return [...outer, ...outer.map((q) => ({ x: q.x * 0.5, y: q.y * 0.5, z: q.z * 0.5 }))]
}

// The Map: a folded sheet with a coastline, a pin, and a scale that has stopped being a joke.
function mapSheet(ctx: Ctx, x: number, y: number, s: number, a: number, accent: string) {
  at(ctx, x, y, s, 0, () => {
    alpha(ctx, a, () => {
      rrect(ctx, -17, -11, 34, 22, 1, rgba(accent, 0.16))
      stroke(ctx, accent, 0.7 / Math.max(1, s))
      ctx.beginPath()
      for (let k = 1; k < 6; k++) {
        ctx.moveTo(-17 + k * 5.67, -11)
        ctx.lineTo(-17 + k * 5.67, 11)
      }
      for (let k = 1; k < 4; k++) {
        ctx.moveTo(-17, -11 + k * 5.5)
        ctx.lineTo(17, -11 + k * 5.5)
      }
      stroke(ctx, rgba(accent, 0.35), 0.35 / Math.max(1, s))
      ctx.beginPath()
      for (let k = 0; k <= 20; k++) {
        const u = k / 20
        const px = -14 + u * 28
        const py = Math.sin(u * 7) * 3 + Math.sin(u * 17) * 1.2 + 2
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      stroke(ctx, rgba(WHITE, 0.7), 0.6 / Math.max(1, s))
    })
  })
}

const polis: Scene = {
  graph: pGraph,
  focus: [0, 0],
  socket(t) {
    const q = pCorners(t, 0)[3]
    return [q.x, q.y]
  },
  draw(ctx, t, p, accent) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    drawHyper(ctx, { d: 5, extrude: 0, collapse: 0, t, spin: pSpin(), cx: 0, cy: 0, r: P_R * pScale(p), color: accent, alpha: 0.5 })
    ctx.restore()
    const pts = pCorners(t, p)
    network(ctx, pts, pGraph, p, rgba(accent, 0.45), 0.6)
    pts.forEach((q, i) => {
      const a = 0.4 + 0.6 * clamp((q.z + 1) / 2)
      const s = i < 32 ? 1.5 : 1.1
      ctx.globalAlpha = a
      rrect(ctx, q.x - s, q.y - s, s * 2, s * 2, 0.5, '#06140f')
      stroke(ctx, accent, 0.5)
      if (Math.sin(t * 5 + i) > 0) rrect(ctx, q.x - 0.3, q.y - s * 0.6, 0.6, s * 1.2, 0, '#d9fff0')
      ctx.globalAlpha = 1
    })
    // what the copies are doing to the model at each stage
    const word = p < 0.16 ? '' : p < 0.31 ? 'compress' : p < 0.4 ? 'will not compress' : p < 0.56 ? 'add scale' : ''
    if (word) alpha(ctx, 0.8, () => text(ctx, word, 0, -92, 4.6, rgba('#d9fff0', 0.85), MONO))
    converge(ctx, pts, emerging(p), '#d9fff0', t)
    if (p >= 0.5) {
      const d = dividing(p)
      // the scale creeps up until the map is as big as the land
      const grow = easeInOut(seg(p, 0.64, 0.84))
      const size = born(p) * lerp(1, 5.2, grow) * (1 - d)
      mapSheet(ctx, 0, 0, size, lerp(1, 0.4, grow), accent)
      for (const c of multiply(d, 46)) mapSheet(ctx, c.x, c.y, d * 0.62 * c.s, 1, accent)
      alpha(ctx, born(p) * (1 - d), () => {
        circle(ctx, 0, -1.5, 1.5, '#ff6b5e')
        line(ctx, 0, -1.5, 0, 2.4, '#ff6b5e', 0.6)
      })
      const ratio = grow < 0.3 ? 'scale 1 : 10' : grow < 0.75 ? 'scale 1 : 2' : says('polis')
      alpha(ctx, seg(p, 0.6, 0.64) * (1 - d), () => bubble(ctx, ratio, 0, -17, 4.4, 0))
    }
  },
}

/* -------------------------------------------------------------------- brood */

// Universes, as bubbles, floating above the floor their contents are written on: a Penrose
// tiling, ordered and never repeating. The bubbles bud daughters. At the centre the Library
// goes up, a stack of hexagonal galleries with a stair through the middle.
const B_R = 68
const B_FLOOR = (() => {
  const t = penrose(4)
  return { verts: t.pts.map(([x, y]) => [x * 1.32, 0.62, y * 1.32] as V3), edges: t.edges }
})()
const bWorlds = (() => {
  const r = rng(61)
  return Array.from({ length: 58 }, (_, i) => {
    const rad = Math.sqrt((i + 0.5) / 58) * 1.18
    return { pos: [Math.cos(i * GOLDEN_ANGLE) * rad, 0.3 - r() * 0.95, Math.sin(i * GOLDEN_ANGLE) * rad] as V3, ph: r() * TAU, size: 2.1 + r() * 1.5 }
  })
})()
const bGraph = graphOf(bWorlds.map((w) => w.pos), 0.5, 62)
const bView = (t: number) => view(t, 0.06, 0.42)
const B_FLOORS = 6
const B_TOWER = (() => {
  const verts: V3[] = []
  const edges: [number, number][] = []
  for (let f = 0; f < B_FLOORS; f++) {
    for (let k = 0; k < 6; k++) {
      verts.push([Math.cos((k / 6) * TAU) * 0.24, 0.26 - f * 0.15, Math.sin((k / 6) * TAU) * 0.24])
      edges.push([f * 6 + k, f * 6 + ((k + 1) % 6)])
      if (f) edges.push([f * 6 + k, (f - 1) * 6 + k])
    }
  }
  return { verts, edges }
})()

const brood: Scene = {
  graph: bGraph,
  focus: [0, 0],
  socket(t) {
    const q = project(bWorlds[6].pos, bView(t), B_R)
    return [q.x, q.y]
  },
  draw(ctx, t, p, accent) {
    const v = bView(t)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    drawWire(ctx, B_FLOOR.verts.map((q) => project(q, v, B_R)), B_FLOOR.edges, accent, 0.4, 0.8)
    ctx.restore()
    const pts = bWorlds.map((w) => project(w.pos, v, B_R))
    network(ctx, pts, bGraph, p, rgba(accent, 0.34), 0.5)
    // every universe runs down; they dim together, and it frightens them
    const dusk = pulse(p, 0.28, 0.44)
    bWorlds.forEach((w, i) => {
      const q = pts[i]
      const a = (0.35 + 0.65 * depthShade(q.z)) * (1 - dusk * (0.45 + 0.3 * Math.sin(t * 3 + w.ph)))
      const r = w.size * q.k
      ctx.globalAlpha = a
      circle(ctx, q.x, q.y, r, rgba(accent, 0.14))
      stroke(ctx, rgba('#f6e6ff', 0.85), 0.55)
      circle(ctx, q.x - r * 0.3, q.y - r * 0.3, r * 0.22, rgba(WHITE, 0.6))
      // a black hole, and through it a daughter with slightly different constants
      const bud = easeOut(seg(p, 0.08 + (i % 7) * 0.03, 0.2 + (i % 7) * 0.03))
      if (i % 3 === 0 && bud > 0) {
        const th = w.ph
        circle(ctx, q.x + Math.cos(th) * r, q.y + Math.sin(th) * r, 0.5, '#0a0612')
        circle(ctx, q.x + Math.cos(th) * r * (1 + 0.62 * bud), q.y + Math.sin(th) * r * (1 + 0.62 * bud), r * 0.5 * bud, rgba(accent, 0.2))
        stroke(ctx, rgba('#f6e6ff', 0.8), 0.45)
      }
      ctx.globalAlpha = 1
    })
    converge(ctx, pts, emerging(p), '#f6e6ff', t)
    if (p >= 0.5) {
      const d = dividing(p)
      const k = born(p) * (1 - d)
      if (k > 0.01) {
        glow(ctx, 0, -6, 40 * k, accent, 0.4)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        drawWire(ctx, B_TOWER.verts.map((q) => project([q[0] * k, q[1] * k, q[2] * k], v, B_R * 1.25)), B_TOWER.edges, '#f6e6ff', 0.95, 1.1)
        // the stair
        ctx.beginPath()
        for (let s = 0; s <= 60; s++) {
          const u = s / 60
          const q = project([Math.cos(u * TAU * 4) * 0.07 * k, (0.26 - u * 0.75) * k, Math.sin(u * TAU * 4) * 0.07 * k], v, B_R * 1.25)
          if (s === 0) ctx.moveTo(q.x, q.y)
          else ctx.lineTo(q.x, q.y)
        }
        stroke(ctx, rgba(accent, 0.9), 0.7)
        ctx.restore()
      }
      // each gallery comes away as a book, and each book is a history
      for (const c of multiply(d, 44)) {
        if (d <= 0) break
        at(ctx, c.x, c.y, d * c.s, 0, () => {
          hexPath(ctx, 0, 0, 7)
          ctx.fillStyle = rgba(accent, 0.2)
          ctx.fill()
          stroke(ctx, '#f6e6ff', 0.8)
          rrect(ctx, -2.6, -3.4, 5.2, 6.8, 0.5, '#f6e6ff')
          line(ctx, -1.2, -3.4, -1.2, 3.4, '#2a1846', 0.5)
        })
      }
      alpha(ctx, speaking(p), () => bubble(ctx, says('brood'), 0, -40, 4.4, -4))
    }
  },
}

/* ------------------------------------------------------------------- caucus */

// E8: 240 points in eight dimensions, turning in four planes at once and casting a shadow in
// three. Every fourth point is a timeline with a vote. When the motion to stop choosing
// carries, the whole figure is pressed flat into one line, and the line is a string.
const E_R = 62
const E_ROOTS = e8Roots()
const E_EDGES = e8Edges(E_ROOTS).filter((_, i) => i % 6 === 0)
const E_MEMBERS = E_ROOTS.map((_, i) => i).filter((i) => i % 4 === 0)
const eGraph = graphOf(E_MEMBERS.map((i) => E_ROOTS[i]), 1.45, 72)
const eView = (t: number) => view(t, 0.05, 0.3)
const eScratch: number[] = []
const ePoint = (i: number, t: number, flat: number, v: View): P => {
  const s = e8Shadow(E_ROOTS[i], t, eScratch)
  const q = project(s, v, E_R)
  q.y *= 1 - 0.97 * flat
  return q
}
const eFlat = (p: number) => easeInOut(seg(p, 0.5, 0.66))
const HALF = 90

const caucus: Scene = {
  graph: eGraph,
  focus: [0, 0],
  socket(t) {
    const q = ePoint(E_MEMBERS[2], t, 0, eView(t))
    return [q.x, q.y]
  },
  draw(ctx, t, p, accent) {
    const v = eView(t)
    const flat = eFlat(p)
    const all = E_ROOTS.map((_, i) => ePoint(i, t, flat, v))
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    drawWire(ctx, all, E_EDGES, accent, 0.2 * (1 - 0.7 * flat), 0.6)
    ctx.restore()
    for (let i = 0; i < all.length; i++) if (i % 4) mote(ctx, all[i], 0.7, '#fff3c8', 0.7 * (1 - flat))
    const pts = E_MEMBERS.map((i) => all[i])
    network(ctx, pts, eGraph, p, rgba(accent, 0.36), 0.5)
    // every member votes for itself, continuously
    const settled = seg(p, 0.42, 0.52)
    pts.forEach((q, k) => {
      const aye = Math.sin(t * 1.7 + k * 2.4) > 0
      const c = settled >= 1 ? '#fff3c8' : aye ? accent : '#b99cff'
      mote(ctx, q, 1.6, c, 1 - 0.6 * flat)
      if (settled < 1) alpha(ctx, (1 - settled) * depthShade(q.z), () => line(ctx, q.x, q.y - 2.2, q.x, q.y - (aye ? 5.2 : 3.4), c, 0.6))
    })
    alpha(ctx, pulse(p, 0.1, 0.4, 0.02), () => bubble(ctx, says('caucus'), 0, -84, 4.4, 0))
    converge(ctx, pts, emerging(p) * (1 - flat), '#fff3c8', t)
    if (p >= 0.5) {
      // the String: seven harmonics on one line, plucked hard and ringing down
      const d = dividing(p)
      const ring = born(p)
      const amp = ring * (9 + 14 * (1 - seg(p, 0.6, 0.8)))
      const y = (x: number) => {
        const u = (x + HALF) / (2 * HALF)
        let s = 0
        for (let h = 1; h <= 7; h++) s += (Math.sin(h * Math.PI * u) * Math.sin(t * (1.4 + h * 1.1) + h)) / h
        return s * amp
      }
      glow(ctx, 0, 0, 70 * ring, accent, 0.22)
      for (const [w, c] of [[2.6, rgba(accent, 0.35)], [0.9, WHITE]] as const) {
        ctx.beginPath()
        for (let k = 0; k <= 90; k++) {
          const x = -HALF + (k / 90) * 2 * HALF
          if (k === 0) ctx.moveTo(x * ring, y(x))
          else ctx.lineTo(x * ring, y(x))
        }
        stroke(ctx, c, w)
      }
      // its overtones: the next loop's first members, as beads on the line
      for (let k = 0; k < 8; k++) {
        const x = -HALF + ((k + 0.5) / 8) * 2 * HALF
        alpha(ctx, d, () => {
          glow(ctx, x, y(x), 7, accent, 0.6)
          circle(ctx, x, y(x), 1.7, '#fff3c8')
        })
      }
      alpha(ctx, seg(p, 0.7, 0.76), () => {
        text(ctx, 'α ≈ 1 / 137.036', 0, 30, 4.6, rgba(accent, 0.95), MONO)
        bubble(ctx, noteFor(stage.loop), 0, 41, 4.8, 0)
      })
    }
  },
}

export const SCENES: Scene[] = [overtones, orrery, cluster, humans, polis, brood, caucus]
