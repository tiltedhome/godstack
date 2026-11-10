// Sacred geometry, drawn for real. Every form here is built from its definition (the five
// Platonic solids from their coordinates, Kepler's nest from their inradii, the torus from two
// circles, the sphere of stars from the golden angle, Metatron's cube from the twelve spheres
// that fit round a thirteenth, Penrose's tiling by subdivision, E8 from its 240 roots), then
// rotated, perspective-projected and shaded by depth. Nothing is traced from a picture.

import { type Ctx, clamp, rgba } from './draw.ts'

export type V3 = [number, number, number]
export interface Wire {
  verts: V3[]
  edges: [number, number][]
}

export const PHI = (1 + Math.sqrt(5)) / 2
// 137.507...°: the angle a sunflower turns between one seed and the next
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const norm = (v: number[]) => Math.hypot(...v)
const unit = (v: V3): V3 => {
  const n = norm(v)
  return [v[0] / n, v[1] / n, v[2] / n]
}
const dist = (a: number[], b: number[]) => Math.hypot(...a.map((x, i) => x - b[i]))

// Join every pair of vertices that is as close as the closest pair: for a Platonic solid
// (and for the cuboctahedron) those are exactly the edges.
function nearestEdges(verts: number[][]): [number, number][] {
  let min = Infinity
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) min = Math.min(min, dist(verts[i], verts[j]))
  const edges: [number, number][] = []
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) if (dist(verts[i], verts[j]) < min * 1.01) edges.push([i, j])
  return edges
}

const signs = (v: number[]): number[][] =>
  v.reduce<number[][]>((acc, x) => acc.flatMap((a) => (x === 0 ? [[...a, 0]] : [[...a, x], [...a, -x]])), [[]])
const cyclic = (v: V3): V3[] => [v, [v[2], v[0], v[1]], [v[1], v[2], v[0]]]
const solid = (raw: number[][]): Wire => {
  const verts = raw.map((v) => unit(v as V3))
  return { verts, edges: nearestEdges(verts) }
}

export type SolidName = 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron'

// The five Platonic solids, each with its corners on the unit sphere.
export const PLATONIC: Record<SolidName, Wire> = {
  tetrahedron: solid([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]),
  cube: solid(signs([1, 1, 1])),
  octahedron: solid(cyclic([1, 0, 0]).flatMap(signs)),
  dodecahedron: solid([...signs([1, 1, 1]), ...cyclic([0, 1 / PHI, PHI]).flatMap(signs)]),
  icosahedron: solid(cyclic([0, 1, PHI]).flatMap(signs)),
}

// Radius of the sphere that fits inside each solid, when its corners are on the unit sphere.
export const INRADIUS: Record<SolidName, number> = {
  tetrahedron: 1 / 3,
  cube: 1 / Math.sqrt(3),
  octahedron: 1 / Math.sqrt(3),
  dodecahedron: Math.sqrt((5 + 2 * Math.sqrt(5)) / 15),
  icosahedron: Math.sqrt((5 + 2 * Math.sqrt(5)) / 15),
}

// Kepler's Mysterium Cosmographicum (1596), from Saturn inward: each solid sits inside the
// sphere of one planet's orbit and holds the sphere of the next. `orbits` are the six radii
// that fall out, Saturn's set to 1. (The real ones are 1, 0.55, 0.16, 0.10, 0.076, 0.041.)
export const KEPLER_ORDER: SolidName[] = ['cube', 'tetrahedron', 'dodecahedron', 'icosahedron', 'octahedron']
export function kepler(): { shells: { name: SolidName; r: number }[]; orbits: number[] } {
  const orbits = [1]
  const shells = KEPLER_ORDER.map((name) => {
    const r = orbits[orbits.length - 1]
    orbits.push(r * INRADIUS[name])
    return { name, r }
  })
  return { shells, orbits }
}

// A point on a torus: u goes round the big circle, v round the tube.
export function torusPoint(u: number, v: number, R: number, r: number): V3 {
  const c = R + r * Math.cos(v)
  return [c * Math.cos(u), r * Math.sin(v), c * Math.sin(u)]
}

