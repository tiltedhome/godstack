import { clamp, easeInOut, easeOut, lerp, rgba, rng, seg, type Ctx } from './draw.ts'
import { LAST, NBEATS, frame as engineFrame, type Durations, type EngineState, type Frame } from './engine.ts'
import { BEATS, TRAITS, TRAIT_BEAT, TRAIT_LABELS, type Layer, type Verdict } from './lore.ts'
import { stage as sceneStage, tags, type Scene } from './scenes.ts'
import { JuliaSky, hexToRgb, juliaFor, type Complex } from './fractal.ts'
import { accentFor } from './rotate.ts'
import { GLLayer } from './gl.ts'
import { setPainter } from './paint.ts'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

// How much smaller each level sits inside the next one up.
export const ZOOM = 18
// Scenes are drawn in units; the stage's short side is this many of them.
export const UNIT = 195
// A clock reading where every creature has its eyes open.
const FROZEN_TIME = 1
const DISPLAY = '"Fraunces", "Iowan Old Style", Georgia, serif'
const MONO = '"IBM Plex Mono", ui-monospace, monospace'
const TAU = Math.PI * 2

export interface Spin {
  yaw: number
  pitch: number
}

// Where the camera is during the pull-back between planes, in scene units. `u` runs 0 to 1.
// The plane being left (inner) shrinks to 1/ZOOM and comes to rest on the socket of the
// plane being entered (outer), which starts ZOOM times too big and centred on that socket.
export function pullBack(sock: [number, number], u: number) {
  const zo = Math.pow(ZOOM, 1 - u)
  const zi = zo / ZOOM
  return {
    outer: { c: [sock[0] - (sock[0] * u) / zo, sock[1] - (sock[1] * u) / zo] as [number, number], z: zo },
    inner: { c: [(-sock[0] * u) / zi, (-sock[1] * u) / zi] as [number, number], z: zi },
  }
}

interface Ripple {
  x: number
  y: number
  t0: number
  color: string
  word: string
}

export class Renderer {
  private ctx: Ctx
  private dpr = 1
  private W = 0
  private H = 0
  private stage: Rect = { x: 0, y: 0, w: 1, h: 1 }
  private target: Rect = { x: 0, y: 0, w: 1, h: 1 }
  private stars: { x: number; y: number; r: number; ph: number }[]
  private canvas: HTMLCanvasElement
  private scenes: Scene[]
  private layers: Layer[]
  private sky = new JuliaSky()
  private map = new JuliaSky()
  private skyFrame = 0
  private skyKey = ''
  private ripples: Ripple[] = []
  // the form's attitude: dragged by hand, nudged by the phone's tilt, with a little inertia
  spin: Spin = { yaw: 0, pitch: 0 }
  spinVel: Spin = { yaw: 0, pitch: 0 }
  tilt: [number, number] = [0, 0]
  private lastTime = 0
  // the WebGL layer under the 2D canvas, or null where the browser cannot give us one
  gl: GLLayer | null = null

  constructor(canvas: HTMLCanvasElement, scenes: Scene[], layers: Layer[], glCanvas?: HTMLCanvasElement | null) {
    this.canvas = canvas
    if (glCanvas) {
      const layer = new GLLayer(glCanvas)
      if (layer.ok) this.gl = layer
      else glCanvas.hidden = true
    }
    setPainter(this.gl)
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
    this.gl?.resize(this.W, this.H, window.devicePixelRatio || 1)
  }

  setStage(r: Rect, snap = false) {
    this.target = r
    if (snap) this.stage = { ...r }
  }

  // Screen pixels to a scene's own units (its short side is 200, origin at the stage center).
  toScene(px: number, py: number): [number, number] {
    const { stage } = this
    const k = Math.min(stage.w, stage.h) / UNIT
    return [(px - (stage.x + stage.w / 2)) / k, (py - (stage.y + stage.h / 2)) / k]
  }

