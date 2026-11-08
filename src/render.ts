import { clamp, easeInOut, easeOut, lerp, rgba, rng, seg, type Ctx } from './draw.ts'
import { progress, type Durations, type EngineState } from './engine.ts'
import { chapter, roman, versesFor, type Layer } from './lore.ts'
import type { Scene } from './scenes.ts'
import { formatLogIQ } from './format.ts'
import { JULIA_C, JuliaSky, hexToRgb, type Complex } from './fractal.ts'
import { drawHyper, tierDimension, type Spin } from './hyper.ts'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

// How much deeper each layer sits inside its parent's creation.
const ZOOM = 18
// A clock reading where every creature has its eyes open.
const FROZEN_TIME = 1
const FELL = '"IM Fell English", Georgia, "Times New Roman", serif'
const DISPLAY = '"Fraunces", "Iowan Old Style", Georgia, serif'
const MONO = '"IBM Plex Mono", ui-monospace, monospace'
const TAU = Math.PI * 2

interface VerseLine {
  text: string
  verse: number
  num?: string
}

interface Ripple {
  x: number
  y: number
  t0: number
  color: string
}

export class Renderer {
  private ctx: Ctx
  private dpr = 1
  private W = 0
  private H = 0
  private stage: Rect = { x: 0, y: 0, w: 1, h: 1 }
  private target: Rect = { x: 0, y: 0, w: 1, h: 1 }
  private stars: { x: number; y: number; r: number; ph: number }[]
  private verseCache = new Map<string, VerseLine[]>()
  private canvas: HTMLCanvasElement
  private scenes: Scene[]
  private layers: Layer[]
  private sky = new JuliaSky()
  private skyFrame = 0
  private skyKey = ''
  private ripples: Ripple[] = []
  // the hypercube's attitude: dragged by hand, nudged by the phone's tilt, with a little inertia
  spin: Spin = { yaw: 0, pitch: 0 }
  spinVel: Spin = { yaw: 0, pitch: 0 }
  tilt: [number, number] = [0, 0]
  private lastTime = 0

