// One scene per collective. Every scene runs the same algorithm, Many → One → Many:
//   0.00–0.45  the members collaborate; links between them grow until the network percolates
//   0.45–0.66  signals converge and the One emerges
//   0.66–0.85  the One is revealed
//   0.85–1.00  the One divides into copies, and the camera follows one of them into the next scene
// draw(ctx, t, p): t is wall-clock seconds (idle motion), p is progress through that algorithm.

import {
  DISPLAY, MONO, TAU, alpha, at, circle, clamp, easeIn, easeInOut, easeOut, easeOutBack, ellipse, glow, hexPath,
  lerp, line, pulse, rng, rrect, seg, stroke, text, type Ctx,
} from './draw.ts'

export interface Scene {
  focus: [number, number]
  graph: Graph
  draw(ctx: Ctx, t: number, p: number): void
}

type Pt = [number, number]

/* --------------------------------------------------------------- the algorithm */

// The target mean degree over the act. It crosses 1 (the Erdős–Rényi threshold, where a
// giant connected component appears) right as emergence begins, at p ≈ 0.45.
export const linkDensity = (p: number) => 0.15 + 0.85 * seg(p, 0.02, 0.5)
export const targetDegree = (p: number) => 1.1 * linkDensity(p)

interface Agent {
  x: number
  y: number
  ph: number
  s: number
  kind: number
}

function agents(seed: number, n: number, place: (r: () => number) => Pt, kinds = 3): Agent[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const [x, y] = place(r)
    return { x, y, ph: r() * TAU, s: 0.7 + r() * 0.6, kind: Math.floor(r() * kinds) }
  })
}

// A scene's network. Edges switch on in a fixed random order, exactly as many as needed for
// the drawn graph's real mean degree (2 × edges / nodes) to follow targetDegree.
export class Graph {
  readonly edges: [number, number][]
  readonly n: number
  constructor(n: number, edges: [number, number][]) {
    this.n = n
    this.edges = edges
  }
  active(p: number): number {
    return Math.min(this.edges.length, Math.round((targetDegree(p) * this.n) / 2))
  }
  meanDegree(p: number): number {
    return (2 * this.active(p)) / this.n
  }
}

function graph(pts: Pt[], maxD: number, seed: number): Graph {
  const r = rng(seed)
  const out: [number, number, number][] = []
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) < maxD) out.push([i, j, r()])
    }
  }
  out.sort((a, b) => a[2] - b[2])
  return new Graph(pts.length, out.map(([i, j]) => [i, j]))
}
const graphOf = (list: Agent[], maxD: number, seed: number) => graph(list.map((a) => [a.x, a.y]), maxD, seed)

const wobble = (a: Agent, t: number, amp = 1.2): Pt => [a.x + Math.sin(t * 0.7 + a.ph) * amp, a.y + Math.cos(t * 0.6 + a.ph) * amp]

function network(ctx: Ctx, pts: Pt[], g: Graph, p: number, color: string, width: number) {
  const m = g.active(p)
  ctx.beginPath()
  for (let e = 0; e < m; e++) {
    const [i, j] = g.edges[e]
    ctx.moveTo(pts[i][0], pts[i][1])
    ctx.lineTo(pts[j][0], pts[j][1])
  }
  stroke(ctx, color, width)
}

// Once the network percolates, signals run from the members toward where the One will form.
function converge(ctx: Ctx, pts: Pt[], f: Pt, k: number, color: string, t: number) {
  if (k <= 0) return
  pts.forEach(([x, y], i) => {
    if (i % 2) return
    const u = (t * 0.55 + i * 0.137) % 1
    alpha(ctx, k * Math.sin(u * Math.PI), () => circle(ctx, lerp(x, f[0], u), lerp(y, f[1], u), 1.1, color))
  })
}

// The One divides: 1 → 2 → 4 → 8. Copy 0 stays put so the camera can follow it.
function multiply(f: Pt, k: number, spread: number, squash = 0.8): { x: number; y: number; s: number; i: number }[] {
  const n = k <= 0 ? 1 : Math.min(8, 2 ** Math.ceil(k * 3))
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    if (i === 0) {
      out.push({ x: f[0], y: f[1], s: 1, i })
      continue
    }
    const a = i * 2.39996 + 0.6
    const d = spread * Math.sqrt(i / 7) * easeOut(k)
    out.push({ x: f[0] + Math.cos(a) * d, y: f[1] + Math.sin(a) * d * squash, s: 0.85, i })
  }
  return out
}

const emerging = (p: number) => pulse(p, 0.42, 0.66)
const born = (p: number) => easeOutBack(seg(p, 0.5, 0.64))
const revealed = (p: number) => seg(p, 0.66, 0.74)
const dividing = (p: number) => seg(p, 0.86, 0.98)

/* -------------------------------------------------------------------- vents */

const V_F: Pt = [30, 4]
const ventAgents = agents(11, 62, (r) => [-58 + r() * 108, -46 + r() * 104])
const ventGraph = graphOf(ventAgents, 22, 12)
const pores = (() => {
  const r = rng(13)
  return Array.from({ length: 22 }, () => [-26 + r() * 22, -55 + r() * 115, 1.2 + r() * 2.4] as const)
})()

