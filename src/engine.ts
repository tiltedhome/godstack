// The animation state machine, kept pure so it can be unit tested.
//   idle --(tap or autoplay)--> act --> hold --> zoom --> next layer's idle

export type Phase = 'idle' | 'act' | 'hold' | 'zoom'

export interface EngineState {
  index: number
  octave: number
  phase: Phase
  t: number // seconds spent in the current phase
}

export interface Durations {
  autoIdle: number
  act: number
  hold: number
  zoom: number
}

export const DUR: Durations = { autoIdle: 2.2, act: 7.6, hold: 1.1, zoom: 1.8 }
export const REDUCED_DUR: Durations = { ...DUR, zoom: 0.6 }

export const initial = (index = 0, octave = 1): EngineState => ({ index, octave, phase: 'idle', t: 0 })

export function step(s: EngineState, dt: number, autoplay: boolean, dur: Durations, n: number): EngineState {
  const t = s.t + dt
  switch (s.phase) {
    case 'idle':
      return autoplay && t >= dur.autoIdle ? { ...s, phase: 'act', t: 0 } : { ...s, t }
    case 'act':
      return t >= dur.act ? { ...s, phase: 'hold', t: 0 } : { ...s, t }
    case 'hold':
      return t >= dur.hold ? { ...s, phase: 'zoom', t: 0 } : { ...s, t }
    case 'zoom': {
      if (t < dur.zoom) return { ...s, t }
      const index = (s.index + 1) % n
      return { index, octave: index === 0 ? s.octave + 1 : s.octave, phase: 'idle', t: 0 }
    }
  }
}

// The main button: start the accident, or skip to the end of it.
export function trigger(s: EngineState): EngineState {
  if (s.phase === 'idle') return { ...s, phase: 'act', t: 0 }
  if (s.phase === 'act') return { ...s, phase: 'hold', t: 0 }
  return s
}

// Jump straight into the zoom, skipping the accident.
export function advance(s: EngineState): EngineState {
  return s.phase === 'zoom' ? s : { ...s, phase: 'zoom', t: 0 }
}

export function back(s: EngineState, n: number): EngineState {
  if (s.index === 0 && s.octave === 1) return initial(0, 1)
  return s.index === 0 ? initial(n - 1, s.octave - 1) : initial(s.index - 1, s.octave)
}

// How far through the accident the scene is drawn: 0 before it starts, 1 once it has happened.
export function progress(s: EngineState, dur: Durations): number {
  if (s.phase === 'idle') return 0
  if (s.phase === 'act') return Math.min(1, s.t / dur.act)
  return 1
}
