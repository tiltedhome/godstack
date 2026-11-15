// The state machine, kept pure so it can be unit tested.
//
// Phantom Jam plays itself, at reading pace. Each level has five beats, and a beat stays on
// screen for as long as its text takes to read (or until the reader steps on, or for ever if
// they have paused). The last beat of a level is the pile-up: the new thing takes a few
// seconds to form in the jam, and when it has, the next step is the dive into it.
//
//   read(beat 0) → read(beat 1) → … → read(beat 4, the pile-up) → zoom → next level, beat 0

export type Phase = 'read' | 'zoom'

export interface EngineState {
  index: number // which level
  octave: number // which loop
  beat: number // which of the five beats
  from: number // the beat we just came from
  phase: Phase
  t: number // seconds spent in the current beat or zoom
}

export interface Durations {
  settle: number // how long a new beat takes to ease in
  leap: number // how long the new thing takes to form in the jam
  zoom: number // how long the dive into it takes
}

export const NBEATS = 5
export const LAST = NBEATS - 1
export const DUR: Durations = { settle: 1.1, leap: 5, zoom: 2.4 }
export const REDUCED_DUR: Durations = { ...DUR, zoom: 0.6 }

export const initial = (index = 0, octave = 1, beat = 0): EngineState => ({ index, octave, beat, from: beat, phase: 'read', t: 0 })

// How long a beat is held, in seconds: a brisk 250 words a minute, plus a moment to look at
// the road. A reader can always step on sooner, or pause.
export const readingTime = (chars: number) => 2 + chars / 24

// One step of time. `dwell` is how long the current beat should be held while playing.
export function step(s: EngineState, dt: number, playing: boolean, dur: Durations, n: number, dwell: number): EngineState {
  const t = s.t + dt
  if (s.phase === 'zoom') {
    if (t < dur.zoom) return { ...s, t }
    const index = (s.index + 1) % n
    return initial(index, index === 0 ? s.octave + 1 : s.octave)
  }
  if (!playing) return { ...s, t }
  return t >= holdFor(s, dur, dwell) ? forward({ ...s, t: Math.max(t, s.beat === LAST ? dur.leap : 0) }, dur) : { ...s, t }
}

// How long this beat is held in all: the pile-up is never cut short of forming.
export const holdFor = (s: EngineState, dur: Durations, dwell: number) => (s.beat === LAST ? Math.max(dwell, dur.leap + 2) : dwell)

// How far through its hold the current beat is, 0 to 1, for the countdown on the button.
export const progress = (s: EngineState, dur: Durations, dwell: number) =>
  s.phase === 'zoom' ? 1 : Math.min(1, s.t / holdFor(s, dur, dwell))

// The main button. Next beat; on the pile-up, first let it finish, then dive.
export function forward(s: EngineState, dur: Durations): EngineState {
  if (s.phase === 'zoom') return s
  if (s.beat < LAST) return { ...s, beat: s.beat + 1, from: s.beat, t: 0 }
  if (s.t < dur.leap) return { ...s, t: dur.leap }
  return { ...s, phase: 'zoom', t: 0 }
}

// Back one beat; from a level's first beat, back to the end of the level before.
export function backward(s: EngineState, n: number, dur: Durations): EngineState {
  if (s.phase === 'zoom') return { ...s, phase: 'read', t: dur.leap }
  if (s.beat > 0) return { ...s, beat: s.beat - 1, from: s.beat, t: dur.settle }
  if (s.index === 0 && s.octave === 1) return s
  const index = (s.index + n - 1) % n
  return { index, octave: s.index === 0 ? s.octave - 1 : s.octave, beat: LAST, from: LAST, phase: 'read', t: dur.leap }
}

// Skip the rest of this level and dive into the next one.
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
  age: number // seconds into the current beat
  leap: number // 0 → 1 as the new thing forms, on the last beat
  dive: number // 0 → 1 through the dive into it
}

export function frame(s: EngineState, dur: Durations): Frame {
  if (s.phase === 'zoom') return { beat: LAST, from: LAST, u: 1, age: dur.leap, leap: 1, dive: clamp(s.t / dur.zoom) }
  return {
    beat: s.beat,
    from: s.from,
    u: ease(clamp(s.t / dur.settle)),
    age: s.t,
    leap: s.beat === LAST ? clamp(s.t / dur.leap) : 0,
    dive: 0,
  }
}

// True once the new thing has formed and the next press will dive into it.
export const leapt = (s: EngineState, dur: Durations) => s.phase === 'read' && s.beat === LAST && s.t >= dur.leap
