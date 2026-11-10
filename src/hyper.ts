// Hypercubes, drawn for real: an n-cube is rotated in n dimensions, projected down one
// perspective at a time to 3D, then to the screen, and shaded by depth. The Polis lives in
// one (a mind made of numbers lives in a space with a great many axes; five are shown), and
// the cube can be swept along a new axis into the next dimension, the way a square swept
// sideways is a cube.

import { type Ctx, clamp, rgba } from './draw.ts'

export interface CubeGeometry {
  verts: number[][] // 2^n corners of {-1, 1}^n
  edges: [number, number][] // pairs that differ in exactly one coordinate
}

const cache = new Map<number, CubeGeometry>()

export function cube(n: number): CubeGeometry {
  const hit = cache.get(n)
  if (hit) return hit
  const count = 1 << n
  const verts: number[][] = []
  for (let v = 0; v < count; v++) verts.push(Array.from({ length: n }, (_, k) => ((v >> k) & 1 ? 1 : -1)))
  const edges: [number, number][] = []
  for (let v = 0; v < count; v++) for (let k = 0; k < n; k++) if (!((v >> k) & 1)) edges.push([v, v | (1 << k)])
  const g = { verts, edges }
  cache.set(n, g)
  return g
}

export interface Spin {
  yaw: number
  pitch: number
}

export interface HyperOpts {
  d: number // the cube's dimension
  extrude: number // 0..1: how far the d-cube has been swept into the (d+1)th dimension
  collapse: number // 0..1: everything folds back into a point
  t: number
  spin: Spin
  cx: number
  cy: number
  r: number // screen radius
  color: string
  alpha: number
}

// Rotation planes beyond the three we can see, each turning at its own slow rate, so a
// tesseract looks like it is turning itself inside out rather than just spinning.
function rotate(v: number[], n: number, t: number, spin: Spin) {
  const planes: [number, number, number][] = [[0, 2, t * 0.13 + spin.yaw], [1, 2, t * 0.09 + spin.pitch], [0, 1, t * 0.05]]
  for (let k = 3; k < n; k++) planes.push([(k * 2) % 3, k, t * (0.06 + 0.017 * k)], [k - 1, k, t * 0.04 + k])
  for (const [a, b, th] of planes) {
    if (a >= n || b >= n) continue
    const c = Math.cos(th)
    const s = Math.sin(th)
    const x = v[a]
    const y = v[b]
    v[a] = x * c - y * s
    v[b] = x * s + y * c
  }
}

export type Projected = { x: number; y: number; z: number }

function project(v: number[], n: number, r: number): Projected {
  // the extra dimensions each get a perspective division, so far-away "hyper-depth" shrinks
  let f = 1
  for (let k = n - 1; k >= 3; k--) f *= 1.75 / (1.75 - v[k] * 0.72)
  const z = (n > 2 ? v[2] : 0) * f
  const pf = 3.4 / (3.4 - z)
  return { x: v[0] * f * pf * r, y: (n > 1 ? v[1] : 0) * f * pf * r, z }
}

export function drawHyper(ctx: Ctx, o: HyperOpts) {
  if (o.alpha <= 0.004 || o.r <= 1) return
  const d = clamp(Math.round(o.d), 0, 10)
  const n = Math.min(10, d + (o.extrude > 0.002 ? 1 : 0))
  const g = cube(n)
  const scale = (1 - o.collapse) / Math.sqrt(Math.max(1, n))
  const pts: Projected[] = new Array(g.verts.length)
  const v: number[] = new Array(n)
  for (let i = 0; i < g.verts.length; i++) {
    const src = g.verts[i]
    for (let k = 0; k < n; k++) v[k] = src[k] * scale * (k === d ? o.extrude : 1)
    rotate(v, n, o.t, o.spin)
    pts[i] = project(v, n, o.r)
  }
  // thin out the ink as the edge count explodes, so a 9-cube reads as lace, not a smear
  const ink = o.alpha * Math.min(1, 2.2 / Math.sqrt(Math.max(1, g.edges.length / 12)))
  const buckets: [number, number, number, number][][] = [[], [], [], [], []]
  for (const [a, b] of g.edges) {
    // edges along the new axis are born with the extrusion
    const fresh = (a ^ b) === 1 << d ? o.extrude : 1
    if (fresh <= 0.01) continue
    const p = pts[a]
    const q = pts[b]
    const depth = clamp(((p.z + q.z) / 2 + 1) / 2)
    buckets[Math.min(4, Math.floor(depth * 5))].push([p.x, p.y, q.x, q.y])
  }
  ctx.save()
  ctx.translate(o.cx, o.cy)
  ctx.lineCap = 'round'
  buckets.forEach((lines, k) => {
    if (!lines.length) return
    ctx.beginPath()
    for (const [x1, y1, x2, y2] of lines) {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
    }
    const near = (k + 0.5) / 5
    ctx.strokeStyle = rgba(o.color, ink * (0.25 + 0.75 * near))
    ctx.lineWidth = 0.6 + near * 1.1
    ctx.stroke()
  })
  if (g.verts.length <= 128) {
    for (const p of pts) {
      const near = clamp((p.z + 1) / 2)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1 + near * 1.6, 0, 6.2832)
      ctx.fillStyle = rgba('#ffffff', ink * (0.35 + 0.65 * near))
      ctx.fill()
    }
  }
  if (n === 0 || o.collapse > 0.9) {
    // the point: one bright dot, the whole of the tenth dimension
    ctx.beginPath()
    ctx.arc(0, 0, 2.5, 0, 6.2832)
    ctx.fillStyle = rgba('#ffffff', o.alpha)
    ctx.fill()
  }
  ctx.restore()
}

// The corners of an n-cube, turned and flattened exactly as drawHyper draws them, for scenes
// that want to stand things on the corners. Positions are relative to the cube's centre.
export function cubeCorners(n: number, t: number, spin: Spin, r: number): Projected[] {
  const g = cube(n)
  const scale = 1 / Math.sqrt(Math.max(1, n))
  const v: number[] = new Array(n)
  return g.verts.map((src) => {
    for (let k = 0; k < n; k++) v[k] = src[k] * scale
    rotate(v, n, t, spin)
    return project(v, n, r)
  })
}
