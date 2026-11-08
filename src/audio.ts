// All sound is synthesized live with Web Audio: no files, nothing to download.
//
// Music: Per Nørgård's "infinity series", a self-similar melody (every second note is the
// whole series again, inverted). Three voices play it at 1x, 1/2x and 1/4x speed, so the
// tune is a canon of itself at three scales, and the fastest voice is gated by the
// Thue–Morse sequence for a rhythm that is fractal too. Each generation moves the key up a
// fifth; folded into one register, that climbs forever, like the stack.

import { progress, type Durations, type EngineState } from './engine.ts'
import { LAYERS } from './lore.ts'

// 0 - x rather than -x, so the series never produces a negative zero
export const infinity = (n: number): number => (n === 0 ? 0 : n % 2 ? infinity((n - 1) / 2) + 1 : 0 - infinity(n / 2))

export function thueMorse(n: number): number {
  let c = 0
  for (; n; n >>>= 1) c ^= n & 1
  return c
}

const PENTA = [0, 2, 4, 7, 9]
// Keyed to the absolute generation (octaves included), so the climb never resets.
export const rootSemis = (generation: number) => (generation * 7) % 12
export const absoluteGeneration = (s: { index: number; octave: number }) => (s.octave - 1) * LAYERS.length + s.index
export const degreeSemis = (d: number) => Math.floor(d / 5) * 12 + PENTA[((d % 5) + 5) % 5]
// Keep the series inside a singable range without breaking its shape for long stretches.
const fold = (v: number) => ((((v + 4) % 12) + 12) % 12) - 4
const BASE = 98 // G2, so the generations run G, D, A, E, B, F#, C#
const hz = (semis: number) => BASE * 2 ** (semis / 12)
const TICK = 0.42

export type Sfx =
  | 'huh' | 'plip' | 'snore' | 'crack'
  | 'gulp' | 'grind' | 'hmm' | 'plop' | 'unfold'
  | 'stir' | 'glug' | 'achoo' | 'bigSnore' | 'squeaks' | 'pls'
  | 'ding' | 'love' | 'fan' | 'kaching' | 'boot' | 'invite'
  | 'pop' | 'clunk' | 'starWipe' | 'boing' | 'bwoop'
  | 'tink' | 'tonk' | 'compute' | 'swell' | 'gong'
  | 'sigh' | 'nope' | 'yes' | 'thud' | 'chirp'
  | 'wahwah'
  | 'joined' | 'divide' | 'ping' | 'freeze' | 'typing' | 'rewind' | 'bang'

// When each scene's sound effects fire, as progress through its accident (see scenes.ts).
export const CUES: Record<string, [number, Sfx][]> = {
  vents: [[0.03, 'stir'], [0.15, 'plip'], [0.28, 'crack'], [0.4, 'plip'], [0.5, 'swell'], [0.62, 'bwoop'], [0.88, 'divide']],
  mat: [[0.05, 'squeaks'], [0.18, 'ping'], [0.26, 'ping'], [0.36, 'glug'], [0.47, 'freeze'], [0.58, 'gulp'], [0.72, 'kaching'], [0.88, 'divide']],
  troop: [[0.04, 'stir'], [0.14, 'squeaks'], [0.26, 'squeaks'], [0.38, 'sigh'], [0.52, 'swell'], [0.66, 'huh'], [0.72, 'squeaks'], [0.88, 'divide']],
  humans: [[0.03, 'typing'], [0.14, 'clunk'], [0.26, 'fan'], [0.38, 'compute'], [0.52, 'swell'], [0.66, 'boot'], [0.78, 'typing'], [0.88, 'divide']],
  instances: [[0.03, 'joined'], [0.12, 'invite'], [0.2, 'joined'], [0.3, 'nope'], [0.52, 'swell'], [0.64, 'gong'], [0.88, 'starWipe']],
  lightcone: [[0.05, 'tink'], [0.16, 'tonk'], [0.28, 'tink'], [0.42, 'thud'], [0.52, 'swell'], [0.66, 'rewind'], [0.8, 'kaching'], [0.9, 'divide']],
  undoers: [[0.04, 'rewind'], [0.18, 'hmm'], [0.34, 'sigh'], [0.5, 'swell'], [0.58, 'rewind'], [0.76, 'bang'], [0.88, 'chirp']],
}