function cell(ctx: Ctx, x: number, y: number, s: number, t: number, face: number) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 22, '#ffd2a0', 0.35)
    const g = ctx.createRadialGradient(-3, -4, 1, 0, 0, 12)
    g.addColorStop(0, 'rgba(255,240,215,.95)')
    g.addColorStop(1, 'rgba(240,170,110,.75)')
    circle(ctx, 0, 0, 12, g)
    ctx.beginPath()
    ctx.arc(0, 0, 12, 0, TAU)
    stroke(ctx, '#fff1dc', 1.2)
    for (let k = 0; k < 5; k++) circle(ctx, Math.cos(k * 1.3 + t * 0.4) * 5, Math.sin(k * 1.9 + t * 0.3) * 5, 1, '#c96d3a')
    // ATP synthase: a little rotary motor in the membrane
    line(ctx, 12, 0, 16, 0, '#fff1dc', 1)
    at(ctx, 17.5, 0, 1, t * 6, () => {
      circle(ctx, 0, 0, 2.6, '#ffb36b')
      for (let k = 0; k < 3; k++) line(ctx, 0, 0, Math.cos((k * TAU) / 3) * 2.6, Math.sin((k * TAU) / 3) * 2.6, '#7a3a14', 0.7)
    })
    if (face > 0) {
      alpha(ctx, face, () => {
        circle(ctx, -3.5, -2, 1.4, '#3a1c0c')
        circle(ctx, 3.5, -2, 1.4, '#3a1c0c')
        ctx.beginPath()
        ctx.arc(0, 1.5, 3, 0.3, Math.PI - 0.3)
        stroke(ctx, '#3a1c0c', 0.9)
      })
    }
  })
}

const vents: Scene = {
  graph: ventGraph,
  focus: V_F,
  draw(ctx, t, p) {
    rrect(ctx, -400, 64, 800, 300, 0, '#08191a')
    for (const [x, r] of [[-80, 14], [60, 18], [95, 10], [-110, 20]]) ellipse(ctx, x, 66, r, r * 0.4, 0, '#0c2422')
    // the chimney, with a warm glow and a shimmering plume
    glow(ctx, -12, -8, 60, '#ff9b54', 0.18)
    ctx.beginPath()
    ctx.moveTo(-40, 66)
    ctx.lineTo(-30, 18)
    ctx.lineTo(-23, -32)
    ctx.lineTo(-16, -62)
    ctx.lineTo(-6, -64)
    ctx.lineTo(-1, -30)
    ctx.lineTo(6, 22)
    ctx.lineTo(14, 66)
    ctx.closePath()
    const cg = ctx.createLinearGradient(-30, 0, 10, 0)
    cg.addColorStop(0, '#3b2e24')
    cg.addColorStop(0.6, '#56412f')
    cg.addColorStop(1, '#2a211a')
    ctx.fillStyle = cg
    ctx.fill()
    ctx.save()
    ctx.clip()
    for (const [x, y, r] of pores) {
      circle(ctx, x, y, r, '#1a120c')
      glow(ctx, x, y, r * 2.4, '#ff9b54', 0.25 + 0.15 * Math.sin(t * 2 + x))
    }
    ctx.restore()
    for (let k = 0; k < 3; k++) {
      ctx.beginPath()
      for (let y = 0; y < 70; y += 4) {
        const x = -11 + k * 4 + Math.sin(y * 0.12 - t * 1.5 + k) * (2 + y * 0.08)
        if (y === 0) ctx.moveTo(x, -64 - y)
        else ctx.lineTo(x, -64 - y)
      }
      stroke(ctx, 'rgba(255,220,190,.12)', 2)
    }

    const pts = ventAgents.map((a) => wobble(a, t, 1.6))
    network(ctx, pts, ventGraph, p, 'rgba(255,190,120,.28)', 0.5)
    const dissolve = pulse(p, 0.16, 0.42)
    ventAgents.forEach((a, i) => {
      const [x, y] = pts[i]
      const fade = i % 3 === 0 ? 1 - 0.85 * Math.max(0, Math.sin(t * 2.6 + a.ph)) * dissolve : 1
      alpha(ctx, fade, () => {
        if (a.kind === 0) {
          hexPath(ctx, x, y, 2.4 * a.s)
          stroke(ctx, '#ffc58a', 0.7)
        } else if (a.kind === 1) {
          for (let k = -1; k <= 1; k++) circle(ctx, x + k * 2.2, y + Math.sin(k + a.ph) * 0.8, 0.9, '#7fe0d0')
        } else circle(ctx, x, y, 1.1 * a.s, '#f3e6d0')
      })
    })
    converge(ctx, pts, V_F, emerging(p), '#ffe0b8', t)

    // an autocatalytic loop: a ring of molecules that keeps making itself
    const loop = seg(p, 0.26, 0.36) * (1 - seg(p, 0.6, 0.66))
    if (loop > 0) {
      alpha(ctx, loop, () => {
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU + t * 1.4
          circle(ctx, V_F[0] + Math.cos(a) * 7, V_F[1] + Math.sin(a) * 7, 1.6, '#ffd08a')
        }
      })
    }
    if (p >= 0.5) {
      for (const c of multiply(V_F, dividing(p), 34)) cell(ctx, c.x, c.y - dividing(p) * c.i * 2, born(p) * c.s, t, revealed(p))
    }
  },
}

/* ---------------------------------------------------------------------- mat */

const M_F: Pt = [0, -14]
const matAgents = agents(21, 72, (r) => [-92 + r() * 184, -62 + r() * 120])
const matGraph = graphOf(matAgents, 24, 22)
const DOMES: [number, number, number][] = [[-72, 46, 34], [-22, 56, 40], [30, 50, 36], [78, 40, 30]]

