// Small canvas toolkit shared by every scene. Scenes draw in "units": the stage's
// short side is 200 units, origin at its center, y pointing down.

export type Ctx = CanvasRenderingContext2D

export const TAU = Math.PI * 2
export const DISPLAY = '"Fraunces", "Iowan Old Style", Georgia, serif'
export const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace'

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
// Progress through a sub-window [a, b] of the overall 0..1 progress.
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
export const easeIn = (x: number) => x * x * x
export const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2)
// 1 inside the window [a, b], with soft edges of width f.
export const pulse = (p: number, a: number, b: number, f = 0.03) => seg(p, a - f, a) * (1 - seg(p, b, b + f))

export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

// Multiplies opacity for everything drawn inside fn, so nested fades compose.
export function alpha(ctx: Ctx, a: number, fn: () => void) {
  if (a <= 0.002) return
  ctx.save()
  ctx.globalAlpha *= Math.min(1, a)
  fn()
  ctx.restore()
}

export function at(ctx: Ctx, x: number, y: number, s: number, rot: number, fn: () => void) {
  ctx.save()
  ctx.translate(x, y)
  if (rot) ctx.rotate(rot)
  if (s !== 1) ctx.scale(s, s)
  fn()
  ctx.restore()
}

type Fill = string | CanvasGradient

export function circle(ctx: Ctx, x: number, y: number, r: number, fill?: Fill) {
  ctx.beginPath()
  ctx.arc(x, y, Math.max(0, r), 0, TAU)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
}

export function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot = 0, fill?: Fill) {
  ctx.beginPath()
  ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
}

export function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number | number[], fill?: Fill) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
}

export function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, width: number) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.stroke()
}

export function stroke(ctx: Ctx, color: Fill, width: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
}

export function glow(ctx: Ctx, x: number, y: number, r: number, hex: string, a = 1) {
  if (r <= 0 || a <= 0) return
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, rgba(hex, 0.9 * a))
  g.addColorStop(0.35, rgba(hex, 0.35 * a))
  g.addColorStop(1, rgba(hex, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

export function text(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  size: number,
  color: string,
  font: string = DISPLAY,
  align: CanvasTextAlign = 'center',
) {
  ctx.font = `${size}px ${font}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(s, x, y)
}

// A speech bubble whose box fits its text. Returns the box width.
export function bubble(ctx: Ctx, s: string, x: number, y: number, size: number, tailX: number): number {
  ctx.font = `${size}px ${MONO}`
  const w = ctx.measureText(s).width + size * 1.6
  const h = size * 2.2
  rrect(ctx, x - w / 2, y - h / 2, w, h, h / 2, 'rgba(250,247,240,.95)')
  ctx.beginPath()
  ctx.moveTo(x + tailX - 3, y + h / 2 - 0.5)
  ctx.lineTo(x + tailX + 2, y + h / 2 + 4)
  ctx.lineTo(x + tailX + 3, y + h / 2 - 0.5)
  ctx.fill()
  text(ctx, s, x, y + 0.3, size, '#17131f', MONO)
  return w
}

export function hexPath(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3
    const px = x + Math.cos(a) * r
    const py = y + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

// A black hole with a tilted accretion disk; the back half of the disk is drawn first
// so the hole sits inside it.
export function singularity(ctx: Ctx, x: number, y: number, r: number, t: number, heat = 1) {
  if (r <= 0.05) return
  glow(ctx, x, y, r * (3 + heat * 2.5), '#ff8a4c', 0.35 + 0.4 * heat)
  const disk = (from: number, to: number) => {
    ctx.beginPath()
    ctx.ellipse(x, y, r * 2.3, r * 0.62, -0.18, from, to)
    const g = ctx.createLinearGradient(x - r * 2.3, y, x + r * 2.3, y)
    g.addColorStop(0, '#ffcf7a')
    g.addColorStop(0.5, '#fff1d0')
    g.addColorStop(1, '#ff5f87')
    stroke(ctx, g, r * 0.42)
  }
  disk(Math.PI, TAU)
  circle(ctx, x, y, r, '#020104')
  ctx.beginPath()
  ctx.arc(x, y, r * 1.04, 0, TAU)
  stroke(ctx, 'rgba(255,214,170,.85)', r * 0.13)
  disk(0, Math.PI)
  const a = t * 2.4
  const dx = Math.cos(a) * r * 2.3
  const dy = Math.sin(a) * r * 0.62
  const c = Math.cos(-0.18)
  const sn = Math.sin(-0.18)
  if (Math.sin(a) > 0) circle(ctx, x + dx * c - dy * sn, y + dx * sn + dy * c, r * 0.2, 'rgba(255,255,255,.9)')
}