  constructor(canvas: HTMLCanvasElement, scenes: Scene[], layers: Layer[]) {
    this.canvas = canvas
    this.scenes = scenes
    this.layers = layers
    this.ctx = canvas.getContext('2d')!
    const r = rng(42)
    this.stars = Array.from({ length: 170 }, () => ({ x: r(), y: r(), r: 0.3 + r() * r() * 1.5, ph: r() * 6.28 }))
  }

  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.W = window.innerWidth
    this.H = window.innerHeight
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
  }

  setStage(r: Rect, snap = false) {
    this.target = r
    if (snap) this.stage = { ...r }
  }

  // Screen pixels to a scene's own units (its short side is 200, origin at the stage center).
  toScene(px: number, py: number): [number, number] {
    const { stage } = this
    const k = Math.min(stage.w, stage.h) / 215
    return [(px - (stage.x + stage.w / 2)) / k, (py - (stage.y + stage.h / 2)) / k]
  }

  ripple(px: number, py: number, color: string) {
    this.ripples.push({ x: px, y: py, t0: this.lastTime, color })
  }

  frame(s: EngineState, now: number, dur: Durations, reduced: boolean) {
    const { ctx, dpr } = this
    // With reduced motion the idle wobbles, spins and blinks hold still; the story
    // still advances because scenes are driven by progress, not the clock.
    const time = reduced ? FROZEN_TIME : now
    const dt = this.lastTime ? Math.min(0.1, now - this.lastTime) : 0
    this.lastTime = now
    const st = this.stage
    // the stage glides to its new place, except with reduced motion, where it snaps
    for (const k of ['x', 'y', 'w', 'h'] as const) st[k] = reduced ? this.target[k] : lerp(st[k], this.target[k], 0.18)
    // inertia on the hand-spun hypercube
    this.spin.yaw += this.spinVel.yaw * dt
    this.spin.pitch += this.spinVel.pitch * dt
    const decay = Math.pow(0.08, dt)
    this.spinVel.yaw *= decay
    this.spinVel.pitch *= decay
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const n = this.scenes.length
    const cur = s.index
    const next = (cur + 1) % n
    const p = progress(s, dur)
    if (s.phase !== 'zoom') {
      this.gradient(cur, 1)
      this.julia(JULIA_C[cur], this.layers[cur].palette.accent, 1, time, reduced, 1)
      this.starfield(time, 0, reduced)
      this.hyper(cur, p, 0, time, 1)
      this.scripture(cur, s.octave, time, s.phase === 'idle' ? -1 : p, 1)
      this.scene(cur, time, p, [0, 0], 1, 1)
      this.ripplesDraw(now)
      this.hud(cur, s.phase === 'idle' ? 0 : p, 1)
      this.dial(cur, p, s.octave, 0, 1)
      return
    }
    const raw = clamp(s.t / dur.zoom)
    const u = easeInOut(raw)
    this.gradient(cur, 1)
    this.gradient(next, u)
    const c: Complex = [lerp(JULIA_C[cur][0], JULIA_C[next][0], u), lerp(JULIA_C[cur][1], JULIA_C[next][1], u)]
    this.julia(c, u < 0.5 ? this.layers[cur].palette.accent : this.layers[next].palette.accent, 1 + raw * 0.8, time, reduced, 1)
    this.starfield(time, reduced ? 0 : Math.sin(Math.PI * raw), reduced)
    // the cube is swept into its next dimension; after the Undoers, a point sweeps into a line
    this.hyper(cur, 1, u, time, 1)
    this.scripture(cur, s.octave, time, 1, 1 - u)
    this.scripture(next, next === 0 ? s.octave + 1 : s.octave, time, -1, u)
    if (reduced) {
      this.scene(cur, time, 1, [0, 0], 1, 1 - u)
      this.scene(next, time, 0, [0, 0], 1, u)
      this.dial(cur, 1, s.octave, u, 1)
      return
    }
    // Fly into the focus point of the current scene; the next scene is already sitting
    // there at 1/ZOOM scale, so it grows to fill the stage as we arrive. The focus point's
    // on-screen offset shrinks linearly, so it never drifts off-screen as the zoom grows.
    const f = this.scenes[cur].focus
    const z1 = Math.pow(ZOOM, u)
    const off: [number, number] = [(f[0] * (1 - u)) / z1, (f[1] * (1 - u)) / z1]
    const c1: [number, number] = [f[0] - off[0], f[1] - off[1]]
    const c2: [number, number] = [-off[0] * ZOOM, -off[1] * ZOOM]
    this.scene(cur, time, 1, c1, z1, 1 - seg(raw, 0.5, 0.95))
    this.scene(next, time, 0, c2, z1 / ZOOM, seg(raw, 0.05, 0.6))
    this.fold(cur, raw)
    this.ripplesDraw(now)
    this.dial(cur, 1, s.octave, u, 1)
  }

  private scene(i: number, time: number, p: number, c: [number, number], z: number, a: number) {
    if (a <= 0.002) return
    const { ctx, dpr, stage } = this
    const k = (Math.min(stage.w, stage.h) / 215) * z
    const cx = stage.x + stage.w / 2
    const cy = stage.y + stage.h / 2
    ctx.save()
    ctx.globalAlpha = a
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (cx - c[0] * k), dpr * (cy - c[1] * k))
    this.scenes[i].draw(ctx, time, p)
    ctx.restore()
  }

  /* ------------------------------------------------------------ dimensions */

  // The tier's hypercube, turning behind the scene. extrude > 0 sweeps it into the next
  // dimension (the zoom); the Undoers' bang folds theirs back into a point.
  private hyper(i: number, p: number, extrude: number, time: number, a: number) {
    const { ctx, stage } = this
    const last = i === this.scenes.length - 1
    const collapse = last ? seg(p, 0.74, 0.86) : 0
    let d = tierDimension(i, p)
    if (last && extrude > 0) d = 0
    const r = Math.min(stage.w, stage.h) * (0.3 + 0.02 * d)
    const cx = stage.x + stage.w / 2 + this.tilt[0] * 14
    const cy = stage.y + stage.h * 0.46 + this.tilt[1] * 10
    const spin = { yaw: this.spin.yaw + this.tilt[0] * 0.35, pitch: this.spin.pitch + this.tilt[1] * 0.35 }
    const accent = this.layers[i].palette.accent
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    drawHyper(ctx, { d, extrude, collapse: extrude === 0 ? collapse : 0, t: time, spin, cx, cy, r, color: accent, alpha: 0.42 * a })
    ctx.restore()
  }

  // The dimension dial: a ring of ten ticks in the corner of the stage. The arc fills as the
  // stack climbs, one tick per dimension; each completed universe leaves a thin ring inside.
  private dial(i: number, p: number, octave: number, zoomU: number, a: number) {
    const { ctx, stage } = this
    const r = 23
    const cx = stage.x + stage.w - r - 14
    const cy = stage.y + r + 10
    const accent = this.layers[i].palette.accent
    const d0 = tierDimension(i, p)
    const dNext = i === this.scenes.length - 1 ? 10 : tierDimension(i + 1, 0)
    const d = lerp(d0, dNext, zoomU)
    const a0 = (-Math.PI * 5) / 6 - Math.PI / 2 // ten o'clock, going clockwise through 300°
    const ang = (k: number) => a0 + (k / 10) * ((TAU * 5) / 6)
    ctx.save()
    ctx.globalAlpha = a
    ctx.lineCap = 'round'
    for (let u = 1; u < Math.min(octave, 5); u++) {
      ctx.beginPath()
      ctx.arc(cx, cy, r - 5 - u * 3, ang(0), ang(10))
      ctx.strokeStyle = rgba(accent, 0.22)
      ctx.lineWidth = 1
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(cx, cy, r, ang(0), ang(10))
    ctx.strokeStyle = rgba('#ffffff', 0.14)
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, r, ang(0), ang(d))
    ctx.strokeStyle = rgba(accent, 0.85)
    ctx.lineWidth = 2.2
    ctx.stroke()
    for (let k = 0; k <= 10; k++) {
      const t = ang(k)
      const lit = k <= d + 0.01
      ctx.beginPath()
      ctx.arc(cx + Math.cos(t) * r, cy + Math.sin(t) * r, lit ? 1.9 : 1.1, 0, TAU)
      ctx.fillStyle = lit ? accent : 'rgba(255,255,255,.35)'
      ctx.fill()
    }
    const tip = ang(d)
    ctx.beginPath()
    ctx.arc(cx + Math.cos(tip) * r, cy + Math.sin(tip) * r, 3.2, 0, TAU)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `italic 500 15px ${DISPLAY}`
    ctx.fillText(`${Math.round(d)}D`, cx, cy - 1)
    ctx.font = `500 7.5px ${MONO}`
    ctx.fillStyle = 'rgba(255,255,255,.5)'
    ctx.fillText('PLANE', cx, cy + 10)
    ctx.restore()
  }

  // During the zoom a ring sweeps out from the focus, ticked like the dial: the fold.
  private fold(i: number, raw: number) {
    const { ctx, stage } = this
    const cx = stage.x + stage.w / 2
    const cy = stage.y + stage.h / 2
    const R = Math.max(stage.w, stage.h) * easeOut(raw) * 0.9
    const a = Math.sin(raw * Math.PI) * 0.6
    if (R < 2 || a <= 0.01) return
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = this.layers[i].palette.accent
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, TAU)
    ctx.stroke()
    ctx.beginPath()
    for (let k = 0; k < 60; k++) {
      const t = (k / 60) * TAU + raw
      const len = k % 6 === 0 ? 10 : 4
      ctx.moveTo(cx + Math.cos(t) * R, cy + Math.sin(t) * R)
      ctx.lineTo(cx + Math.cos(t) * (R - len), cy + Math.sin(t) * (R - len))
    }
    ctx.stroke()
    ctx.restore()
  }

  // Taps leave a ripple: three rings, each cut into more pieces than the last.
  private ripplesDraw(now: number) {
    const { ctx } = this
    this.ripples = this.ripples.filter((r) => now - r.t0 < 1)
    for (const r of this.ripples) {
      const age = now - r.t0
      ctx.save()
      ctx.globalAlpha = (1 - age) * 0.8
      ctx.strokeStyle = r.color
      ctx.lineWidth = 1.2
      for (let k = 0; k < 3; k++) {
        const rad = (age * 120 + 6) * (1 + k * 0.45)
        ctx.setLineDash(k === 0 ? [] : [rad * (0.5 / (k * 3)), rad * (0.5 / (k * 3))])
        ctx.beginPath()
        ctx.arc(r.x, r.y, rad, age * 2 * k, age * 2 * k + TAU)
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  /* -------------------------------------------------------------- scripture */

  // Faint verses from the Book of Upward Delegation behind each scene. The verse the
  // animation is acting out glows a little brighter; none of it competes with the creatures.
  private scripture(i: number, octave: number, time: number, p: number, a: number) {
    if (a <= 0.01) return
    const { ctx, stage } = this
    const size = Math.round(Math.min(23, Math.max(15, stage.w / 22)))
    const lh = size * 1.34
    const maxW = Math.min(stage.w * 0.86, size * 30)
    const ch = chapter(i, octave)
    const lines = this.wrapVerses(i, octave, ch, size, maxW)
    const head = size * 2.2
    const total = head + lines.length * lh
    const x0 = stage.x + (stage.w - maxW) / 2
    let y = stage.y + (stage.h - total) / 2 + Math.sin(time * 0.06) * size * 0.5
    const live = p < 0 ? -1 : Math.min(2, Math.floor(p * 3))
    const accent = this.layers[i].palette.accent
    ctx.save()
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillStyle = accent
    ctx.globalAlpha = 0.14 * a
    ctx.font = `${Math.round(size * 0.62)}px ${FELL}`
    ctx.fillText(`THE BOOK OF UPWARD DELEGATION  ·  CHAPTER ${roman(ch)}`, x0, y + size)
    y += head
    for (const line of lines) {
      ctx.globalAlpha = (line.verse === live ? 0.21 : 0.095) * a
      let x = x0
      if (line.num) {
        ctx.font = `${Math.round(size * 0.55)}px ${FELL}`
        ctx.fillText(line.num, x, y - size * 0.32)
        x += ctx.measureText(line.num + ' ').width
      }
      ctx.font = `${size}px ${FELL}`
      ctx.fillText(line.text, x, y)
      y += lh
    }
    ctx.restore()
  }

  // A quiet readout of the algorithm: how many members, how connected, how long.
  private hud(i: number, p: number, a: number) {
    const { ctx, stage } = this
    const L = this.layers[i]
    // the real mean degree of the network drawn on screen: 2 × active edges / nodes
    const k = this.scenes[i].graph.meanDegree(p)
    // the clock runs exponentially, so 10¹⁰⁰ years counts up as visibly as 70
    const done = seg(p, 0, 0.66)
    const years = done <= 0 ? '0' : formatLogIQ(Math.log10(Math.max(1, L.tookYears)) * done)
    const lines = [L.members, `⟨k⟩ ${k.toFixed(2)}${k >= 1 ? '  giant component' : ''}`, `t ${years} yr`]
    ctx.save()
    ctx.globalAlpha = 0.5 * a
    ctx.fillStyle = L.palette.accent
    ctx.font = `500 10.5px ${MONO}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    lines.forEach((ln, n) => ctx.fillText(ln, stage.x + 16, stage.y + 6 + n * 14))
    ctx.restore()
  }

  private wrapVerses(i: number, octave: number, ch: number, size: number, maxW: number): VerseLine[] {
    const key = `${i}|${octave}|${size}|${Math.round(maxW)}`
    const hit = this.verseCache.get(key)
    if (hit) return hit
    const { ctx } = this
    const out: VerseLine[] = []
    versesFor(i, octave).forEach((verse, v) => {
      const num = `${ch}:${v + 1}`
      ctx.font = `${Math.round(size * 0.55)}px ${FELL}`
      let room = maxW - ctx.measureText(num + ' ').width
      ctx.font = `${size}px ${FELL}`
      let line = ''
      let first = true
      for (const word of verse.split(' ')) {
        const next = line ? `${line} ${word}` : word
        if (line && ctx.measureText(next).width > room) {
          out.push({ text: line, verse: v, num: first ? num : undefined })
          first = false
          room = maxW
          line = word
        } else line = next
      }
      out.push({ text: line, verse: v, num: first ? num : undefined })
    })
    this.verseCache.set(key, out)
    return out
  }

  // Line widths depend on the web font, so re-wrap once it arrives.
  fontsChanged() {
    this.verseCache.clear()
  }

  /* ------------------------------------------------------------------- sky */

  private gradient(i: number, a: number) {
    if (a <= 0.002) return
    const { ctx, W, H, stage } = this
    const pal = this.layers[i].palette
    ctx.save()
    ctx.globalAlpha = a
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, pal.top)
    g.addColorStop(1, pal.bottom)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    const cx = stage.x + stage.w / 2
    const cy = stage.y + stage.h / 2
    const r = Math.max(stage.w, stage.h) * 0.7
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    glow.addColorStop(0, rgba(pal.accent, 0.14))
    glow.addColorStop(1, rgba(pal.accent, 0))
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  // The Julia sky, rendered small every other frame and stretched over the whole window.
  private julia(c: Complex, accent: string, zoom: number, time: number, reduced: boolean, a: number) {
    const { ctx, W, H } = this
    const w = Math.min(200, Math.max(110, Math.round(W / 6)))
    const h = Math.max(48, Math.round((w * H) / W))
    // reduced motion: render once per tier and leave it still; otherwise every second frame
    const key = `${c[0].toFixed(3)},${c[1].toFixed(3)},${w}`
    if (reduced) {
      if (key !== this.skyKey) {
        this.sky.render(c, hexToRgb(accent), w, h, zoom, 0, 0)
        this.skyKey = key
      }
    } else if ((this.skyFrame++ & 1) === 0 || zoom !== 1) this.sky.render(c, hexToRgb(accent), w, h, zoom, time, 1)
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    this.sky.blit(ctx, 0, 0, W, H, 0.6 * a)
    ctx.restore()
  }

  // Twinkling stars; during a zoom they stretch into streaks away from the stage center.
  private starfield(time: number, warp: number, reduced: boolean) {
    const { ctx, W, H, stage } = this
    const cx = stage.x + stage.w / 2
    const cy = stage.y + stage.h / 2
    ctx.save()
    ctx.lineCap = 'round'
    for (const s of this.stars) {
      const x = s.x * W
      const y = s.y * H
      const tw = reduced ? 0.7 : 0.55 + 0.45 * Math.sin(time * 1.3 + s.ph)
      if (warp > 0.02) {
        ctx.strokeStyle = `rgba(255,250,240,${0.5 * tw})`
        ctx.lineWidth = s.r
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + (x - cx) * warp * 0.18, y + (y - cy) * warp * 0.18)
        ctx.stroke()
      } else {
        ctx.fillStyle = `rgba(255,250,240,${0.6 * tw})`
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, 6.283)
        ctx.fill()
      }
    }
    ctx.restore()
  }
}