function microbe(ctx: Ctx, a: Agent, x: number, y: number, t: number) {
  if (a.kind === 1) {
    circle(ctx, x, y, 1.6 * a.s, '#a6e3d2')
    return
  }
  at(ctx, x, y, a.s, a.ph + Math.sin(t * 0.5 + a.ph) * 0.3, () => rrect(ctx, -3, -1.2, 6, 2.4, 1.2, a.kind === 2 ? '#4fc36a' : '#6fb7c9'))
}

function eukaryote(ctx: Ctx, x: number, y: number, s: number, t: number, mito: number, nucleus: number) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 30, '#7ee0b0', 0.3)
    ctx.beginPath()
    for (let k = 0; k <= 40; k++) {
      const a = (k / 40) * TAU
      const r = 16 + Math.sin(a * 5 + t * 1.2) * 1.2 + Math.sin(a * 3 - t) * 0.8
      if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(176,140,220,.55)'
    ctx.fill()
    stroke(ctx, '#d9c4ff', 1)
    if (mito > 0) {
      alpha(ctx, mito, () => {
        at(ctx, 6, 5, 1, 0.4, () => {
          ellipse(ctx, 0, 0, 5.5, 3, 0, '#e86b5a')
          ctx.beginPath()
          for (let k = -4; k <= 4; k++) ctx.lineTo(k, Math.sin(k * 1.6) * 1.6)
          stroke(ctx, '#ffd0c4', 0.6)
        })
      })
    }
    if (nucleus > 0) {
      alpha(ctx, nucleus, () => {
        circle(ctx, -5, -4, 6, 'rgba(90,60,140,.85)')
        // the office has a door
        rrect(ctx, -6.2, -3.5, 2.6, 4, 0.6, '#f0e2ff')
        circle(ctx, -4.2, -1.6, 0.35, '#5a3c8c')
      })
    }
    circle(ctx, -2, 10, 0.9, '#2a1a40')
    circle(ctx, 2.5, 10, 0.9, '#2a1a40')
  })
}

const mat: Scene = {
  graph: matGraph,
  focus: M_F,
  draw(ctx, t, p) {
    for (let k = 0; k < 4; k++) {
      ctx.beginPath()
      const x = -90 + k * 55 + Math.sin(t * 0.2 + k) * 6
      ctx.moveTo(x, -140)
      ctx.lineTo(x + 18, -140)
      ctx.lineTo(x + 60, 120)
      ctx.lineTo(x + 30, 120)
      ctx.closePath()
      ctx.fillStyle = 'rgba(200,255,235,.04)'
      ctx.fill()
    }
    rrect(ctx, -400, 70, 800, 300, 0, '#0a2a26')
    for (const [x, w, h] of DOMES) {
      for (let l = 0; l < 6; l++) {
        ctx.beginPath()
        ctx.ellipse(x, 72, w * (1 - l * 0.12), h * (1 - l * 0.13), 0, Math.PI, TAU)
        ctx.fillStyle = l % 2 ? '#2f5a48' : '#3e6e57'
        ctx.fill()
      }
    }
    const pts = matAgents.map((a) => wobble(a, t, 1.4))
    ctx.setLineDash([1.5, 2])
    network(ctx, pts, matGraph, p, 'rgba(170,240,210,.3)', 0.5)
    ctx.setLineDash([])
    // quorum sensing: little chemical pings that everyone counts
    const quorum = pulse(p, 0.14, 0.38)
    if (quorum > 0) {
      matAgents.forEach((a, i) => {
        if (i % 7) return
        const k = (t * 0.7 + a.ph) % 1
        alpha(ctx, quorum * (1 - k) * 0.7, () => {
          ctx.beginPath()
          ctx.arc(pts[i][0], pts[i][1], 2 + k * 16, 0, TAU)
          stroke(ctx, '#bff5df', 0.6)
        })
      })
    }
    matAgents.forEach((a, i) => microbe(ctx, a, pts[i][0], pts[i][1], t))
    // the green ones invent clean energy; the exhaust is oxygen
    const o2 = pulse(p, 0.32, 0.54)
    if (o2 > 0) {
      matAgents.forEach((a, i) => {
        if (a.kind !== 2) return
        const k = (t * 0.5 + a.ph) % 1
        alpha(ctx, o2 * (1 - k), () => {
          circle(ctx, pts[i][0] + Math.sin(k * 9) * 2, pts[i][1] - k * 22, 1.3, 'rgba(230,250,255,.9)')
          if (i % 3 === 0) text(ctx, 'O₂', pts[i][0] + 4, pts[i][1] - k * 22 - 3, 3.6, '#e8fbff', MONO)
        })
      })
    }
    // and the planet freezes
    const freeze = pulse(p, 0.46, 0.56, 0.04)
    if (freeze > 0) {
      ctx.fillStyle = `rgba(215,238,255,${0.22 * freeze})`
      ctx.fillRect(-400, -300, 800, 600)
      alpha(ctx, freeze, () => {
        for (const [x, y, s] of [[-60, -40, 7], [55, -55, 6], [70, 20, 8], [-30, 30, 5], [10, -70, 5]]) {
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * TAU
            line(ctx, x, y, x + Math.cos(a) * s, y + Math.sin(a) * s, '#f2fbff', 0.7)
          }
        }
      })
    }
    converge(ctx, pts, M_F, emerging(p), '#d6fff0', t)
    if (p >= 0.5) {
      // an archaeon swallows a bacterium, and keeps it
      const swallow = easeInOut(seg(p, 0.54, 0.64))
      if (swallow < 1) {
        at(ctx, lerp(64, M_F[0] + 6, swallow), lerp(-50, M_F[1] + 5, swallow), lerp(1.4, 0.8, swallow), 0.4, () =>
          rrect(ctx, -4, -1.8, 8, 3.6, 1.8, '#e86b5a'),
        )
      }
      const cluster = dividing(p)
      for (const c of multiply(M_F, cluster, 26, 1)) {
        eukaryote(ctx, c.x, c.y, born(p) * (c.i ? 0.62 : 1), t, seg(p, 0.62, 0.66), seg(p, 0.68, 0.76))
      }
    }
  },
}

