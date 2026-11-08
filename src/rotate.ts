// The jokes that change each time round. Every universe draws a fresh line from each
// collective's minutes, and the Rewinder leaves a different note in the constants, so the
// loop never repeats itself exactly. A salt per visit keeps two visits from matching either.

import { rng } from './draw.ts'
import { MINUTES, NOTES } from './minutes.ts'

let salt = Math.floor(Math.random() * 1e6)

// Tests pin the salt so the pick is reproducible.
export function setSalt(s: number) {
  salt = s
}

// A line from the minutes for this collective, in this universe. `skip` asks for another.
export function minuteFor(id: string, universe: number, skip = 0): string {
  const list = MINUTES[id] ?? []
  if (!list.length) return ''
  const r = rng(salt + universe * 7919 + id.charCodeAt(0) * 131 + id.length)
  // a shuffled walk through the list, so "another" never repeats until all twelve are used
  const order = list.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return list[order[skip % order.length]]
}

// What the note in the constants says this time. Universe 1 keeps the canon's.
export function noteFor(universe: number): string {
  if (universe <= 1) return 'fewer meetings'
  const others = NOTES.filter((n) => n !== 'fewer meetings')
  const r = rng(salt + universe * 104729)
  return others[Math.floor(r() * others.length)] ?? 'fewer meetings'
}
