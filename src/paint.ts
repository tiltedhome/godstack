// How the scenes draw their geometry. If the WebGL layer is running, wires, faces and spheres
// go to the GPU (and get lit, blended and bloomed there); if not, the wires are drawn on the
// 2D canvas exactly as before and the faces are simply left out. Scenes never need to know.

import { TAU, rgba, type Ctx } from './draw.ts'
import type { GLLayer, GLPoint } from './gl.ts'
import { depthShade, drawWire, type P } from './solid.ts'

let gl: GLLayer | null = null
export function setPainter(layer: GLLayer | null) {
  gl = layer
}
export const usingGL = () => gl !== null

export function wire(ctx: Ctx, pts: GLPoint[], edges: [number, number][], color: string, alpha: number, width = 1) {
  if (gl) return gl.wire(pts, edges, color, alpha * 1.25)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  drawWire(ctx, pts as P[], edges, color, alpha, width)
  ctx.restore()
}

export function faces(pts: GLPoint[], tris: [number, number, number][], color: string, alpha: number) {
  gl?.faces(pts, tris, color, alpha)
}

// Spheres. Without the GPU they are drawn as the circles they project to.
export function orbs(ctx: Ctx, pts: P[], radius: number, color: string, alpha: number) {
  if (gl) return gl.orb(pts, radius, color, alpha)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineWidth = 0.7
  for (const q of pts) {
    ctx.beginPath()
    ctx.arc(q.x, q.y, radius * q.k, 0, TAU)
    ctx.strokeStyle = rgba(color, alpha * 0.4 * (0.4 + 0.6 * depthShade(q.z)))
    ctx.stroke()
  }
  ctx.restore()
}