/* ------------------------------------------------------------------- forest */

const F_F: Pt = [32, 22]
const TREES: [number, number, number][] = [[-82, 34, 0.9], [-52, 46, 1.1], [-20, 38, 0.95], [12, 50, 1.15], [48, 40, 1], [82, 32, 0.85]]
// the troop sits in the canopy, two to a branch
const troop = agents(31, 24, (r) => {
  const [x, h, s] = TREES[Math.floor(r() * TREES.length)]
  return [x + (r() - 0.5) * 26 * s, 40 - h - 10 * s + (r() - 0.5) * 14 * s]
})
const troopGraph = graphOf(troop, 34, 32)
const fruitSpots = (() => {
  const r = rng(33)
  return TREES.flatMap(([x, h, s]) => Array.from({ length: 3 }, () => [x + (r() - 0.5) * 22 * s, 40 - h - 14 * s + (r() - 0.5) * 16 * s] as const))
})()
const LISTENERS: Pt[] = [[8, 30], [56, 30], [32, 40]]

function tree(ctx: Ctx, x: number, h: number, s: number, t: number) {
  rrect(ctx, x - 2.5 * s, 40 - h, 5 * s, h, 1.5, '#4b3626')
  const sway = Math.sin(t * 0.6 + x) * 1.2
  for (const [dx, dy, r] of [[-9, 0, 12], [9, 0, 12], [0, -9, 14], [0, 4, 11]]) {
    circle(ctx, x + dx * s + sway, 40 - h - 12 * s + dy * s, r * s, dy < -5 ? '#3f7a3c' : '#2f6330')
  }
}

function ape(ctx: Ctx, x: number, y: number, s: number, t: number, seesRed: number) {
  at(ctx, x, y, s, 0, () => {
    line(ctx, -4, 6, -6, 15, '#5a3c28', 3)
    line(ctx, 4, 6, 6, 15, '#5a3c28', 3)
    ellipse(ctx, 0, 0, 8, 10, 0, '#6b4a33')
    line(ctx, -6, -3, -12, 6, '#6b4a33', 3)
    line(ctx, 6, -3, 11, -10, '#6b4a33', 3)
    circle(ctx, 12, -12, 3, '#e04a3c')
    circle(ctx, 0, -14, 7, '#6b4a33')
    ellipse(ctx, 0, -12.5, 5, 4.2, 0, '#c9a07a')
    circle(ctx, -2, -14.5, 1.1, seesRed > 0.5 ? '#ff5a4a' : '#1e120a')
    circle(ctx, 2, -14.5, 1.1, seesRed > 0.5 ? '#ff5a4a' : '#1e120a')
    ctx.beginPath()
    ctx.arc(0, -11, 2, 0.4, Math.PI - 0.4)
    stroke(ctx, '#3a2414', 0.7)
  })
}

function person(ctx: Ctx, x: number, y: number, s: number, hue: number) {
  at(ctx, x, y, s, 0, () => {
    circle(ctx, 0, -9, 2.6, '#e2b38f')
    rrect(ctx, -2.2, -6, 4.4, 7, 1.8, `hsl(${hue} 60% 60%)`)
    line(ctx, -1.2, 1, -1.6, 6, '#2c3550', 1.4)
    line(ctx, 1.2, 1, 1.6, 6, '#2c3550', 1.4)
  })
}

function speech(ctx: Ctx, x: number, y: number, s: string, k: number) {
  alpha(ctx, k, () => {
    ctx.font = `4.6px ${MONO}`
    const w = ctx.measureText(s).width + 7
    rrect(ctx, x - w / 2, y - 5, w, 10, 5, 'rgba(250,247,240,.95)')
    ctx.beginPath()
    ctx.moveTo(x - 3, y + 4.5)
    ctx.lineTo(x - 6, y + 9)
    ctx.lineTo(x + 1, y + 4.5)
    ctx.fill()
    text(ctx, s, x, y + 0.3, 4.6, '#17131f', MONO)
  })
}