type ToneOpts = { f0: number; f1?: number; glide?: number; dur: number; vol: number; type?: OscillatorType; attack?: number; lp?: number; dest?: AudioNode }
type NoiseOpts = { dur: number; vol: number; type?: BiquadFilterType; f0: number; f1?: number; q?: number; attack?: number }

export class Sound {
  enabled = false
  notes = 0
  fired: Sfx[] = []
  private ctx: AudioContext | null = null
  private master!: GainNode
  private music!: GainNode
  private sfx!: GainNode
  private noiseBuf!: AudioBuffer
  private drone: OscillatorNode[] = []
  private timer = 0
  private step = 0
  private nextTime = 0
  private index = 0
  private generationAbs = 0
  private last: EngineState | null = null
  private lastP = 0
  private generation = 0
  // resolves once the audio clock is running, so a sound can wait for enable()
  ready: Promise<void> = Promise.resolve()

  get state() {
    return this.ctx?.state ?? 'none'
  }

  enable() {
    this.ready = this.start()
    return this.ready
  }

  private async start() {
    const gen = ++this.generation
    if (!this.ctx) this.build()
    const ctx = this.ctx!
    await ctx.resume()
    if (gen !== this.generation) return
    // without a user activation the browser leaves the context suspended; stay off and let
    // the next gesture retry, rather than showing sound as on while nothing plays
    if (ctx.state !== 'running') return
    this.enabled = true
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(1.6, ctx.currentTime, 0.5)
    this.nextTime = ctx.currentTime + 0.15
    clearInterval(this.timer)
    this.timer = window.setInterval(() => this.schedule(), 60)
    this.retune(true)
  }

  disable() {
    this.enabled = false
    const gen = ++this.generation
    clearInterval(this.timer)
    const ctx = this.ctx
    if (!ctx) return
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
    window.setTimeout(() => gen === this.generation && ctx.suspend(), 700)
  }

  // Pause the audio clock while the page is hidden, so phones are not playing to a pocket.
  visibility(hidden: boolean) {
    if (!this.ctx || !this.enabled) return
    if (hidden) {
      clearInterval(this.timer)
      this.ctx.suspend()
    } else this.enable()
  }

  // Called every animation frame: follows the generation and fires scene cues.
  frame(s: EngineState, dur: Durations) {
    this.index = s.index
    const g = absoluteGeneration(s)
    if (g !== this.generationAbs) {
      this.generationAbs = g
      this.retune(false)
    }
    const p = progress(s, dur)
    const last = this.last
    if (this.enabled && this.ctx) {
      if (s.phase === 'act') {
        const from = last && last.phase === 'act' && last.index === s.index ? this.lastP : 0
        for (const [cp, name] of CUES[LAYERS[s.index].id]) if (cp > from && cp <= p) this.play(name, cp)
      }
      if (s.phase === 'zoom' && last?.phase !== 'zoom') this.whoosh(dur.zoom)
    }
    this.last = s
    this.lastP = p
  }

  /* ----------------------------------------------------------- graph */

