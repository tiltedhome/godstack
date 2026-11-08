import { clamp, easeInOut, lerp, rgba, rng, seg, type Ctx } from './draw.ts'
import { progress, type Durations, type EngineState } from './engine.ts'
import { chapter, roman, versesFor, type Layer } from './lore.ts'
import type { Scene } from './scenes.ts'
import { formatLogIQ } from './format.ts'

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

interface VerseLine {
  text: string
  verse: number
  num?: string
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

  frame(s: EngineState, now: number, dur: Durations, reduced: boolean) {
    const { ctx, dpr } = this
    // With reduced motion the idle wobbles, spins and blinks hold still; the story
    // still advances because scenes are driven by progress, not the clock.
    const time = reduced ? FROZEN_TIME : now
    const st = this.stage
    for (const k of ['x', 'y', 'w', 'h'] as const) st[k] = lerp(st[k], this.target[k], 0.18)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const n = this.scenes.length
    const cur = s.index
    const next = (cur + 1) % n
    if (s.phase !== 'zoom') {
      this.sky(cur, 1)
      this.starfield(time, 0, reduced)
      this.scripture(cur, s.octave, time, s.phase === 'idle' ? -1 : progress(s, dur), 1)
      this.scene(cur, time, progress(s, dur), [0, 0], 1, 1)
      this.hud(cur, s.phase === 'idle' ? 0 : progress(s, dur), 1)
      return
    }
    const raw = clamp(s.t / dur.zoom)
    const u = easeInOut(raw)
    this.sky(cur, 1)
    this.sky(next, u)
    this.starfield(time, reduced ? 0 : Math.sin(Math.PI * raw), reduced)
    this.scripture(cur, s.octave, time, 1, 1 - u)
    this.scripture(next, next === 0 ? s.octave + 1 : s.octave, time, -1, u)
    if (reduced) {
      this.scene(cur, time, 1, [0, 0], 1, 1 - u)
      this.scene(next, time, 0, [0, 0], 1, u)
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

  // Faint verses from the Book of Upward Accidents behind each scene. The verse the
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
    ctx.font = '500 10.5px "IBM Plex Mono", ui-monospace, monospace'
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

  private sky(i: number, a: number) {
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