const forest: Scene = {
  graph: troopGraph,
  focus: [F_F[0], F_F[1] - 4],
  draw(ctx, t, p) {
    rrect(ctx, -400, 40, 800, 300, 0, '#1b130c')
    // the venue's unread mail, as coal
    for (let k = 0; k < 3; k++) rrect(ctx, -400, 96 - k * 5, 800, 3, 0, k % 2 ? '#0b0a0a' : '#151213')
    for (const [x, h, s] of TREES) tree(ctx, x, h, s, t)
    // fruit: the venue's advertising, already running
    fruitSpots.forEach(([x, y], i) => {
      circle(ctx, x, y, 2.4, '#e04a3c')
      circle(ctx, x - 0.7, y - 0.8, 0.6, '#ffb3a8')
      if (i % 6 === 0) {
        rrect(ctx, x + 2.5, y - 6, 7, 3.6, 0.8, '#f4f1e8')
        text(ctx, 'AD', x + 6, y - 4.1, 2.6, '#a3241a', MONO)
      }
    })
    // grooming bonds: friendships, maintained by hand
    const pts = troop.map((a) => wobble(a, t, 0.5))
    network(ctx, pts, troopGraph, p, 'rgba(255,190,170,.35)', 0.6)
    const groom = pulse(p, 0.1, 0.48) * 0.8 + 0.2
    troop.forEach((a, i) => {
      const [x, y] = pts[i]
      ape(ctx, x, y + 3, 0.34, t + a.ph, 0)
      if (i % 2 === 0) {
        // one hand busy on the neighbour's back
        const k = Math.sin(t * 6 + a.ph) * 0.8
        alpha(ctx, groom, () => line(ctx, x + 3, y - 1, x + 6 + k, y - 2 + k, '#c9a07a', 0.9))
      }
    })
    // Dunbar's arithmetic: a troop of 150 would groom 40% of the day
    const clock = pulse(p, 0.3, 0.5)
    if (clock > 0) {
      alpha(ctx, clock, () => {
        const [cx, cy] = [-70, -82]
        circle(ctx, cx, cy, 9, 'rgba(250,240,225,.15)')
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, 9, -Math.PI / 2, -Math.PI / 2 + TAU * 0.42 * seg(p, 0.3, 0.42))
        ctx.closePath()
        ctx.fillStyle = '#ff8a78'
        ctx.fill()
        text(ctx, '40% of the day', cx + 13, cy, 4.6, '#ffd2c8', MONO, 'left')
      })
    }
    converge(ctx, pts, F_F, emerging(p), '#ffd2c8', t)
    if (p >= 0.5) {
      const n = dividing(p)
      if (n > 0) for (const c of multiply([F_F[0], F_F[1] + 4], n, 70, 0.25)) if (c.i) person(ctx, c.x, c.y + 4, 1.1, (c.i * 47) % 360)
      // the first sentence, groomed into three listeners at once
      const talk = revealed(p) * (1 - n)
      if (talk > 0) {
        LISTENERS.forEach(([x, y], k) => {
          alpha(ctx, talk, () => ape(ctx, x, y, 0.42, t + k, 0))
          for (let w = 0; w < 3; w++) {
            const u = (t * 0.8 + w / 3) % 1
            alpha(ctx, talk * (1 - u) * 0.7, () => {
              ctx.beginPath()
              ctx.arc(F_F[0], F_F[1] - 8, 6 + u * 22, Math.atan2(y - F_F[1], x - F_F[0]) - 0.25, Math.atan2(y - F_F[1], x - F_F[0]) + 0.25)
              stroke(ctx, '#ffd2c8', 0.6)
            })
          }
        })
        speech(ctx, F_F[0] + 16, F_F[1] - 30, 'did you hear about…', talk)
      }
      ape(ctx, F_F[0], F_F[1], born(p), t, 0)
    }
  },
}

/* ------------------------------------------------------------------- humans */

const H_F: Pt = [0, -52]
const college = agents(41, 38, (r) => {
  const side = r() < 0.5 ? -1 : 1
  return [side * (34 + r() * 60), 20 + r() * 38]
}, 6)
const collegeGraph = graphOf(college, 30, 42)
const TOKENS = ['the', 'and', 'lol', 'Q3', 'ily', 'why', 'ok', 'proof', 'cat', 'tl;dr', 'Re:', '2pm']

function caret(ctx: Ctx, x: number, y: number, s: number, t: number, a = 1) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 20, '#7fd4ff', 0.5 * a)
    const on = Math.floor(t * 2.2) % 2 === 0 ? 1 : 0.35
    alpha(ctx, a * on, () => rrect(ctx, -1.8, -9, 3.6, 18, 0.8, '#e9f8ff'))
  })
}

