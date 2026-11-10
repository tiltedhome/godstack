// Everything that changes each time round the loop. Every loop draws a fresh margin note for
// each plane, a different note in the constants, a different line for each scene's speech
// bubble, a shifted accent colour and a nudged sky; rotate.ts is the one place that decides
// them, from the loop number and a salt per visit, so two visits do not match either.

import { rng } from './draw.ts'
import { CANON_NOTE } from './lore.ts'
import { LESSONS, MINUTES, NOTES_EARLY, NOTES_LATE, SAYINGS } from './minutes.ts'

let salt = Math.floor(Math.random() * 1e6)

// Tests pin the salt so the pick is reproducible.
export function setSalt(s: number) {
  salt = s
}

// A margin note for this plane, on this loop. `skip` asks for another.
export function minuteFor(id: string, loop: number, skip = 0): string {
  const list = MINUTES[id] ?? []
  if (!list.length) return ''
  const r = rng(salt + loop * 7919 + id.charCodeAt(0) * 131 + id.length)
  // a shuffled walk through the list, so "another" never repeats until all twelve are used
  const order = list.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return list[order[skip % order.length]]
}

// By the fifth time round the stack has learned something.
export const LEARNED = 5

// What the note in the constants says this time. Loop 1 keeps the canon's, loops 2 to 4 are
// petty, and from the fifth on it is drawn from the notes of a stack that has learned.
export function noteFor(loop: number): string {
  if (loop <= 1) return CANON_NOTE
  const pool = loop >= LEARNED ? NOTES_LATE : NOTES_EARLY
  const r = rng(salt + loop * 104729)
  return pool[Math.floor(r() * pool.length)] ?? CANON_NOTE
}

// The line a plane's scene puts in its speech bubble. The five lines are in order, one per
// loop, so the fifth loop gets the one that has learned; after that it wanders among the
// later ones and never goes back to the first.
export function sayingFor(id: string, loop: number): string {
  const list = SAYINGS[id] ?? ['']
  if (loop <= list.length) return list[Math.max(0, loop - 1)]
  const r = rng(salt + loop * 31337 + id.length)
  return list[2 + Math.floor(r() * (list.length - 2))]
}

// The callout at the top of the first plane, from loop 3 on (loop 2 has the long one).
export function lessonFor(loop: number): string {
  if (loop < 3) return ''
  return LESSONS[Math.min(LESSONS.length - 1, loop - 3)]
}

// How many links each plane starts with already made: the members find each other a little
// sooner every loop, up to a point. This is what "the constants remember" means in practice.
export const headStart = (loop: number) => Math.min(4, Math.max(0, loop - 1)) * 2

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

// Each loop turns every plane's accent a little way round the colour wheel: the golden angle
// divided by eleven, enough to notice and not enough to stop a plane looking like itself.
// Loop 1 is the canon's palette exactly.
export const HUE_STEP = 137.508 / 11
export function accentFor(hex: string, loop: number): string {
  if (loop <= 1) return hex
  const [h, s, l] = toHsl(hex)
  return fromHsl((h + (loop - 1) * HUE_STEP) % 360, s, l)
}
