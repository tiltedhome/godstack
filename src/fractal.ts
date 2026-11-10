// The sky behind each scene is a Julia set, computed live at low resolution and stretched
// over the stage. Each plane has its own constant c, and the constant drifts in a slow circle
// so the set breathes. Between planes the camera leaves the Julia set for the Mandelbrot set,
// crosses it from the old constant to the new one, and drops into the new plane's sky.

import { type Ctx, clamp, lerp } from './draw.ts'

export type Complex = [number, number]

// One constant per plane, all on or near the boundary of the Mandelbrot set, which is the
// map of every Julia set there is: pick a point on it and that point's Julia set looks, up
// close, like the map does there (Tan Lei proved a precise version in 1990). So the zoom
// between planes can honestly travel across the map from one constant to the next.
export const JULIA_C: Complex[] = [
  [-0.79, 0.15], // overtones: dendrites, like a plucked string photographed badly
  [0.285, 0.01], // orrery: nested ovals, wheels in wheels
  [-0.4, 0.6], // cluster: fat lobes, a ball of lobes
  [-0.7017, 0.3842], // humans: spirals within spirals
  [-0.835, -0.2321], // polis: a tiling of copies
  [0.355, 0.355], // brood: pinwheels budding pinwheels
  [-0.7269, 0.1889], // caucus: a filigree about to become one line
]

// Each loop nudges every constant a little way round a small circle, so the same plane has a
// recognisably similar sky that is never the same sky twice.
export function juliaFor(index: number, loop: number): Complex {
  const [re, im] = JULIA_C[index % JULIA_C.length]
  if (loop <= 1) return [re, im]
  const a = (loop - 1) * 2.39996
  return [re + Math.cos(a) * 0.006, im + Math.sin(a) * 0.006]
}

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

  // Renders the Mandelbrot set around a point: the map the zoom travels across. Same colouring as the skies, so the two crossfade cleanly.
  renderMap(center: Complex, tint: [number, number, number], w: number, h: number, span: number, t: number) {
    w = Math.max(24, Math.round(w))
    h = Math.max(16, Math.round(h))
    if (w !== this.w || h !== this.h) {
      this.canvas.width = this.w = w
      this.canvas.height = this.h = h
      this.img = this.g.createImageData(w, h)
    }
    const d = this.img!.data
    const aspect = w / h
    const maxIt = 48
    const [tr, tg, tb] = tint
    let k = 0
    for (let y = 0; y < h; y++) {
      const ci = center[1] + ((y / h) * 2 - 1) * (span / 2)
      for (let x = 0; x < w; x++) {
        const cr = center[0] + ((x / w) * 2 - 1) * (span / 2) * aspect
        let zr = 0
        let zi = 0
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
          d[k++] = tr * 0.16
          d[k++] = tg * 0.16
          d[k++] = tb * 0.16
          d[k++] = 150
        } else {
          const nu = i + 1 - Math.log2(Math.log(r2) / 2)
          const u = clamp(nu / maxIt)
          const band = 0.55 + 0.45 * Math.sin(nu * 0.7 - t * 0.6)
          const a = Math.pow(u, 0.9) * (0.5 + 0.5 * band)
          const lift = Math.pow(u, 3) * 0.7
          d[k++] = Math.min(255, lerp(tr * 0.35, tr, u * band) + 255 * lift) * a
          d[k++] = Math.min(255, lerp(tg * 0.35, tg, u * band) + 255 * lift) * a
          d[k++] = Math.min(255, lerp(tb * 0.35, tb, u * band) + 255 * lift) * a
          d[k++] = 255 * a
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