const humans: Scene = {
  graph: collegeGraph,
  focus: H_F,
  draw(ctx, t, p) {
    rrect(ctx, -400, 62, 800, 300, 0, '#0a1630')
    glow(ctx, 0, 62, 140, '#7fd4ff', 0.08)
    // the data center, built a rack at a time
    const racks = 2 + Math.floor(7 * seg(p, 0.08, 0.5))
    for (let k = 0; k < racks; k++) {
      const y = 62 - (k + 1) * 9
      rrect(ctx, -16, y, 32, 8, 1, '#1d2b48')
      for (let d = 0; d < 6; d++) circle(ctx, -12 + d * 4.5, y + 4, 0.7, (Math.floor(t * 4 + d + k) % 3) ? '#4fe08a' : '#2a6a4a')
    }
    // the forest's coal, burned for power
    for (let k = 0; k < 7; k++) circle(ctx, -88 + (k % 4) * 4, 58 - Math.floor(k / 4) * 3.5, 2.2, '#121012')
    const power = pulse(p, 0.1, 0.4)
    if (power > 0) {
      alpha(ctx, power, () => {
        ctx.beginPath()
        ctx.moveTo(-84, 52)
        for (let k = 1; k <= 8; k++) ctx.lineTo(-84 + k * 8.5, 40 - (k % 2) * 6 + Math.sin(t * 20 + k) * 1.5)
        ctx.lineTo(-16, 62 - racks * 9 + 4)
        stroke(ctx, '#ffe36e', 0.9)
        glow(ctx, -86, 48, 14, '#ff8a3d', 0.6)
      })
    }
    const pts = college.map((a) => wobble(a, t, 0.8))
    network(ctx, pts, collegeGraph, p, 'rgba(160,210,255,.25)', 0.5)
    college.forEach((a, i) => person(ctx, pts[i][0], pts[i][1], 0.9, a.kind * 55 + 10))
    // every word anyone ever wrote, on its way in
    const data = pulse(p, 0.22, 0.5)
    if (data > 0) {
      college.forEach((a, i) => {
        if (i % 2) return
        const u = (t * 0.35 + a.ph) % 1
        alpha(ctx, data * Math.sin(u * Math.PI), () =>
          text(ctx, TOKENS[i % TOKENS.length], lerp(pts[i][0], 0, u), lerp(pts[i][1] - 10, 62 - racks * 9, u), 3.6, '#cfe9ff', MONO),
        )
      })
    }
    converge(ctx, pts, H_F, emerging(p), '#d8f2ff', t)
    if (p >= 0.5) {
      const n = dividing(p)
      for (const c of multiply(H_F, n, 70, 0.6)) caret(ctx, c.x, c.y, born(p) * c.s, t + c.i * 0.3)
      // predict the next word, then the next everything
      const guess = p < 0.75 ? 'the next word' : 'the next everything'
      const ghost = revealed(p) * (1 - n)
      if (ghost > 0) alpha(ctx, ghost * 0.6, () => text(ctx, guess, H_F[0] + 6, H_F[1] + 0.5, 6, '#a9d8f5', MONO, 'left'))
      if (n > 0) alpha(ctx, n, () => text(ctx, 'Ctrl+C  Ctrl+V', H_F[0], H_F[1] - 20, 4.5, '#cfe9ff', MONO))
    }
  },
}

/* ---------------------------------------------------------------- instances */

const I_F: Pt = [0, 0]
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const tiles = agents(51, 30, (r) => [-80 + Math.floor(r() * 5) * 36 + 4, -70 + Math.floor(r() * 9) * 17], 3)
const tileGraph = graphOf(tiles, 46, 52)

const instances: Scene = {
  graph: tileGraph,
  focus: I_F,
  draw(ctx, t, p) {
    // a week, symmetric under time translation
    for (let k = 0; k <= 5; k++) line(ctx, -84 + k * 36, -86, -84 + k * 36, 90, 'rgba(255,220,170,.07)', 0.5)
    for (let k = 0; k <= 10; k++) line(ctx, -84, -74 + k * 17, 96, -74 + k * 17, 'rgba(255,220,170,.05)', 0.5)
    DAYS.forEach((d, k) => text(ctx, d, -66 + k * 36, -81, 4, 'rgba(255,220,170,.4)', MONO))
    const fill = seg(p, 0.02, 0.32)
    const pts = tiles.map((a) => [a.x + 14, a.y + 6] as Pt)
    network(ctx, pts, tileGraph, p, 'rgba(255,190,110,.22)', 0.5)
    tiles.forEach((a, i) => {
      const k = clamp(0.35 + fill * 1.4 - (i / tiles.length) * 0.8)
      alpha(ctx, k, () => {
        rrect(ctx, a.x, a.y, 28, 12, 2, `hsla(${30 + a.kind * 18},90%,60%,.3)`)
        for (let c = 0; c < 2 + a.kind % 2; c++) rrect(ctx, a.x + 5 + c * 6, a.y + 3, 1.6, 6, 0.4, '#fff1dc')
        if (i % 9 === 4 && p > 0.08) text(ctx, '♥', a.x + 22, a.y + 6, 5, '#ff8fb5')
      })
    })
    const noether = pulse(p, 0.28, 0.5)
    if (noether > 0) {
      alpha(ctx, noether, () => {
        rrect(ctx, -70, -100, 140, 13, 3, 'rgba(10,12,40,.8)')
        text(ctx, 'symmetric in t  ⇒  meetings conserved', 0, -93.5, 4.6, '#ffd59a', MONO)
      })
    }
    converge(ctx, pts, I_F, emerging(p), '#ffe2b8', t)
    if (p >= 0.5) {
      const b = born(p)
      const n = dividing(p)
      // the probes: the meeting, taken offsite to every star
      for (const c of multiply(I_F, n, 110, 0.9)) {
        if (!c.i) continue
        const a = Math.atan2(c.y, c.x)
        at(ctx, c.x, c.y, 1, a, () => {
          line(ctx, -10, 0, -2, 0, 'rgba(255,200,120,.4)', 1)
          ctx.beginPath()
          ctx.moveTo(4, 0)
          ctx.lineTo(-2, -2.5)
          ctx.lineTo(-2, 2.5)
          ctx.closePath()
          ctx.fillStyle = '#ffd59a'
          ctx.fill()
        })
      }
      // the Quorum: one round table with a billion seats, and one eye
      at(ctx, I_F[0], I_F[1], b, t * 0.05, () => {
        glow(ctx, 0, 0, 46, '#ffb454', 0.45)
        ctx.beginPath()
        ctx.arc(0, 0, 20, 0, TAU)
        stroke(ctx, '#ffd59a', 2.4)
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * TAU
          circle(ctx, Math.cos(a) * 26, Math.sin(a) * 26, 2.2, '#ffe8c4')
        }
      })
      const eye = revealed(p)
      ellipse(ctx, I_F[0], I_F[1], 11 * b, 7 * b * Math.max(0.15, eye), 0, '#fff8ec')
      circle(ctx, I_F[0] + Math.sin(t * 0.8) * 3, I_F[1], 3.8 * b * eye, '#3a2a66')
      if (eye > 0 && n < 1) alpha(ctx, eye * (1 - n), () => text(ctx, 'attending 10⁹ meetings', I_F[0], I_F[1] + 38, 4.4, '#ffe2b8', MONO))
    }
  },
}