  // A tap leaves rings and a word for what the tap did on this plane.
  ripple(px: number, py: number, color: string, word = '') {
    this.ripples.push({ x: px, y: py, t0: this.lastTime, color, word })
  }

  private accent(i: number, loop: number) {
    return accentFor(this.layers[i].palette.accent, loop)
  }

  frame(s: EngineState, now: number, dur: Durations, reduced: boolean) {
    const { ctx, dpr } = this
    // With reduced motion the idle wobbles, spins and blinks hold still; the story still
    // advances because scenes are driven by the beat, not the clock.
    const time = reduced ? FROZEN_TIME : now
    const dt = this.lastTime ? Math.min(0.1, now - this.lastTime) : 0
    this.lastTime = now
    const st = this.stage
    // the stage glides to its new place, except with reduced motion, where it snaps
    for (const k of ['x', 'y', 'w', 'h'] as const) st[k] = reduced ? this.target[k] : lerp(st[k], this.target[k], 0.18)
    // inertia on the hand-spun form
    this.spin.yaw += this.spinVel.yaw * dt
    this.spin.pitch = clamp(this.spin.pitch + this.spinVel.pitch * dt, -1.1, 1.1)
    const decay = Math.pow(0.08, dt)
    this.spinVel.yaw *= decay
    this.spinVel.pitch *= decay
    sceneStage.yaw = this.spin.yaw + this.tilt[0] * 0.35
    sceneStage.pitch = this.spin.pitch + this.tilt[1] * 0.3
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const gl = this.gl
    if (gl) {
      ctx.clearRect(0, 0, this.W, this.H)
      gl.pace(dt)
      gl.begin()
    }
    const glow: [number, number] = [st.x + st.w / 2, st.y + st.h / 2]
    const pal = (i: number) => this.layers[i].palette
    const n = this.scenes.length
    const cur = s.index
    const next = (cur + 1) % n
    const loop = s.octave
    const nextLoop = next === 0 ? loop + 1 : loop
    const f = engineFrame(s, dur)
    const accent = this.accent(cur, loop)
    tags.length = 0
    if (s.phase !== 'zoom') {
      const home = this.home(cur, loop)
      if (gl) gl.sky({ top: pal(cur).top, bottom: pal(cur).bottom, top2: pal(cur).top, bottom2: pal(cur).bottom, blend: 0, tint: accent, c: home.c, center: home.center, span: home.span, onMap: home.map, time, drift: reduced ? 0 : 1, glow })
      else {
        this.gradient(cur, accent, 1)
        if (home.map) this.atlas(home.center, accent, home.span, reduced ? 0 : time, 1, !reduced || this.skyKey !== 'map')
        else this.julia(home.c, accent, time, reduced, 1)
        if (home.map) this.skyKey = 'map'
      }
      this.starfield(time, 0, reduced)
      this.scene(cur, time, f, [0, 0], 1, 1, accent)
      // the level below stays in view, as a detail, while this one is introduced
      this.detail(cur, loop, time, s.beat === 0 ? 1 : s.beat === 1 ? 1 - f.u : 0)
      this.drawTags()
      this.ripplesDraw(now)
      this.hud(cur, f, accent)
      this.ouroboros(cur, cur + ((s.beat + f.u) / NBEATS) * 0.9, loop, accent, 1)
      gl?.end()
      return
    }
    const raw = clamp(s.t / dur.zoom)
    const u = easeInOut(raw)
    const accentNext = this.accent(next, nextLoop)
    const h0 = this.home(cur, loop)
    const h1 = this.home(next, nextLoop)
    const half = u < 0.5
    const sky = { top: pal(cur).top, bottom: pal(cur).bottom, top2: pal(next).top, bottom2: pal(next).bottom, blend: u, tint: half ? accent : accentNext, time, glow }
    if (!gl) {
      this.gradient(cur, accent, 1)
      this.gradient(next, accentNext, u)
    }
    // the next level, as it will be when we arrive: its first beat, not yet eased in
    const arriving: Frame = { beat: 0, from: 0, u: 0, link: 0, leap: 0 }
    if (reduced) {
      // no travelling: the old sky and scene fade out as the new ones fade in
      const h = half ? h0 : h1
      if (gl) gl.sky({ ...sky, c: h.c, center: h.center, span: h.span, onMap: h.map, drift: 0 })
      else if (h.map) this.atlas(h.center, half ? accent : accentNext, h.span, 0, 1, true)
      else this.julia(h.c, half ? accent : accentNext, time, true, 1)
      this.starfield(time, 0, true)
      this.scene(cur, time, f, [0, 0], 1, 1 - u, accent)
      this.scene(next, time, arriving, [0, 0], 1, u, accentNext)
      this.ouroboros(cur, cur + 0.9 + 0.1 * u, loop, half ? accent : accentNext, 1)
      gl?.end()
      return
    }
    // The sky leaves the old level's Julia set for the Mandelbrot set, which is the map of
    // all of them, crosses it from the old constant to the new, and drops into the new sky.
    // (The Structure's own sky is the whole map, so it starts or ends there.)
    const onMap = Math.max(seg(raw, 0.08, 0.3) * (1 - seg(raw, 0.7, 0.92)), h0.map * (1 - seg(raw, 0.7, 0.92)), h1.map * seg(raw, 0.08, 0.3))
    const center: Complex = [lerp(h0.center[0], h1.center[0], u), lerp(h0.center[1], h1.center[1], u)]
    const span = lerp(h0.span, h1.span, u) + 1.5 * Math.sin(Math.PI * raw) * (1 - 0.5 * (h0.map + h1.map))
    if (gl) gl.sky({ ...sky, c: raw < 0.5 ? h0.c : h1.c, center, span, onMap, drift: 1 })
    else {
      this.julia(raw < 0.5 ? h0.c : h1.c, raw < 0.5 ? accent : accentNext, time, false, 1 - onMap, (this.skyFrame & 1) === 0)
      this.atlas(center, half ? accent : accentNext, span, time, onMap, (this.skyFrame & 1) === 1)
    }
    this.starfield(time, Math.sin(Math.PI * raw), reduced)
    // Pull back: the level being left shrinks to 1/ZOOM and turns out to be one unit of
    // the level above, which was there all along, ZOOM times too big to see.
    const cam = pullBack(this.scenes[next].socket(time), u)
    this.scene(next, time, arriving, cam.outer.c, cam.outer.z, easeInOut(seg(raw, 0.38, 0.86)), accentNext)
    this.scene(cur, time, f, cam.inner.c, cam.inner.z, 1, accent)
    tags.length = 0
    this.fold(accent, raw)
    this.ripplesDraw(now)
    this.ouroboros(cur, cur + 0.9 + 0.1 * u, loop, half ? accent : accentNext, 1)
    gl?.end()
  }