export function torus(R: number, r: number, nu: number, nv: number): Wire {
  const verts: V3[] = []
  const edges: [number, number][] = []
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      verts.push(torusPoint((i / nu) * 2 * Math.PI, (j / nv) * 2 * Math.PI, R, r))
      const a = i * nv + j
      edges.push([a, i * nv + ((j + 1) % nv)], [a, ((i + 1) % nu) * nv + j])
    }
  }
  return { verts, edges }
}

// n points spread evenly over the unit sphere the way a sunflower spreads its seeds: each one
// the golden angle round from the last. Joining point i to i+8 and i+13 draws the spirals.
export function fibSphere(n: number): V3[] {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(1 - y * y)
    return [Math.cos(i * GOLDEN_ANGLE) * r, y, Math.sin(i * GOLDEN_ANGLE) * r] as V3
  })
}

// Twelve unit spheres fit round a thirteenth, touching it (and no more: Newton against
// Gregory, 1694, settled in 1953). Their centres are a cuboctahedron. Join all thirteen
// centres to each other and the 78 lines are Metatron's cube.
export function metatron(): Wire & { shell: [number, number][] } {
  const outer = cyclic([1, 1, 0]).flatMap(signs).map((v) => unit(v as V3))
  const verts: V3[] = [[0, 0, 0], ...outer]
  const edges: [number, number][] = []
  for (let i = 0; i < 13; i++) for (let j = i + 1; j < 13; j++) edges.push([i, j])
  return { verts, edges, shell: nearestEdges(outer).map(([a, b]) => [a + 1, b + 1]) }
}

// The 240 roots of E8, in eight dimensions: 112 with two entries of ±1 and the rest zero, and
// 128 with every entry ±1/2 and an even number of minus signs. All have length √2.
export function e8Roots(): number[][] {
  const roots: number[][] = []
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const v = new Array<number>(8).fill(0)
        v[i] = a
        v[j] = b
        roots.push(v)
      }
    }
  }
  for (let m = 0; m < 256; m++) {
    let minus = 0
    const v = Array.from({ length: 8 }, (_, k) => {
      const neg = (m >> k) & 1
      minus += neg
      return neg ? -0.5 : 0.5
    })
    if (minus % 2 === 0) roots.push(v)
  }
  return roots
}

// Each root has 56 nearest neighbours (inner product 1), which makes 6,720 edges in all.
export function e8Edges(roots: number[][]): [number, number][] {
  const edges: [number, number][] = []
  for (let i = 0; i < roots.length; i++) {
    for (let j = i + 1; j < roots.length; j++) {
      let ip = 0
      for (let k = 0; k < 8; k++) ip += roots[i][k] * roots[j][k]
      if (Math.abs(ip - 1) < 1e-9) edges.push([i, j])
    }
  }
  return edges
}

// Three directions in eight dimensions to cast the shadow along. They are built from the
// golden ratio, so the 240 roots land on a handful of nested shells with fivefold symmetry.
const E8_BASIS = [
  [1, PHI, 0, -1, PHI, 0, 0, 0],
  [PHI, 0, 1, PHI, 0, -1, 0, 0],
  [0, 1, PHI, 0, -1, PHI, 0, 0],
].map((b) => b.map((x) => x / norm(b)))

// Rotates a root in four planes that mix the visible axes with the hidden ones (so the shadow
// keeps turning itself inside out), then drops it into three dimensions.
export function e8Shadow(root: number[], t: number, out: number[] = []): V3 {
  for (let k = 0; k < 8; k++) out[k] = root[k]
  for (let k = 0; k < 4; k++) {
    const th = t * (0.031 + 0.011 * k)
    const c = Math.cos(th)
    const s = Math.sin(th)
    const a = out[k]
    const b = out[k + 4]
    out[k] = a * c - b * s
    out[k + 4] = a * s + b * c
  }
  const p: V3 = [0, 0, 0]
  for (let d = 0; d < 3; d++) for (let k = 0; k < 8; k++) p[d] += E8_BASIS[d][k] * out[k]
  return p
}