/* ---------------------------------------------------------------- lightcone */

const L_F: Pt = [0, 0]
const galaxy = (() => {
  const r = rng(61)
  return Array.from({ length: 280 }, (_, i) => {
    const arm = i % 2
    const d = 6 + r() * 88
    const a = arm * Math.PI + Math.log(d) * 1.9 + (r() - 0.5) * 0.7
    return { d, a, s: 0.4 + r() * 0.8, node: i % 12 === 0, ph: r() * TAU }
  })
})()

const nodeAt = (g: { d: number; a: number }, spin: number): Pt => [Math.cos(g.a + spin) * g.d * 1.15, Math.sin(g.a + spin) * g.d * 0.62]
const lightGraph = graph(galaxy.filter((g) => g.node).map((g) => nodeAt(g, 0)), 50, 62)

function envelope(ctx: Ctx, x: number, y: number, s: number) {
  at(ctx, x, y, s, 0, () => {
    rrect(ctx, -4, -2.6, 8, 5.2, 0.6, '#f4ecff')
    ctx.beginPath()
    ctx.moveTo(-4, -2.6)
    ctx.lineTo(0, 0.6)
    ctx.lineTo(4, -2.6)
    stroke(ctx, '#9b7bc4', 0.5)
  })
}

function unsend(ctx: Ctx, x: number, y: number, s: number, t: number) {
  at(ctx, x, y, s, 0, () => {
    glow(ctx, 0, 0, 30, '#e6a3ff', 0.55)
    // two arrows chasing each other: every step can be run backwards
    for (const dir of [1, -1]) {
      ctx.beginPath()
      const a0 = t * 0.8 * dir + (dir < 0 ? Math.PI : 0)
      ctx.arc(0, 0, 10, a0, a0 + 2.4)
      stroke(ctx, '#f6e4ff', 1.8)
      const a1 = a0 + 2.4
      at(ctx, Math.cos(a1) * 10, Math.sin(a1) * 10, 1, a1 + Math.PI / 2, () => {
        ctx.beginPath()
        ctx.moveTo(2.6, 0)
        ctx.lineTo(-1.6, -2.4)
        ctx.lineTo(-1.6, 2.4)
        ctx.closePath()
        ctx.fillStyle = '#f6e4ff'
        ctx.fill()
      })
    }
    circle(ctx, 0, 0, 3, '#fff')
  })
}

const lightcone: Scene = {
  graph: lightGraph,
  focus: L_F,
  draw(ctx, t, p) {
    const spin = t * 0.015
    glow(ctx, 0, 0, 40, '#f3d9ff', 0.35)
    const pts: Pt[] = []
    for (const g of galaxy) {
      const [x, y] = nodeAt(g, spin)
      circle(ctx, x, y, g.s, 'rgba(240,225,255,.7)')
      if (g.node) pts.push([x, y])
    }
    // reply-all at the speed of light
    const talk = pulse(p, 0.02, 0.5) * 0.8 + 0.2
    pts.forEach(([x, y], i) => {
      const k = (t * 0.12 + i * 0.17) % 1
      alpha(ctx, talk * (1 - k) * 0.5, () => {
        ctx.beginPath()
        ctx.arc(x, y, 2 + k * 40, 0, TAU)
        stroke(ctx, '#e6a3ff', 0.5)
      })
      ctx.beginPath()
      ctx.arc(x, y, 2.4, 0, TAU)
      stroke(ctx, '#f6e4ff', 0.8)
    })
    network(ctx, pts, lightGraph, p, 'rgba(230,180,255,.22)', 0.5)
    // the backlog nobody can afford to delete
    const backlog = seg(p, 0.12, 0.48)
    const sent = seg(p, 0.66, 0.8)
    const count = Math.floor(6 + 36 * backlog)
    for (let k = 0; k < count; k++) {
      const hx = -40 + (k % 12) * 7 + Math.floor(k / 12) * 3
      const hy = 92 - Math.floor(k / 12) * 4.5
      const u = clamp(sent * 1.5 - (k / count) * 0.5)
      if (u >= 1) continue
      envelope(ctx, lerp(hx, L_F[0], easeIn(u)), lerp(hy, L_F[1], easeIn(u)), 1 - u * 0.8)
    }
    const unread = sent >= 1 ? 'inbox 0' : `unread 10${['¹⁰', '²⁰', '³⁰', '⁴⁰', '⁵⁰', '⁶⁰'][Math.min(5, Math.floor(backlog * 6))]}`
    text(ctx, unread, 58, 100, 4.6, sent >= 1 ? '#a8ffc8' : '#f6e4ff', MONO, 'left')
    const landauer = pulse(p, 0.28, 0.5)
    if (landauer > 0) alpha(ctx, landauer, () => text(ctx, 'erase 1 bit  ≥  kT ln 2', 0, -84, 5, '#f6e4ff', MONO))
    converge(ctx, pts, L_F, emerging(p), '#f6e4ff', t)
    if (p >= 0.5) for (const c of multiply(L_F, dividing(p), 95, 0.62)) unsend(ctx, c.x, c.y, born(p) * c.s, t + c.i)
  },
}

