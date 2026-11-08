// The sky behind each scene is a Julia set, computed live at low resolution and stretched
// over the stage. Each tier has its own constant c, chosen for a shape that suits it, and the
// constant drifts in a slow circle so the set breathes. During a zoom c slides from one tier's
// value to the next, so the sky morphs instead of cutting.

import { type Ctx, clamp, lerp } from './draw.ts'

export type Complex = [number, number]

// One constant per tier: dendrites for the vents, a stromatolite-ish blob for the mats, a
// branching canopy, a spiral galaxy, and so on. All sit on or near the Mandelbrot boundary.
export const JULIA_C: Complex[] = [
  [-0.79, 0.15], // vents: branching dendrites, like fluid through rock
  [-0.4, 0.6], // mat: fat lobes, layered
  [0.285, 0.01], // troop: a canopy of fronds
  [-0.7017, 0.3842], // humans: spirals within spirals
  [-0.835, -0.2321], // instances: a tiling of copies
  [0.355, 0.355], // lightcone: pinwheels, like galaxies
  [-0.7269, 0.1889], // undoers: a filigree about to dissolve
]

export class JuliaSky {
  readonly canvas = document.createElement('canvas')
  private g = this.canvas.getContext('2d', { willReadFrequently: true })!
  private img: ImageData | null = null
  private w = 0
  private h = 0

  // Renders the set for constant c in the given tint; returns the offscreen canvas.
  render(c: Complex, tint: [number, number, number], w: number, h: number, zoom: number, t: number, drift: number) {
    w = Math.max(24, Math.round(w))
    h = Math.max(16, Math.round(h))
    if (w !== this.w || h !== this.h) {
      this.canvas.width = this.w = w
      this.canvas.height = this.h = h
      this.img = this.g.createImageData(w, h)
    }
    const d = this.img!.data
    const cr = c[0] + Math.cos(t * 0.11) * 0.012 * drift
    const ci = c[1] + Math.sin(t * 0.13) * 0.012 * drift
    const span = 3.1 / zoom
    const aspect = w / h
    const maxIt = 40
    const [tr, tg, tb] = tint
    let k = 0
    for (let y = 0; y < h; y++) {
      const zi0 = ((y / h) * 2 - 1) * (span / 2)
      for (let x = 0; x < w; x++) {
        let zr = ((x / w) * 2 - 1) * (span / 2) * aspect
        let zi = zi0
        let i = 0
        let r2 = 0
        for (; i < maxIt; i++) {
          const nr = zr * zr - zi * zi + cr
          zi = 2 * zr * zi + ci
          zr = nr
          r2 = zr * zr + zi * zi
          if (r2 > 16) break
        }
        if (i >= maxIt) {
          // inside the set: a deep, quiet tint
          d[k++] = tr * 0.22
          d[k++] = tg * 0.22
          d[k++] = tb * 0.22
          d[k++] = 90
        } else {
          // smooth escape count, so the bands do not stair-step
          const nu = i + 1 - Math.log2(Math.log(r2) / 2)
          const u = clamp(nu / maxIt)
          const band = 0.55 + 0.45 * Math.sin(nu * 0.55 - t * 0.6)
          const a = Math.pow(u, 1.35) * (0.55 + 0.45 * band)
          // the tier's own colour, lifting toward white only right at the boundary
          const lift = Math.pow(u, 4) * 0.6
          d[k++] = Math.min(255, lerp(tr * 0.35, tr, u * band) + 255 * lift) * a
          d[k++] = Math.min(255, lerp(tg * 0.35, tg, u * band) + 255 * lift) * a
          d[k++] = Math.min(255, lerp(tb * 0.35, tb, u * band) + 255 * lift) * a
          d[k++] = 255 * a * 0.9
        }
      }
    }
    this.g.putImageData(this.img!, 0, 0)
    return this.canvas
  }

  // Draws the last rendered sky stretched over a rectangle.
  blit(ctx: Ctx, x: number, y: number, w: number, h: number, alpha: number) {
    if (!this.w || alpha <= 0.004) return
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'low'
    ctx.drawImage(this.canvas, x, y, w, h)
    ctx.restore()
  }
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