  // Each level's own sky. The Structure's is the Mandelbrot set itself, whole: one line of
  // definition and no end of detail. Every other level's is the Julia set for its constant.
  private home(i: number, loop: number): { c: Complex; center: Complex; span: number; map: number } {
    const c = juliaFor(i, loop)
    return i === 0 ? { c, center: [-0.62, 0], span: 2.9, map: 1 } : { c, center: c, span: 0.45, map: 0 }
  }

  private scene(i: number, time: number, f: Frame, c: [number, number], z: number, a: number, accent: string) {
    if (a <= 0.002) return
    const { ctx, dpr, stage } = this
    const k = (Math.min(stage.w, stage.h) / UNIT) * z
    const cx = stage.x + stage.w / 2
    const cy = stage.y + stage.h / 2
    ctx.save()
    ctx.globalAlpha = a
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (cx - c[0] * k), dpr * (cy - c[1] * k))
    this.gl?.xf(k, cx - c[0] * k, cy - c[1] * k, a)
    this.scenes[i].draw(ctx, time, f, accent)
    ctx.restore()
  }

  /* ---------------------------------------------------------------- scales */

  // The plane below is still there after the pull-back: it sits on one member of this plane,
  // at 1/ZOOM scale, inside a small reticle, until this plane's own story gets going.
  private detail(i: number, loop: number, time: number, a: number) {
    if (a <= 0.01) return
    const n = this.scenes.length
    const prev = (i + n - 1) % n
    const prevLoop = i === 0 ? loop - 1 : loop
    if (prevLoop < 1) return
    const { ctx, stage } = this
    const sock = this.scenes[i].socket(time)
    const kept = tags.length
    this.scene(prev, time, { beat: LAST, from: LAST, u: 1, link: 1, leap: 1 }, [-sock[0] * ZOOM, -sock[1] * ZOOM], 1 / ZOOM, a, this.accent(prev, prevLoop))
    tags.length = kept
    const k = Math.min(stage.w, stage.h) / UNIT
    const x = stage.x + stage.w / 2 + sock[0] * k
    const y = stage.y + stage.h / 2 + sock[1] * k
    const r = (UNIT / ZOOM) * k * 0.62
    ctx.save()
    ctx.globalAlpha = a * 0.75
    ctx.strokeStyle = this.accent(i, loop)
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.font = `500 9px ${MONO}`
    ctx.fillStyle = this.accent(i, loop)
    const label = `${this.layers[prev].one.toUpperCase()}, MADE BY ${this.layers[prev].short.toUpperCase()}`
    const left = x > stage.x + stage.w / 2
    ctx.textAlign = left ? 'right' : 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x + (left ? -r - 5 : r + 5), y)
    ctx.restore()
  }

  // The timeline is a snake eating its tail. The seven planes are laid round the ring from
  // the tail (the lowest plane, thin) to the head (the highest, thick), and the head meets
  // the tail at the top. `at` is how far round the story is, in planes. Every completed loop
  // leaves a ring inside the ring.
  private ouroboros(i: number, at: number, loop: number, accent: string, a: number) {
    const { ctx, stage } = this
    const n = this.scenes.length
    const r = 24
    const cx = stage.x + stage.w - r - 14
    const cy = stage.y + r + 12
    const gap = 0.2
    const ang = (k: number) => -Math.PI / 2 + gap + (k / n) * (TAU - gap * 1.6)
    ctx.save()
    ctx.globalAlpha = a
    ctx.lineCap = 'butt'
    for (let u = 1; u < Math.min(loop, 6); u++) {
      ctx.beginPath()
      ctx.arc(cx, cy, r - 6.5 - u * 2.6, 0, TAU)
      ctx.strokeStyle = rgba(accent, 0.3)
      ctx.lineWidth = 0.9
      ctx.stroke()
    }
    // the body, in short segments that thicken toward the head
    const SEG = 56
    for (let k = 0; k < SEG; k++) {
      const f = k / SEG
      const lit = f * n <= at
      ctx.beginPath()
      ctx.arc(cx, cy, r, ang(f * n) - 0.01, ang(((k + 1) / SEG) * n) + 0.01)
      ctx.strokeStyle = lit ? rgba(accent, 0.55 + 0.4 * f) : 'rgba(255,255,255,.16)'
      ctx.lineWidth = 1.2 + 3.6 * f
      ctx.stroke()
    }
    // a scale for each plane, and a brighter one where the story is now
    for (let k = 0; k < n; k++) {
      const t = ang(k + 0.5)
      ctx.beginPath()
      ctx.arc(cx + Math.cos(t) * r, cy + Math.sin(t) * r, k === i ? 2.6 : 1.1, 0, TAU)
      ctx.fillStyle = k === i ? '#fff' : k < at ? '#0b0a12' : 'rgba(255,255,255,.4)'
      ctx.fill()
    }
    // the head, biting the tail at twelve o'clock
    const h = ang(n)
    const hx = cx + Math.cos(h) * r
    const hy = cy + Math.sin(h) * r
    ctx.translate(hx, hy)
    ctx.rotate(h + Math.PI / 2)
    ctx.beginPath()
    ctx.moveTo(-3, -3.4)
    ctx.quadraticCurveTo(6.5, -4.2, 9.5, 0)
    ctx.quadraticCurveTo(6.5, 4.2, -3, 3.4)
    ctx.closePath()
    ctx.fillStyle = at >= n - 0.02 ? accent : rgba(accent, 0.75)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(3.4, -1.5, 0.9, 0, TAU)
    ctx.fillStyle = '#0b0a12'
    ctx.fill()
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `italic 500 15px ${DISPLAY}`
    ctx.fillText(this.layers[i].version, cx, cy - 2)
    ctx.font = `500 7px ${MONO}`
    ctx.fillStyle = 'rgba(255,255,255,.55)'
    ctx.fillText(`LOOP ${loop}`, cx, cy + 9)
    ctx.restore()
  }

  // During the pull-back a ring closes in on the plane being left, ticked like a dial.
  private fold(accent: string, raw: number) {
    const { ctx, stage } = this
    const cx = stage.x + stage.w / 2
    const cy = stage.y + stage.h / 2
    const R = Math.max(stage.w, stage.h) * (1 - easeOut(raw)) * 0.9
    const a = Math.sin(raw * Math.PI) * 0.6
    if (R < 2 || a <= 0.01) return
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = accent
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
    this.ripples = this.ripples.filter((r) => now - r.t0 < 2.4)
    for (const r of this.ripples) {
      const age = now - r.t0
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - age) * 0.8
      ctx.strokeStyle = r.color
      ctx.lineWidth = 1.2
      for (let k = 0; k < 3 && age < 1; k++) {
        const rad = (age * 120 + 6) * (1 + k * 0.45)
        ctx.setLineDash(k === 0 ? [] : [rad * (0.5 / (k * 3)), rad * (0.5 / (k * 3))])
        ctx.beginPath()
        ctx.arc(r.x, r.y, rad, age * 2 * k, age * 2 * k + TAU)
        ctx.stroke()
      }
      ctx.setLineDash([])
      if (r.word) {
        // what the tap did on this substrate, said plainly and left up long enough to read
        ctx.globalAlpha = Math.min(1, (2.4 - age) * 2)
        ctx.font = `500 12px ${MONO}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const w = ctx.measureText(r.word).width + 18
        const x = clamp(r.x, 8 + w / 2, this.W - 8 - w / 2)
        const y = r.y - 30 - Math.min(1, age) * 10
        ctx.fillStyle = 'rgba(10,8,16,.86)'
        ctx.beginPath()
        ctx.roundRect(x - w / 2, y - 11, w, 22, 11)
        ctx.fill()
        ctx.fillStyle = r.color
        ctx.fillText(r.word, x, y + 0.5)
      }
      ctx.restore()
    }
  }

  /* ------------------------------------------------------------------ labels */

  // The callouts a scene asked for: a ring round the thing, a line, and a label, at a size
  // that can be read on a phone whatever the scene's own scale.
  private drawTags() {
    const { ctx, stage } = this
    const k = Math.min(stage.w, stage.h) / UNIT
    const cx = stage.x + stage.w / 2
    const cy = stage.y + stage.h / 2
    const size = stage.w < 520 ? 11.5 : 13
    ctx.save()
    ctx.font = `500 ${size}px ${MONO}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    for (const tag of tags) {
      if (!tag.text) continue
      const x = cx + tag.x * k
      const y = cy + tag.y * k
      const w = ctx.measureText(tag.text).width + size * 1.5
      const h = size * 2
      const above = y - stage.y > h * 2.2
      const bx = clamp(x, stage.x + 8 + w / 2, stage.x + stage.w - 8 - w / 2)
      // keep clear of the checklist in the corner, which on a phone reaches most of the way across
      const top = stage.y + (stage.w < 520 && stage.h >= 210 ? 106 : 78) + h / 2
      const by = tag.ring ? clamp(y + (above ? -1 : 1) * (h * 0.5 + 16), top, stage.y + stage.h - 46) : clamp(y, top, stage.y + stage.h - 46)
      ctx.globalAlpha = tag.a
      if (tag.ring) {
        ctx.strokeStyle = 'rgba(255,255,255,.95)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(x, y, 7, 0, TAU)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y + (by < y ? -7 : 7))
        ctx.lineTo(bx, by + (by < y ? h / 2 : -h / 2))
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(250,247,240,.96)'
      ctx.beginPath()
      ctx.roundRect(bx - w / 2, by - h / 2, w, h, h / 2)
      ctx.fill()
      ctx.fillStyle = '#17131f'
      ctx.fillText(tag.text, bx, by + 0.5)
    }
    ctx.restore()
  }

  // Is it alive? Tegmark's test, item by item, with the one the current beat is making the
  // case for picked out.
  private hud(i: number, f: Frame, accent: string) {
    const { ctx, stage } = this
    const L = this.layers[i]
    const mark: Record<Verdict, string> = { yes: '●', partly: '◐', no: '○', moot: '–' }
    ctx.save()
    ctx.font = `500 10.5px ${MONO}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = accent
    ctx.globalAlpha = 0.55
    ctx.fillText(`LIFE ${L.version}  ·  IS IT ALIVE?`, stage.x + 16, stage.y + 6)
    // on a very short stage there is no room for the list without covering the scene
    if (stage.h >= 210) TRAITS.forEach((key, n) => {
      const on = BEATS[f.beat] === TRAIT_BEAT[key]
      ctx.globalAlpha = on ? 1 : 0.5
      ctx.fillStyle = on ? '#ffffff' : accent
      ctx.fillText(`${mark[L.traits[key][0]]} ${TRAIT_LABELS[key].toLowerCase()}`, stage.x + 16, stage.y + 22 + n * 14)
    })
    ctx.restore()
  }

  /* ------------------------------------------------------------------- sky */

  private gradient(i: number, accent: string, a: number) {
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
    glow.addColorStop(0, rgba(accent, 0.14))
    glow.addColorStop(1, rgba(accent, 0))
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  private skySize(): [number, number] {
    const { W, H } = this
    const w = Math.min(200, Math.max(110, Math.round(W / 6)))
    return [w, Math.max(48, Math.round((w * H) / W))]
  }

  // The Julia sky, rendered small every other frame and stretched over the whole window.
  private julia(c: Complex, accent: string, time: number, reduced: boolean, a: number, render?: boolean) {
    const { ctx, W, H } = this
    const [w, h] = this.skySize()
    // reduced motion: render once per plane and leave it still; otherwise every second frame
    const key = `${c[0].toFixed(4)},${c[1].toFixed(4)},${w},${accent}`
    if (reduced) {
      if (key !== this.skyKey) {
        this.sky.render(c, hexToRgb(accent), w, h, 1, 0, 0)
        this.skyKey = key
      }
    } else if (render ?? (this.skyFrame++ & 1) === 0) this.sky.render(c, hexToRgb(accent), w, h, 1, time, 1)
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    this.sky.blit(ctx, 0, 0, W, H, 0.6 * a)
    ctx.restore()
  }

  // The Mandelbrot set, centred on the constant as it travels from one plane's to the next.
  private atlas(c: Complex, accent: string, span: number, time: number, a: number, render: boolean) {
    const { ctx, W, H } = this
    this.skyFrame++
    if (a <= 0.004) return
    const [w, h] = this.skySize()
    if (render) this.map.renderMap(c, hexToRgb(accent), w, h, span, time)
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    this.map.blit(ctx, 0, 0, W, H, 0.7 * a)
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