// Penrose's rhombus tiling, by cutting Robinson triangles: start with a wheel of ten, and at
// every step split each triangle by the golden ratio. Returns the rhombus edges, each once,
// scaled so the wheel has radius 1. It has fivefold order and never repeats.
export function penrose(depth: number): { pts: [number, number][]; edges: [number, number][] } {
  type C = [number, number]
  type Tri = [number, C, C, C]
  const mix = (a: C, b: C, f: number): C => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
  let tris: Tri[] = []
  for (let i = 0; i < 10; i++) {
    let b: C = [Math.cos(((2 * i - 1) * Math.PI) / 10), Math.sin(((2 * i - 1) * Math.PI) / 10)]
    let c: C = [Math.cos(((2 * i + 1) * Math.PI) / 10), Math.sin(((2 * i + 1) * Math.PI) / 10)]
    if (i % 2 === 0) [b, c] = [c, b]
    tris.push([0, [0, 0], b, c])
  }
  for (let d = 0; d < depth; d++) {
    const next: Tri[] = []
    for (const [kind, a, b, c] of tris) {
      if (kind === 0) {
        const p = mix(a, b, 1 / PHI)
        next.push([0, c, p, b], [1, p, c, a])
      } else {
        const q = mix(b, a, 1 / PHI)
        const r = mix(b, c, 1 / PHI)
        next.push([1, r, c, a], [1, q, r, b], [0, r, q, a])
      }
    }
    tris = next
  }
  const index = new Map<string, number>()
  const pts: C[] = []
  const id = (p: C) => {
    const key = `${Math.round(p[0] * 1e5)},${Math.round(p[1] * 1e5)}`
    let i = index.get(key)
    if (i === undefined) {
      i = pts.length
      index.set(key, i)
      pts.push(p)
    }
    return i
  }
  const seen = new Set<number>()
  const edges: [number, number][] = []
  const add = (p: C, q: C) => {
    const i = id(p)
    const j = id(q)
    const key = Math.min(i, j) * 100003 + Math.max(i, j)
    if (!seen.has(key)) {
      seen.add(key)
      edges.push([i, j])
    }
  }
  // the two equal sides of each triangle; the base is where it joins its twin into a rhombus
  for (const [, a, b, c] of tris) {
    add(c, a)
    add(a, b)
  }
  return { pts, edges }
}

/* ------------------------------------------------------------------ the camera */

export interface View {
  yaw: number
  pitch: number
}

export interface P {
  x: number
  y: number
  z: number // depth, roughly -1 (far) to 1 (near) for a form of unit radius
  k: number // perspective scale at that depth
}

// Turns a point about the vertical axis, then tips it toward the viewer, then applies
// perspective. Coordinates are in units of the form's radius; the result is in scene units.
export function project(v: V3, view: View, R: number): P {
  const cy = Math.cos(view.yaw)
  const sy = Math.sin(view.yaw)
  const cp = Math.cos(view.pitch)
  const sp = Math.sin(view.pitch)
  const x = v[0] * cy + v[2] * sy
  const z0 = -v[0] * sy + v[2] * cy
  const y = v[1] * cp - z0 * sp
  const z = v[1] * sp + z0 * cp
  const k = 3.6 / (3.6 - z)
  return { x: x * k * R, y: y * k * R, z, k }
}

export const depthShade = (z: number) => clamp((z + 1.15) / 2.3)

// Draws a wireframe with far edges thin and faint and near edges bright, in five passes.
export function drawWire(ctx: Ctx, pts: P[], edges: [number, number][], color: string, alpha: number, width = 1) {
  if (alpha <= 0.004) return
  const buckets: number[][] = [[], [], [], [], []]
  for (const [a, b] of edges) {
    const p = pts[a]
    const q = pts[b]
    buckets[Math.min(4, Math.floor(depthShade((p.z + q.z) / 2) * 5))].push(p.x, p.y, q.x, q.y)
  }
  ctx.lineCap = 'round'
  for (let k = 0; k < 5; k++) {
    const lines = buckets[k]
    if (!lines.length) continue
    ctx.beginPath()
    for (let i = 0; i < lines.length; i += 4) {
      ctx.moveTo(lines[i], lines[i + 1])
      ctx.lineTo(lines[i + 2], lines[i + 3])
    }
    const near = (k + 0.5) / 5
    ctx.strokeStyle = rgba(color, alpha * (0.22 + 0.78 * near))
    ctx.lineWidth = width * (0.45 + near * 0.8)
    ctx.stroke()
  }
}
