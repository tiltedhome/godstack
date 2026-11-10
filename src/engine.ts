// The state machine, kept pure so it can be unit tested.
//
// Substrate is read, not watched. Each level has eight beats, and a beat stays on screen
// until the reader moves on (or, with autoplay, for as long as its text takes to read). The
// last beat of a level is the leap: it plays out over a few seconds, and when it is done the
// next step is the pull-back into the level above.
//
//   read(beat 0) → read(beat 1) → … → read(beat 7, the leap) → zoom → next level, beat 0

export type Phase = 'read' | 'zoom'

export interface EngineState {
  index: number // which substrate
  octave: number // which loop
  beat: number // which of the eight questions
  from: number // the beat we just came from, so its drawing can fade out
  phase: Phase
  t: number // seconds spent in the current beat or zoom
}

export interface Durations {
  settle: number // how long a new beat takes to ease in
  leap: number // how long the leap takes to play out
  zoom: number // how long the pull-back to the next level takes
}

export const NBEATS = 8
export const LAST = NBEATS - 1
export const DUR: Durations = { settle: 1.3, leap: 6, zoom: 2.4 }
export const REDUCED_DUR: Durations = { ...DUR, zoom: 0.6 }

export const initial = (index = 0, octave = 1, beat = 0): EngineState => ({ index, octave, beat, from: beat, phase: 'read', t: 0 })

// How long a beat's text takes to read, in seconds: a relaxed 200 words a minute, plus a
// moment to look at the picture. Autoplay waits this long; a reader can always go faster.
export const readingTime = (chars: number) => 4 + chars / 17

// One step of time. `dwell` is how long the current beat should be held under autoplay.
export function step(s: EngineState, dt: number, autoplay: boolean, dur: Durations, n: number, dwell: number): EngineState {
  const t = s.t + dt
  if (s.phase === 'zoom') {
    if (t < dur.zoom) return { ...s, t }
    const index = (s.index + 1) % n
    return initial(index, index === 0 ? s.octave + 1 : s.octave)
  }
  if (!autoplay) return { ...s, t }
  const hold = dwell + (s.beat === LAST ? dur.leap : 0)
  return t >= hold ? forward({ ...s, t }, dur) : { ...s, t }
}

// The main button. Next beat; on the leap, first let it finish, then pull back.
export function forward(s: EngineState, dur: Durations): EngineState {
  if (s.phase === 'zoom') return s
  if (s.beat < LAST) return { ...s, beat: s.beat + 1, from: s.beat, t: 0 }
  if (s.t < dur.leap) return { ...s, t: dur.leap }
  return { ...s, phase: 'zoom', t: 0 }
}

// Back one beat; from a level's first beat, back to the end of the level below.
export function backward(s: EngineState, n: number, dur: Durations): EngineState {
  if (s.phase === 'zoom') return { ...s, phase: 'read', t: dur.leap }
  if (s.beat > 0) return { ...s, beat: s.beat - 1, from: s.beat, t: dur.settle }
  if (s.index === 0 && s.octave === 1) return s
  const index = (s.index + n - 1) % n
  return { index, octave: s.index === 0 ? s.octave - 1 : s.octave, beat: LAST, from: LAST, phase: 'read', t: dur.leap }
}

// Skip the rest of this level and pull back to the next one.
export function skip(s: EngineState): EngineState {
  return s.phase === 'zoom' ? s : { ...s, beat: LAST, from: LAST, phase: 'zoom', t: 0 }
}

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

// What a scene needs to draw the current moment.
export interface Frame {
  beat: number
  from: number
  u: number // 0 → 1 as the current beat eases in
  link: number // 0 → 1 across the "where it stops" beat: how joined-up the copies are
  leap: number // 0 → 1 across the leap
}

export function frame(s: EngineState, dur: Durations): Frame {
  if (s.phase === 'zoom') return { beat: LAST, from: LAST, u: 1, link: 1, leap: 1 }
  const u = ease(clamp(s.t / dur.settle))
  return {
    beat: s.beat,
    from: s.from,
    u,
    link: s.beat < LAST - 1 ? 0 : s.beat === LAST - 1 ? u : 1,
    leap: s.beat === LAST ? clamp(s.t / dur.leap) : 0,
  }
}

// True once the leap has played out and the next press will pull back.
export const leapt = (s: EngineState, dur: Durations) => s.phase === 'read' && s.beat === LAST && s.t >= dur.leap
