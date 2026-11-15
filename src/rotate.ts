// Everything that changes each time round the loop. Every loop draws a fresh heckle for each
// level, a different cause on the sign, a different first word for each new slowdown, heavier
// traffic, a shifted accent colour and a nudged sky; rotate.ts is the one place that decides
// them, from the loop number and a salt per visit, so two visits do not match either.

import { rng } from './draw.ts'
import { CAUSE, CAUSES_EARLY, CAUSES_LATE, GRUMBLES, HECKLES, KEVIN, LESSONS, SAYINGS, type Heckle } from './minutes.ts'

let salt = Math.floor(Math.random() * 1e6)

// Tests pin the salt so the pick is reproducible.
export function setSalt(s: number) {
  salt = s
}

// A heckle from the margin of this level, on this loop. `skip` asks for another.
export function heckleFor(id: string, loop: number, skip = 0): Heckle {
  const list = HECKLES[id] ?? []
  if (!list.length) return ['Kevin', '']
  // Kevin explains himself once, to anyone who has been round often enough to have earned it
  if (id === 'machines' && loop >= KEVIN_TELLS && skip === 0) return KEVIN
  const r = rng(salt + loop * 7919 + id.charCodeAt(0) * 131 + id.length)
  // a shuffled walk through the list, so "another" never repeats until all of them are used
  const order = list.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return list[order[skip % order.length]]
}

// By the third time round the stack has learned something.
export const LEARNED = 3
export const KEVIN_TELLS = 5

// What the sign over the last pile-up gives as the cause of the delay. Loop 1 keeps the
// canon's, loop 2 is an excuse, and from the third on somebody has worked it out.
export function causeFor(loop: number): string {
  if (loop <= 1) return CAUSE
  const pool = loop >= LEARNED ? CAUSES_LATE : CAUSES_EARLY
  const r = rng(salt + loop * 104729)
  return pool[Math.floor(r() * pool.length)] ?? CAUSE
}

// The first thing a new slowdown says. The five lines are in order, one per loop; after
// that it wanders among the later ones and never goes back to the first.
export function sayingFor(id: string, loop: number): string {
  const list = SAYINGS[id] ?? ['']
  if (loop <= list.length) return list[Math.max(0, loop - 1)]
  const r = rng(salt + loop * 31337 + id.length)
  return list[2 + Math.floor(r() * (list.length - 2))]
}

// What the traffic says when it is made to brake: each in turn, and round again.
export function grumbleFor(id: string, n: number): string {
  const list = GRUMBLES[id] ?? ['?']
  return list[((n % list.length) + list.length) % list.length]
}

// What the first card of the loop says, from loop 3 on (loop 2 has the long one).
export function lessonFor(loop: number): string {
  if (loop < 3) return ''
  return LESSONS[Math.min(LESSONS.length - 1, loop - 3)]
}

// How many more cars every road starts with: the traffic is a little heavier each time
// round, up to a point, so the slowdowns form sooner.
export const headStart = (loop: number) => Math.min(4, Math.max(0, loop - 1)) * 2

// From the third loop, one car on every road keeps a gap.
export const calmLoop = (loop: number) => loop >= LEARNED

/* ------------------------------------------------------------------ colour */

function toHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function fromHsl(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')
}

// Each loop turns every level's accent a little way round the colour wheel, never more than
// HUE_RANGE degrees either side of the canon's, so a level always looks like itself. The
// offsets step by the golden ratio, which never lands on the same one twice. Loop 1 is the
// canon's palette exactly.
export const HUE_RANGE = 30
export function hueShift(loop: number): number {
  if (loop <= 1) return 0
  const f = ((loop - 1) * 0.6180339887) % 1
  return (f - 0.5) * 2 * HUE_RANGE
}
export function accentFor(hex: string, loop: number): string {
  if (loop <= 1) return hex
  const [h, s, l] = toHsl(hex)
  return fromHsl((h + hueShift(loop) + 360) % 360, s, l)
}