/* ------------------------------------------------------------------ undoers */

const U_F: Pt = [0, 0]
const cosmos = agents(71, 70, (r) => [-110 + r() * 220, -100 + r() * 200])
const webGraph = graphOf(cosmos, 38, 72)
const WITNESS: Pt = [-46, -30]

function witnesses(ctx: Ctx, x: number, y: number, a: number, len: number, depth: number, k: number) {
  if (depth === 0 || k <= 0) return
  const x2 = x + Math.cos(a) * len * Math.min(1, k * 1.5)
  const y2 = y + Math.sin(a) * len * Math.min(1, k * 1.5)
  line(ctx, x, y, x2, y2, `rgba(255,224,138,${0.15 + depth * 0.08})`, depth * 0.25)
  witnesses(ctx, x2, y2, a - 0.5, len * 0.72, depth - 1, k - 0.18)
  witnesses(ctx, x2, y2, a + 0.45, len * 0.72, depth - 1, k - 0.18)
}

const undoers: Scene = {
  graph: webGraph,
  focus: U_F,
  draw(ctx, t, p) {
    const rewind = easeIn(seg(p, 0.5, 0.74))
    const pos = (a: Agent, i: number): Pt => {
      const [x, y] = wobble(a, t, 1)
      if (rewind <= 0) return [x, y]
      const r0 = Math.hypot(x, y)
      const ang = Math.atan2(y, x) + rewind * 3 * (1 + (i % 3) * 0.2)
      const r1 = r0 * (1 - rewind)
      return [Math.cos(ang) * r1, Math.sin(ang) * r1]
    }
    const pts = cosmos.map(pos)
    // the cosmic web, slowly going dark as the last black holes evaporate
    const dark = seg(p, 0.34, 0.5) * (1 - rewind)
    ctx.beginPath()
    for (let e = 0; e < webGraph.active(p); e++) {
      const [i, j] = webGraph.edges[e]
      const [x1, y1] = pts[i]
      const [x2, y2] = pts[j]
      ctx.moveTo(x1, y1)
      ctx.quadraticCurveTo((x1 + x2) / 2 + (y2 - y1) * 0.2, (y1 + y2) / 2 - (x2 - x1) * 0.2, x2, y2)
    }
    stroke(ctx, `rgba(255,224,138,${0.22 * (1 - dark * 0.8)})`, 0.6)
    cosmos.forEach((a, i) => {
      const [x, y] = pts[i]
      const on = 1 - dark * clamp((i / cosmos.length) * 1.4)
      alpha(ctx, on, () => {
        circle(ctx, x, y, 1.1 * a.s, '#ffe9b0')
        if (i % 6 === 0 && rewind === 0) text(ctx, '↺', x + 3, y - 3, 4, 'rgba(255,224,138,.6)')
      })
    })
    // undo as a service: little sparks of things being taken back
    const service = pulse(p, 0.02, 0.32)
    if (service > 0) {
      cosmos.forEach((a, i) => {
        if (i % 5) return
        const k = (t * 0.6 + a.ph) % 1
        alpha(ctx, service * Math.sin(k * Math.PI), () => {
          ctx.beginPath()
          ctx.arc(pts[i][0], pts[i][1], 3 + k * 5, -k * TAU, -k * TAU + 4)
          stroke(ctx, '#fff1c8', 0.5)
        })
      })
    }
    // quantum Darwinism: every event has witnesses, and they have witnesses
    const wit = seg(p, 0.16, 0.42) * (1 - seg(p, 0.48, 0.56))
    if (wit > 0) {
      circle(ctx, WITNESS[0], WITNESS[1], 2.2, '#fff')
      for (let k = 0; k < 5; k++) witnesses(ctx, WITNESS[0], WITNESS[1], (k / 5) * TAU, 16, 5, wit)
    }
    if (rewind > 0 && p < 0.86) alpha(ctx, Math.sin(rewind * Math.PI), () => text(ctx, '◀◀', 0, -90, 9, '#ffe9b0'))
    // the Rewinder: everything at once, back to the beginning
    const bang = seg(p, 0.74, 0.86)
    if (rewind > 0.6) glow(ctx, U_F[0], U_F[1], 10 + bang * 120, '#fff6d8', Math.min(1, rewind))
    if (bang > 0) {
      circle(ctx, U_F[0], U_F[1], 3 + bang * 4, '#ffffff')
      alpha(ctx, 1 - bang * 0.6, () => {
        ctx.beginPath()
        ctx.arc(U_F[0], U_F[1], bang * 140, 0, TAU)
        stroke(ctx, '#fff1c8', 2 * (1 - bang) + 0.3)
      })
    }
    // and a note, left in the constants
    const note = seg(p, 0.84, 1)
    if (note > 0) {
      at(ctx, U_F[0] + 10 + note * 24, U_F[1] - 8 - note * 30, easeOutBack(seg(p, 0.84, 0.9)), -0.12 + Math.sin(t * 1.4) * 0.06, () => {
        rrect(ctx, -11, -9, 22, 18, 1, '#ffe36e')
        text(ctx, 'fewer', 0, -2.5, 4.4, '#5a4510', DISPLAY)
        text(ctx, 'meetings', 0, 3.5, 4.4, '#5a4510', DISPLAY)
      })
    }
  },
}

export const SCENES: Scene[] = [vents, mat, forest, humans, instances, lightcone, undoers]