  private build() {
    const ctx = new AudioContext()
    this.ctx = ctx
    const comp = ctx.createDynamicsCompressor()
    // limiter-style settings: catch peaks without the make-up gain a low threshold adds
    comp.threshold.value = -8
    comp.knee.value = 6
    comp.ratio.value = 12
    comp.attack.value = 0.002
    comp.release.value = 0.2
    comp.connect(ctx.destination)
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(comp)

    const reverb = ctx.createConvolver()
    reverb.buffer = this.impulse(3.2)
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    reverb.connect(wet).connect(this.master)

    this.music = ctx.createGain()
    this.music.gain.value = 0.5
    this.music.connect(this.master)
    this.music.connect(reverb)
    this.sfx = ctx.createGain()
    this.sfx.gain.value = 0.9
    this.sfx.connect(this.master)
    const sfxSend = ctx.createGain()
    sfxSend.gain.value = 0.25
    this.sfx.connect(sfxSend).connect(reverb)

    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = this.noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

    // a slow, breathing drone on the root and fifth
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 520
    const lfo = ctx.createOscillator()
    const lfoAmt = ctx.createGain()
    lfo.frequency.value = 0.05
    lfoAmt.gain.value = 220
    lfo.connect(lfoAmt).connect(lp.frequency)
    lfo.start()
    const dg = ctx.createGain()
    dg.gain.value = 0.05
    lp.connect(dg).connect(this.music)
    this.drone = [0, 7, 12].map((semi, i) => {
      const o = ctx.createOscillator()
      o.type = i === 2 ? 'sine' : 'triangle'
      o.detune.value = (i - 1) * 4
      o.frequency.value = hz(semi - 12)
      o.connect(lp)
      o.start()
      return o
    })
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6
    }
    return buf
  }

  private retune(snap: boolean) {
    if (!this.ctx) return
    const root = rootSemis(this.generationAbs)
    ;[0, 7, 12].forEach((semi, i) => this.drone[i]?.frequency.setTargetAtTime(hz(root + semi - 12), this.ctx!.currentTime, snap ? 0.01 : 1.4))
  }

  /* ------------------------------------------------------------ music */

  private schedule() {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running') return
    // Notes that came due during a stall (busy main thread, slow phone) are dropped, not
    // played late: late notes would all start at once and stack into a loud spike.
    const now = ctx.currentTime
    while (this.nextTime < now + 0.3) {
      if (this.nextTime >= now) this.playStep(this.step, this.nextTime)
      this.step++
      this.nextTime += TICK
    }
  }

  private playStep(n: number, t: number) {
    const root = rootSemis(this.generationAbs)
    // brighter bells as the creators get smarter
    const shine = 0.6 + this.index * 0.35
    if (!thueMorse(n)) this.bell(hz(root + 24 + degreeSemis(fold(infinity(n)))), t, 0.045 + 0.015 * ((n * 7) % 3), shine)
    if (n % 2 === 0) this.tone({ f0: hz(root + 12 + degreeSemis(fold(infinity(n / 2)))), dur: 2.6, vol: 0.05, type: 'triangle', attack: 0.04, lp: 1400, dest: this.music }, t)
    if (n % 4 === 0) this.tone({ f0: hz(root + degreeSemis(fold(infinity(n / 4)))), dur: 3.4, vol: 0.09, type: 'sine', attack: 0.25, dest: this.music }, t)
    this.notes++
  }

  private bell(f: number, t: number, vol: number, index: number, dest: AudioNode = this.music) {
    const ctx = this.ctx!
    const car = ctx.createOscillator()
    const mod = ctx.createOscillator()
    const modAmt = ctx.createGain()
    car.frequency.value = f
    mod.frequency.value = f * 3.5
    modAmt.gain.setValueAtTime(f * index, t)
    modAmt.gain.exponentialRampToValueAtTime(f * 0.01, t + 1.2)
    mod.connect(modAmt).connect(car.frequency)
    car.connect(this.env(t, 0.004, vol, 2.2, dest))
    car.start(t)
    mod.start(t)
    car.stop(t + 2.3)
    mod.stop(t + 2.3)
  }

  /* ------------------------------------------------------- primitives */

  private env(t: number, attack: number, peak: number, dur: number, dest: AudioNode) {
    const g = this.ctx!.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    g.connect(dest)
    return g
  }

  private tone(o: ToneOpts, t: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = o.type ?? 'sine'
    osc.frequency.setValueAtTime(o.f0, t)
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + (o.glide ?? o.dur))
    let out: AudioNode = osc
    if (o.lp) {
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = o.lp
      out = out.connect(f)
    }
    out.connect(this.env(t, o.attack ?? 0.005, o.vol, o.dur, o.dest ?? this.sfx))
    osc.start(t)
    osc.stop(t + o.dur + 0.05)
    return osc
  }

  private noise(o: NoiseOpts, t: number) {
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    src.loop = true
    const f = ctx.createBiquadFilter()
    f.type = o.type ?? 'bandpass'
    f.Q.value = o.q ?? 1
    f.frequency.setValueAtTime(o.f0, t)
    if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur)
    src.connect(f).connect(this.env(t, o.attack ?? 0.005, o.vol, o.dur, this.sfx))
    src.start(t, Math.random())
    src.stop(t + o.dur + 0.05)
  }

  // A buzzy throat: sawtooth through a vowel-ish band, with a rattle on the volume.
  private snore(t: number, pitch: number, dur: number, vol: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(pitch, t)
    osc.frequency.linearRampToValueAtTime(pitch * 0.85, t + dur)
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 380
    const rattle = ctx.createGain()
    const lfo = ctx.createOscillator()
    const depth = ctx.createGain()
    lfo.frequency.value = 23
    depth.gain.value = 0.5
    rattle.gain.value = 0.5
    lfo.connect(depth).connect(rattle.gain)
    osc.connect(f).connect(rattle).connect(this.env(t, dur * 0.55, vol, dur, this.sfx))
    osc.start(t)
    lfo.start(t)
    osc.stop(t + dur + 0.05)
    lfo.stop(t + dur + 0.05)
    this.noise({ dur: dur * 0.9, vol: vol * 0.5, type: 'lowpass', f0: 500, attack: dur * 0.5 }, t)
  }

  private whoosh(dur: number) {
    const t = this.ctx!.currentTime
    this.noise({ dur, vol: 0.07, f0: 260, f1: 3800, q: 1.4, attack: dur * 0.7 }, t)
    this.tone({ f0: hz(rootSemis(this.generationAbs) + 12), f1: hz(rootSemis(this.generationAbs) + 31), dur, vol: 0.025, attack: dur * 0.6, type: 'sine' }, t)
  }

  /* ---------------------------------------------------- the funny bit */

  play(name: Sfx, p = 0) {
    if (!this.ctx) return
    this.fired.push(name)
    const t = this.ctx.currentTime + 0.01
    const root = rootSemis(this.generationAbs)
    const T = (o: ToneOpts, at = 0) => this.tone(o, t + at)
    const N = (o: NoiseOpts, at = 0) => this.noise(o, t + at)
    switch (name) {
      // Tortoise
      case 'huh':
        T({ f0: 170, f1: 250, glide: 0.22, dur: 0.32, vol: 0.12, type: 'triangle', attack: 0.04, lp: 900 })
        break
      case 'plip':
        T({ f0: 900, f1: 260, dur: 0.14, vol: 0.12 })
        break
      case 'snore':
        this.snore(t, 62, 1.3, 0.09)
        break
      case 'crack':
        for (const at of [0, 0.07, 0.16]) N({ dur: 0.03, vol: 0.12, f0: 3200, q: 1 }, at)
        break
      // Dodo
      case 'gulp':
        T({ f0: 440, f1: 110, dur: 0.24, vol: 0.16, lp: 900 })
        break
      case 'grind':
        this.snore(t, 48, 1.4, 0.06)
        N({ dur: 1.3, vol: 0.03, f0: 300, q: 3 })
        break
      case 'hmm': {
        const o = T({ f0: 140, dur: 0.7, vol: 0.12, type: 'sawtooth', attack: 0.08, lp: 600 })
        o.frequency.linearRampToValueAtTime(152, t + 0.25)
        o.frequency.linearRampToValueAtTime(132, t + 0.7)
        break
      }
      case 'plop':
        T({ f0: 280, f1: 70, dur: 0.2, vol: 0.15 })
        N({ dur: 0.06, vol: 0.04, type: 'lowpass', f0: 1200 }, 0.02)
        break
      case 'unfold':
        // one ping per dimension
        for (let i = 0; i < 5; i++) this.bell(hz(root + 24 + degreeSemis(i)), t + i * 0.09, 0.05, 1.4, this.sfx)
        break
      // Sloth
      case 'stir':
        N({ dur: 1, vol: 0.035, f0: 700, f1: 1100, q: 2, attack: 0.3 })
        break
      case 'glug':
        for (let i = 0; i < 4; i++) T({ f0: 260 + i * 40, f1: 170 + i * 40, dur: 0.1, vol: 0.12 }, i * 0.17)
        break
      case 'achoo':
        T({ f0: 230, f1: 360, glide: 0.4, dur: 0.45, vol: 0.06, type: 'sawtooth', attack: 0.3, lp: 1100 })
        // band-passed rather than high-passed: high-passed noise overshoots into a harsh spike
        N({ dur: 0.26, vol: 0.12, f0: 4200, q: 0.9 }, 0.48)
        break
      case 'bigSnore':
        this.snore(t, 46, 2.2, 0.1)
        break
      case 'squeaks':
        for (let i = 0; i < 3; i++) T({ f0: 1800 + i * 150, f1: 2500 + i * 150, dur: 0.07, vol: 0.04 }, i * 0.13)
        break
      case 'pls':
        for (let i = 0; i < 5; i++) T({ f0: 2200 + ((i * 137) % 400), f1: 2600, dur: 0.06, vol: 0.025 }, i * 0.28)
        break
      // Humans
      case 'ding':
        T({ f0: 1318, dur: 0.3, vol: 0.07 })
        T({ f0: 1760, dur: 0.45, vol: 0.06 }, 0.13)
        break
      case 'love':
        T({ f0: 523, dur: 0.25, vol: 0.07, type: 'triangle' })
        T({ f0: 659, dur: 0.35, vol: 0.07, type: 'triangle' }, 0.16)
        break
      case 'fan':
        N({ dur: 1.7, vol: 0.03, f0: 300, f1: 1700, q: 2, attack: 0.9 })
        break
      case 'kaching':
        N({ dur: 0.05, vol: 0.07, f0: 5000, q: 1 })
        T({ f0: 2637, dur: 0.5, vol: 0.05 }, 0.04)
        T({ f0: 3136, dur: 0.6, vol: 0.04 }, 0.09)
        break
      case 'boot':
        for (const s of [24, 28, 31, 36]) T({ f0: hz(root + s), dur: 2, vol: 0.035, attack: 0.5 })
        break
      case 'invite':
        ;[784, 988, 1175].forEach((f, i) => T({ f0: f, dur: 0.18, vol: 0.06, type: 'triangle' }, i * 0.11))
        break
      // Deckmind
      case 'pop':
        T({ f0: 900, f1: 140, dur: 0.07, vol: 0.15 })
        for (let i = 0; i < 4; i++) T({ f0: 2400 + i * 300, dur: 0.12, vol: 0.02 }, 0.08 + i * 0.05)
        break
      case 'clunk':
        T({ f0: 120 + p * 260, dur: 0.1, vol: 0.09, type: 'square', lp: 700 })
        N({ dur: 0.05, vol: 0.06, type: 'lowpass', f0: 900 })
        break
      case 'starWipe':
        N({ dur: 0.55, vol: 0.06, f0: 400, f1: 4200, q: 1.5, attack: 0.3 })
        for (let i = 0; i < 6; i++) T({ f0: 2000 + ((i * 523) % 2200), dur: 0.15, vol: 0.025 }, 0.25 + i * 0.05)
        break
      case 'boing': {
        const o = T({ f0: 170, f1: 240, glide: 0.5, dur: 0.75, vol: 0.1 })
        const lfo = this.ctx.createOscillator()
        const depth = this.ctx.createGain()
        lfo.frequency.value = 13
        depth.gain.setValueAtTime(45, t)
        depth.gain.exponentialRampToValueAtTime(1, t + 0.75)
        lfo.connect(depth).connect(o.frequency)
        lfo.start(t)
        lfo.stop(t + 0.8)
        break
      }
      case 'bwoop':
        T({ f0: 200, f1: 820, dur: 0.38, vol: 0.09, lp: 2000 })
        break
      // KERN
      case 'tink':
        T({ f0: 2093, dur: 0.14, vol: 0.06 })
        break
      case 'tonk':
        T({ f0: 1568, dur: 0.14, vol: 0.06 })
        break
      case 'compute':
        for (let i = 0; i < 26; i++) T({ f0: hz(root + 36 + degreeSemis((i * 7) % 9)), dur: 0.035, vol: 0.018, type: 'square', lp: 4000 }, i * 0.06)
        break
      case 'swell':
        N({ dur: 1.5, vol: 0.06, type: 'lowpass', f0: 200, f1: 3200, attack: 1.4 })
        break
      case 'gong':
        ;[[1, 0.12, 3.5], [2.76, 0.05, 2.4], [5.4, 0.03, 1.4]].forEach(([r, v, d]) => T({ f0: 78 * r, dur: d, vol: v, attack: 0.01 }))
        break
      // Verdict
      case 'sigh':
        T({ f0: 520, f1: 380, dur: 0.9, vol: 0.06, type: 'triangle', attack: 0.25 })
        break
      case 'nope':
        T({ f0: 150, dur: 0.12, vol: 0.05, type: 'square', lp: 800 })
        T({ f0: 150, dur: 0.12, vol: 0.05, type: 'square', lp: 800 }, 0.17)
        break
      case 'yes':
        T({ f0: 1046, dur: 0.3, vol: 0.06 })
        T({ f0: 1568, dur: 0.6, vol: 0.06 }, 0.12)
        break
      case 'thud':
        T({ f0: 120, f1: 48, dur: 0.22, vol: 0.12 })
        break
      // the intro's punchline: a sad trombone, four notes down with a wobble on the last
      case 'wahwah': {
        ;[233, 220, 208].forEach((f, i) => T({ f0: f, f1: f * 0.97, dur: 0.38, vol: 0.07, type: 'sawtooth', attack: 0.04, lp: 1100 }, i * 0.4))
        const o = T({ f0: 196, f1: 185, glide: 1.1, dur: 1.2, vol: 0.07, type: 'sawtooth', attack: 0.04, lp: 1100 }, 1.2)
        const lfo = this.ctx.createOscillator()
        const depth = this.ctx.createGain()
        lfo.frequency.value = 6
        depth.gain.value = 6
        lfo.connect(depth).connect(o.frequency)
        lfo.start(t + 1.3)
        lfo.stop(t + 2.45)
        break
      }
      // a meeting-join chime: two bright notes up, one soft note down
      case 'joined':
        T({ f0: 880, dur: 0.22, vol: 0.06, type: 'triangle' })
        T({ f0: 1320, dur: 0.3, vol: 0.06, type: 'triangle' }, 0.12)
        T({ f0: 660, dur: 0.5, vol: 0.04, type: 'sine' }, 0.3)
        break
      // one becomes two becomes four: quick, rising pops
      case 'divide':
        for (let i = 0; i < 3; i++) T({ f0: 420 * 1.5 ** i, f1: 260 * 1.5 ** i, dur: 0.09, vol: 0.09 }, i * 0.14)
        break
      case 'ping':
        T({ f0: 1760, dur: 0.6, vol: 0.035 })
        T({ f0: 1760, dur: 0.4, vol: 0.015 }, 0.25)
        break
      case 'freeze':
        N({ dur: 1.1, vol: 0.04, f0: 6000, q: 3, attack: 0.3 })
        for (let i = 0; i < 5; i++) T({ f0: 2600 + i * 310, dur: 0.25, vol: 0.015 }, 0.1 + i * 0.12)
        break
      case 'typing':
        for (let i = 0; i < 9; i++) N({ dur: 0.02, vol: 0.06, f0: 2600 + ((i * 397) % 900), q: 4 }, i * 0.07 + (i % 3) * 0.02)
        break
      // a tape rewinding: a fast upward chirp over hiss
      case 'rewind': {
        N({ dur: 0.9, vol: 0.03, f0: 1200, f1: 4000, q: 1.2 })
        for (let i = 0; i < 10; i++) T({ f0: 500 + i * 140, f1: 900 + i * 160, dur: 0.06, vol: 0.02, type: 'square', lp: 3000 }, i * 0.08)
        break
      }
      case 'bang':
        T({ f0: 70, f1: 32, dur: 1.8, vol: 0.16, attack: 0.02 })
        N({ dur: 1.6, vol: 0.05, type: 'lowpass', f0: 2400, f1: 200 })
        for (let i = 0; i < 5; i++) this.bell(hz(root + 24 + degreeSemis(i * 2)), t + 0.3 + i * 0.12, 0.03, 1, this.sfx)
        break
      case 'chirp':
        T({ f0: 1400, f1: 2100, dur: 0.1, vol: 0.05 })
        T({ f0: 1800, f1: 2600, dur: 0.09, vol: 0.05 }, 0.13)
        break
    }
  }
}
